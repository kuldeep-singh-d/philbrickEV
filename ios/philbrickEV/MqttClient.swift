import Foundation
import React
import Security

@objc(MqttClient)
class MqttClient: NSObject {
  private let queue = DispatchQueue(label: "com.philbrickev.mqtt")
  private var inputStream: InputStream?
  private var outputStream: OutputStream?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(connect:resolver:rejecter:)
  func connect(
    options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async {
      do {
        self.disconnectStreams()

        guard let host = options["host"] as? String, !host.isEmpty else {
          throw MqttError.missingOption("host")
        }
        let port = options["port"] as? Int ?? 8883
        let clientId = (options["clientId"] as? String).flatMap {
          $0.isEmpty ? nil : $0
        } ?? self.createMqttClientId()
        let cleanSession = options["cleanSession"] as? Bool ?? true
        let keepAliveSeconds = options["keepAliveSeconds"] as? Int ?? 60
        let username = options["username"] as? String
        let password = options["password"] as? String

        guard let certificate = options["certificate"] as? NSDictionary else {
          throw MqttError.missingOption("certificate")
        }
        guard let certificateName = certificate["certificateName"] as? String else {
          throw MqttError.missingOption("certificateName")
        }
        let certificatePassword = certificate["certificatePassword"] as? String ?? ""

        let tlsIdentity = try self.loadIdentity(
          certificateName: certificateName,
          certificatePassword: certificatePassword
        )
        let streams = try self.openStreams(host: host, port: port, tlsIdentity: tlsIdentity)
        let connectPacket = self.buildConnectPacket(
          clientId: clientId,
          cleanSession: cleanSession,
          keepAliveSeconds: keepAliveSeconds,
          username: username,
          password: password
        )

        try self.write(connectPacket, to: streams.output)
        try self.validatePeerCertificate(
          from: streams.input,
          host: host,
          caCertificates: tlsIdentity.caCertificates
        )

        let packetType = try self.readByte(from: streams.input)
        guard packetType == 0x20 else {
          throw MqttError.protocolError("Unexpected MQTT CONNACK header: \(packetType)")
        }

        let remainingLength = try self.readRemainingLength(from: streams.input)
        guard remainingLength >= 2 else {
          throw MqttError.protocolError("Invalid MQTT CONNACK length: \(remainingLength)")
        }

        _ = try self.readByte(from: streams.input)
        let returnCode = try self.readByte(from: streams.input)
        guard returnCode == 0 else {
          throw MqttError.protocolError("MQTT connection refused with code \(returnCode)")
        }

        self.inputStream = streams.input
        self.outputStream = streams.output
        resolve(["connected": true, "clientId": clientId])
      } catch {
        self.disconnectStreams()
        reject("MQTT_CONNECT_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc(disconnect:rejecter:)
  func disconnect(
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async {
      if let output = self.outputStream {
        _ = try? self.write([0xE0, 0x00], to: output)
      }
      self.disconnectStreams()
      resolve(["connected": false])
    }
  }

  @objc(publish:resolver:rejecter:)
  func publish(
    options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async {
      do {
        guard let output = self.outputStream else {
          throw MqttError.connection("MQTT is not connected")
        }
        guard let topic = options["topic"] as? String, !topic.isEmpty else {
          throw MqttError.missingOption("publish topic")
        }
        let message = options["message"] as? String ?? ""
        let publishPacket = self.buildPublishPacket(topic: topic, message: message)

        try self.write(publishPacket, to: output)
        self.log("MQTT PUBLISH packet sent topic=\(topic) message=\(message)")
        resolve(["published": true, "topic": topic, "message": message])
      } catch {
        reject("MQTT_PUBLISH_FAILED", error.localizedDescription, error)
      }
    }
  }

  private func loadIdentity(
    certificateName: String,
    certificatePassword: String
  ) throws -> MqttTlsIdentity {
    let fileParts = certificateName.split(separator: ".", maxSplits: 1).map(String.init)
    let name = fileParts.first ?? certificateName
    let ext = fileParts.count > 1 ? fileParts[1] : "p12"

    guard let url = Bundle.main.url(forResource: name, withExtension: ext) else {
      throw MqttError.certificate("Certificate \(certificateName) was not found in the app bundle")
    }

    let data = try Data(contentsOf: url)
    let options = [kSecImportExportPassphrase as String: certificatePassword]
    var importResult: CFArray?
    let status = SecPKCS12Import(data as CFData, options as CFDictionary, &importResult)
    guard status == errSecSuccess,
          let items = importResult as? [[String: Any]],
          let importedIdentity = items.first?[kSecImportItemIdentity as String] else {
      throw MqttError.certificate("Unable to import PKCS#12 identity: \(status)")
    }

    let certificateChain = items.first?[kSecImportItemCertChain as String] as? [SecCertificate] ?? []
    let caCertificates = certificateChain
    guard !caCertificates.isEmpty else {
      throw MqttError.certificate("No CA certificate was found in \(certificateName)")
    }
    self.log("Loaded \(caCertificates.count) certificate(s) from \(certificateName)")

    return MqttTlsIdentity(
      identity: importedIdentity as! SecIdentity,
      caCertificates: caCertificates
    )
  }

  private func openStreams(
    host: String,
    port: Int,
    tlsIdentity: MqttTlsIdentity
  ) throws -> (input: InputStream, output: OutputStream) {
    var readStream: Unmanaged<CFReadStream>?
    var writeStream: Unmanaged<CFWriteStream>?
    CFStreamCreatePairWithSocketToHost(nil, host as CFString, UInt32(port), &readStream, &writeStream)

    guard let input = readStream?.takeRetainedValue() as InputStream?,
          let output = writeStream?.takeRetainedValue() as OutputStream? else {
      throw MqttError.connection("Unable to create MQTT socket streams")
    }

    let sslSettings: [String: Any] = [
      kCFStreamSSLValidatesCertificateChain as String: false,
      kCFStreamSSLCertificates as String: [tlsIdentity.identity],
      kCFStreamSSLPeerName as String: host,
    ]
    let sslSettingsKey = Stream.PropertyKey(rawValue: kCFStreamPropertySSLSettings as String)
    input.setProperty(sslSettings, forKey: sslSettingsKey)
    output.setProperty(sslSettings, forKey: sslSettingsKey)

    input.open()
    output.open()

    let deadline = Date().addingTimeInterval(15)
    while Date() < deadline {
      if let error = input.streamError ?? output.streamError {
        throw error
      }
      if input.streamStatus == .open && output.streamStatus == .open {
        return (input, output)
      }
      Thread.sleep(forTimeInterval: 0.05)
    }

    throw MqttError.connection("Timed out opening MQTT TLS streams")
  }

  private func validatePeerCertificate(
    from input: InputStream,
    host: String,
    caCertificates: [SecCertificate]
  ) throws {
    let peerCertificatesKey = Stream.PropertyKey(rawValue: "kCFStreamPropertySSLPeerCertificates")
    guard let peerCertificates = input.property(forKey: peerCertificatesKey) as? [SecCertificate],
          let leafCertificate = peerCertificates.first else {
      throw MqttError.certificate("MQTT server did not provide a certificate chain")
    }

    var trust: SecTrust?
    let createTrustStatus = SecTrustCreateWithCertificates(
      peerCertificates as CFArray,
      SecPolicyCreateBasicX509(),
      &trust
    )
    guard createTrustStatus == errSecSuccess, let trust else {
      throw MqttError.certificate("Unable to create MQTT server trust: \(createTrustStatus)")
    }

    let anchorsStatus = SecTrustSetAnchorCertificates(trust, caCertificates as CFArray)
    guard anchorsStatus == errSecSuccess else {
      throw MqttError.certificate("Unable to set MQTT CA anchors: \(anchorsStatus)")
    }
    SecTrustSetAnchorCertificatesOnly(trust, true)

    var trustError: CFError?
    guard SecTrustEvaluateWithError(trust, &trustError) else {
      throw MqttError.certificate(
        trustError.map { CFErrorCopyDescription($0) as String } ??
          "MQTT server certificate is not trusted by the bundled CA"
      )
    }

    let certificateName = SecCertificateCopySubjectSummary(leafCertificate) as String? ?? ""
    guard certificateName == host else {
      throw MqttError.certificate(
        "MQTT server certificate name \(certificateName) does not match \(host)"
      )
    }
    log("Validated MQTT server certificate \(certificateName) with bundled CA")
  }

  private func disconnectStreams() {
    inputStream?.close()
    outputStream?.close()
    inputStream = nil
    outputStream = nil
  }

  private func buildConnectPacket(
    clientId: String,
    cleanSession: Bool,
    keepAliveSeconds: Int,
    username: String?,
    password: String?
  ) -> [UInt8] {
    var payload: [UInt8] = []
    payload.appendMqttString(clientId)
    if let username {
      payload.appendMqttString(username)
    }
    if let password {
      payload.appendMqttString(password)
    }

    var flags: UInt8 = 0
    if cleanSession {
      flags |= 0x02
    }
    if username != nil {
      flags |= 0x80
    }
    if password != nil {
      flags |= 0x40
    }

    var variableHeader: [UInt8] = []
    variableHeader.appendMqttString("MQTT")
    variableHeader.append(0x04)
    variableHeader.append(flags)
    variableHeader.append(UInt8((keepAliveSeconds >> 8) & 0xFF))
    variableHeader.append(UInt8(keepAliveSeconds & 0xFF))

    let remainingLength = variableHeader.count + payload.count
    return [0x10] + encodeRemainingLength(remainingLength) + variableHeader + payload
  }

  private func buildPublishPacket(topic: String, message: String) -> [UInt8] {
    var variableHeader: [UInt8] = []
    variableHeader.appendMqttString(topic)

    let payload = Array(message.utf8)
    let remainingLength = variableHeader.count + payload.count
    return [0x30] + encodeRemainingLength(remainingLength) + variableHeader + payload
  }

  private func encodeRemainingLength(_ length: Int) -> [UInt8] {
    var value = length
    var encoded: [UInt8] = []
    repeat {
      var digit = UInt8(value % 128)
      value /= 128
      if value > 0 {
        digit |= 0x80
      }
      encoded.append(digit)
    } while value > 0
    return encoded
  }

  private func readRemainingLength(from input: InputStream) throws -> Int {
    var multiplier = 1
    var value = 0
    var encodedByte: UInt8
    repeat {
      encodedByte = try readByte(from: input)
      value += Int(encodedByte & 127) * multiplier
      multiplier *= 128
      if multiplier > 128 * 128 * 128 {
        throw MqttError.protocolError("Malformed MQTT remaining length")
      }
    } while encodedByte & 128 != 0
    return value
  }

  private func write(_ bytes: [UInt8], to output: OutputStream) throws {
    var totalWritten = 0
    try bytes.withUnsafeBytes { buffer in
      guard let baseAddress = buffer.bindMemory(to: UInt8.self).baseAddress else {
        return
      }
      while totalWritten < bytes.count {
        let written = output.write(
          baseAddress.advanced(by: totalWritten),
          maxLength: bytes.count - totalWritten
        )
        if written < 0 {
          throw output.streamError ?? MqttError.connection("Failed to write MQTT packet")
        }
        totalWritten += written
      }
    }
  }

  private func readByte(from input: InputStream) throws -> UInt8 {
    var byte: UInt8 = 0
    let count = input.read(&byte, maxLength: 1)
    if count == 1 {
      return byte
    }
    if let error = input.streamError {
      throw error
    }
    throw MqttError.connection("MQTT socket closed while reading")
  }

  private func log(_ message: String) {
    print("[MQTT][iOS] \(message)")
  }

  private func createMqttClientId() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "HHmmssSSS"
    formatter.locale = Locale(identifier: "en_US_POSIX")
    return "ios_\(formatter.string(from: Date()))"
  }
}

private struct MqttTlsIdentity {
  let identity: SecIdentity
  let caCertificates: [SecCertificate]
}

private enum MqttError: LocalizedError {
  case certificate(String)
  case connection(String)
  case missingOption(String)
  case protocolError(String)

  var errorDescription: String? {
    switch self {
    case .certificate(let message), .connection(let message), .protocolError(let message):
      return message
    case .missingOption(let option):
      return "Missing MQTT option: \(option)"
    }
  }
}

private extension Array where Element == UInt8 {
  mutating func appendMqttString(_ value: String) {
    let bytes = Array(value.utf8)
    append(UInt8((bytes.count >> 8) & 0xFF))
    append(UInt8(bytes.count & 0xFF))
    append(contentsOf: bytes)
  }
}
