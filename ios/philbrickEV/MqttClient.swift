import Foundation
import React
import Security

@objc(MqttClient)
class MqttClient: RCTEventEmitter {
  private let queue = DispatchQueue(label: "com.philbrickev.mqtt")
  private let readerQueue = DispatchQueue(label: "com.philbrickev.mqtt.reader")
  private var inputStream: InputStream?
  private var outputStream: OutputStream?
  private var keepAliveTimer: DispatchSourceTimer?
  private var isReading = false
  private var nextPacketIdentifier = 1

  override static func requiresMainQueueSetup() -> Bool {
    false
  }

  override func supportedEvents() -> [String]! {
    ["MqttMessageReceived"]
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
        guard let port = options["port"] as? Int, port > 0 else {
          throw MqttError.missingOption("port")
        }
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
        self.startKeepAlive(output: streams.output, keepAliveSeconds: keepAliveSeconds)
        self.log("MQTT connection established clientId=\(clientId)")
        resolve(["connected": true, "clientId": clientId])
      } catch {
        self.disconnectStreams()
        self.log("MQTT connection failed: \(error.localizedDescription)")
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

  @objc(subscribe:resolver:rejecter:)
  func subscribe(
    options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async {
      do {
        guard let input = self.inputStream, let output = self.outputStream else {
          throw MqttError.connection("MQTT is not connected")
        }
        guard let topic = options["topic"] as? String, !topic.isEmpty else {
          throw MqttError.missingOption("subscribe topic")
        }

        let packetIdentifier = self.takeNextPacketIdentifier()
        let subscribePacket = self.buildSubscribePacket(
          packetIdentifier: packetIdentifier,
          topic: topic
        )
        try self.write(subscribePacket, to: output)
        self.startReadLoop(input: input)
        self.log("MQTT SUBSCRIBE packet sent topic=\(topic) packetId=\(packetIdentifier)")
        resolve(["subscribed": true, "topic": topic])
      } catch {
        reject("MQTT_SUBSCRIBE_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc(unsubscribe:resolver:rejecter:)
  func unsubscribe(
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
          throw MqttError.missingOption("unsubscribe topic")
        }

        let packetIdentifier = self.takeNextPacketIdentifier()
        let unsubscribePacket = self.buildUnsubscribePacket(
          packetIdentifier: packetIdentifier,
          topic: topic
        )
        try self.write(unsubscribePacket, to: output)
        self.log("MQTT UNSUBSCRIBE packet sent topic=\(topic) packetId=\(packetIdentifier)")
        resolve(["unsubscribed": true, "topic": topic])
      } catch {
        reject("MQTT_UNSUBSCRIBE_FAILED", error.localizedDescription, error)
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
      SecPolicyCreateSSL(true, host as CFString),
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

  }

  private func disconnectStreams() {
    isReading = false
    keepAliveTimer?.cancel()
    keepAliveTimer = nil
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

  private func buildSubscribePacket(packetIdentifier: Int, topic: String) -> [UInt8] {
    let variableHeader = [
      UInt8((packetIdentifier >> 8) & 0xFF),
      UInt8(packetIdentifier & 0xFF),
    ]
    var payload: [UInt8] = []
    payload.appendMqttString(topic)
    payload.append(0x00)

    let remainingLength = variableHeader.count + payload.count
    return [0x82] + encodeRemainingLength(remainingLength) + variableHeader + payload
  }

  private func buildUnsubscribePacket(packetIdentifier: Int, topic: String) -> [UInt8] {
    let variableHeader = [
      UInt8((packetIdentifier >> 8) & 0xFF),
      UInt8(packetIdentifier & 0xFF),
    ]
    var payload: [UInt8] = []
    payload.appendMqttString(topic)

    let remainingLength = variableHeader.count + payload.count
    return [0xA2] + encodeRemainingLength(remainingLength) + variableHeader + payload
  }

  private func startReadLoop(input: InputStream) {
    guard !isReading else {
      return
    }
    isReading = true

    readerQueue.async {
      while self.isReading && self.inputStream === input {
        do {
          let fixedHeader = try self.readByte(from: input)
          let remainingLength = try self.readRemainingLength(from: input)
          let packet = try self.readExact(from: input, length: remainingLength)

          switch fixedHeader & 0xF0 {
          case 0x30:
            try self.handlePublishPacket(fixedHeader: fixedHeader, packet: packet)
          case 0x90, 0xB0, 0xD0:
            break
          default:
            self.log("MQTT packet ignored type=\(fixedHeader & 0xF0)")
          }
        } catch {
          if self.isReading {
            self.log("MQTT read loop stopped: \(error.localizedDescription)")
          }
          self.isReading = false
        }
      }
    }
  }

  private func startKeepAlive(output: OutputStream, keepAliveSeconds: Int) {
    keepAliveTimer?.cancel()
    keepAliveTimer = nil

    guard keepAliveSeconds > 0 else {
      return
    }

    let interval = DispatchTimeInterval.seconds(max(1, keepAliveSeconds / 2))
    let timer = DispatchSource.makeTimerSource(queue: queue)
    timer.schedule(deadline: .now() + interval, repeating: interval)
    timer.setEventHandler { [weak self, weak output] in
      guard let self, let output, self.outputStream === output else {
        return
      }

      do {
        try self.write([0xC0, 0x00], to: output)
      } catch {
        self.log("MQTT keepalive failed: \(error.localizedDescription)")
        self.disconnectStreams()
      }
    }
    keepAliveTimer = timer
    timer.resume()
  }

  private func handlePublishPacket(fixedHeader: UInt8, packet: [UInt8]) throws {
    guard packet.count >= 2 else {
      throw MqttError.protocolError("Malformed MQTT PUBLISH packet")
    }

    let topicLength = (Int(packet[0]) << 8) | Int(packet[1])
    let topicStart = 2
    let topicEnd = topicStart + topicLength
    guard topicEnd <= packet.count else {
      throw MqttError.protocolError("Malformed MQTT PUBLISH topic")
    }

    let qos = (fixedHeader & 0x06) >> 1
    let payloadStart = topicEnd + (qos > 0 ? 2 : 0)
    guard payloadStart <= packet.count else {
      throw MqttError.protocolError("Malformed MQTT PUBLISH payload")
    }

    let topic = String(decoding: packet[topicStart..<topicEnd], as: UTF8.self)
    let message = String(decoding: packet[payloadStart...], as: UTF8.self)
    log("MQTT message received topic=\(topic) message=\(message)")
    sendEvent(
      withName: "MqttMessageReceived",
      body: ["topic": topic, "message": message]
    )
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

  private func readExact(from input: InputStream, length: Int) throws -> [UInt8] {
    var bytes = [UInt8](repeating: 0, count: length)
    var offset = 0

    while offset < length {
      let read = bytes.withUnsafeMutableBytes { buffer -> Int in
        guard let baseAddress = buffer.bindMemory(to: UInt8.self).baseAddress else {
          return 0
        }
        return input.read(
          baseAddress.advanced(by: offset),
          maxLength: length - offset
        )
      }
      if read <= 0 {
        if let error = input.streamError {
          throw error
        }
        throw MqttError.connection("MQTT socket closed while reading packet")
      }
      offset += read
    }
    return bytes
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

  private func takeNextPacketIdentifier() -> Int {
    let packetIdentifier = nextPacketIdentifier
    nextPacketIdentifier = nextPacketIdentifier == 0xFFFF ? 1 : nextPacketIdentifier + 1
    return packetIdentifier
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
