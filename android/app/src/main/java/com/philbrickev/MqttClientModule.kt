package com.philbrickev

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream
import java.io.DataOutputStream
import java.io.FileNotFoundException
import java.io.InputStream
import java.net.InetSocketAddress
import java.net.Socket
import java.net.SocketTimeoutException
import java.security.KeyStore
import java.security.cert.Certificate
import java.security.cert.CertificateException
import java.security.cert.X509Certificate
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit
import javax.net.ssl.KeyManagerFactory
import javax.net.ssl.SSLContext
import javax.net.ssl.SSLSocket
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

class MqttClientModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val executor: ExecutorService = Executors.newSingleThreadExecutor()
  private val readerExecutor: ExecutorService = Executors.newSingleThreadExecutor()
  private val keepAliveExecutor = Executors.newSingleThreadScheduledExecutor()
  private var socket: SSLSocket? = null
  private var keepAliveTask: ScheduledFuture<*>? = null
  @Volatile
  private var isReading = false
  private var nextPacketIdentifier = 1

  override fun getName(): String = "MqttClient"

  @ReactMethod
  fun connect(options: ReadableMap, promise: Promise) {
    executor.execute {
      try {
        disconnectSocket()

        val host = options.getString("host") ?: error("Missing MQTT host")
        val port = if (options.hasKey("port")) options.getInt("port") else 8883
        val clientId = options.getStringOrNull("clientId").takeUnless { it.isNullOrBlank() }
          ?: createMqttClientId()
        val cleanSession = !options.hasKey("cleanSession") || options.getBoolean("cleanSession")
        val keepAliveSeconds =
          if (options.hasKey("keepAliveSeconds")) options.getInt("keepAliveSeconds") else 60
        val username = options.getStringOrNull("username")
        val password = options.getStringOrNull("password")
        val certificate = options.getMap("certificate") ?: error("Missing certificate config")
        val certificateName =
          certificate.getString("certificateName") ?: error("Missing certificateName")
        val certificatePassword = certificate.getString("certificatePassword") ?: ""
        log("Connecting host=$host port=$port clientId=$clientId")

        val sslSocket = createSslSocket(
          certificateName = certificateName,
          certificatePassword = certificatePassword,
          host = host,
          port = port,
        )
        val connectPacket = buildConnectPacket(
          clientId = clientId,
          cleanSession = cleanSession,
          keepAliveSeconds = keepAliveSeconds,
          username = username,
          password = password,
        )

        sslSocket.outputStream.write(connectPacket)
        sslSocket.outputStream.flush()

        val input = sslSocket.inputStream
        val packetType = input.read()
        if (packetType != 0x20) {
          error("Unexpected MQTT CONNACK header: $packetType")
        }

        val remainingLength = readRemainingLength(input::read)
        if (remainingLength < 2) {
          error("Invalid MQTT CONNACK length: $remainingLength")
        }

        val ackFlags = input.read()
        val returnCode = input.read()
        if (ackFlags < 0 || returnCode < 0) {
          error("MQTT CONNACK ended unexpectedly")
        }

        if (returnCode != 0) {
          error("MQTT connection refused with code $returnCode")
        }

        socket = sslSocket
        startKeepAlive(sslSocket, keepAliveSeconds)
        log("MQTT connection established")
        promise.resolve(connectionResult(true, clientId))
      } catch (error: Throwable) {
        log("MQTT connection failed: ${error.javaClass.simpleName}: ${error.message}")
        disconnectSocket()
        promise.reject("MQTT_CONNECT_FAILED", error.message, error)
      }
    }
  }

  @ReactMethod
  fun disconnect(promise: Promise) {
    executor.execute {
      try {
        socket?.outputStream?.write(byteArrayOf(0xE0.toByte(), 0x00))
        socket?.outputStream?.flush()
      } catch (_: Throwable) {
      } finally {
        disconnectSocket()
        promise.resolve(connectionResult(false))
      }
    }
  }

  @ReactMethod
  fun publish(options: ReadableMap, promise: Promise) {
    executor.execute {
      try {
        val activeSocket = socket ?: error("MQTT is not connected")
        val topic = options.getString("topic")?.takeUnless { it.isBlank() }
          ?: error("Missing MQTT publish topic")
        val message = options.getString("message") ?: ""
        val publishPacket = buildPublishPacket(topic = topic, message = message)

        activeSocket.outputStream.write(publishPacket)
        activeSocket.outputStream.flush()
        log("MQTT PUBLISH packet sent topic=$topic message=$message")

        promise.resolve(
          Arguments.createMap().apply {
            putBoolean("published", true)
            putString("topic", topic)
            putString("message", message)
          },
        )
      } catch (error: Throwable) {
        log("MQTT publish failed: ${error.javaClass.simpleName}: ${error.message}")
        promise.reject("MQTT_PUBLISH_FAILED", error.message, error)
      }
    }
  }

  @ReactMethod
  fun subscribe(options: ReadableMap, promise: Promise) {
    executor.execute {
      try {
        val activeSocket = socket ?: error("MQTT is not connected")
        val topic = options.getString("topic")?.takeUnless { it.isBlank() }
          ?: error("Missing MQTT subscribe topic")
        val packetIdentifier = nextPacketIdentifier()
        val subscribePacket = buildSubscribePacket(
          packetIdentifier = packetIdentifier,
          topic = topic,
        )

        activeSocket.outputStream.write(subscribePacket)
        activeSocket.outputStream.flush()
        log("MQTT SUBSCRIBE packet sent topic=$topic packetId=$packetIdentifier")
        startReadLoop(activeSocket)

        promise.resolve(
          Arguments.createMap().apply {
            putBoolean("subscribed", true)
            putString("topic", topic)
          },
        )
      } catch (error: Throwable) {
        log("MQTT subscribe failed: ${error.javaClass.simpleName}: ${error.message}")
        promise.reject("MQTT_SUBSCRIBE_FAILED", error.message, error)
      }
    }
  }

  @ReactMethod
  fun unsubscribe(options: ReadableMap, promise: Promise) {
    executor.execute {
      try {
        val activeSocket = socket ?: error("MQTT is not connected")
        val topic = options.getString("topic")?.takeUnless { it.isBlank() }
          ?: error("Missing MQTT unsubscribe topic")
        val packetIdentifier = nextPacketIdentifier()
        val unsubscribePacket = buildUnsubscribePacket(
          packetIdentifier = packetIdentifier,
          topic = topic,
        )

        activeSocket.outputStream.write(unsubscribePacket)
        activeSocket.outputStream.flush()
        log("MQTT UNSUBSCRIBE packet sent topic=$topic packetId=$packetIdentifier")

        promise.resolve(
          Arguments.createMap().apply {
            putBoolean("unsubscribed", true)
            putString("topic", topic)
          },
        )
      } catch (error: Throwable) {
        log("MQTT unsubscribe failed: ${error.javaClass.simpleName}: ${error.message}")
        promise.reject("MQTT_UNSUBSCRIBE_FAILED", error.message, error)
      }
    }
  }

  @ReactMethod
  fun addListener(eventName: String) = Unit

  @ReactMethod
  fun removeListeners(count: Int) = Unit

  private fun createSslSocket(
    certificateName: String,
    certificatePassword: String,
    host: String,
    port: Int,
  ): SSLSocket {
    val keyStore = KeyStore.getInstance("PKCS12")
    openAsset(certificateName).use { stream ->
      keyStore.load(stream, certificatePassword.toCharArray())
    }

    val keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm())
    keyManagerFactory.init(keyStore, certificatePassword.toCharArray())

    val trustManagers = createTrustManagers(keyStore)

    val sslContext = SSLContext.getInstance("TLS")
    sslContext.init(keyManagerFactory.keyManagers, trustManagers, null)

    val rawSocket = Socket()
    rawSocket.soTimeout = SOCKET_TIMEOUT_MS
    rawSocket.connect(InetSocketAddress(host, port), SOCKET_TIMEOUT_MS)

    val sslSocket = sslContext.socketFactory.createSocket(rawSocket, host, port, true) as SSLSocket
    sslSocket.soTimeout = SOCKET_TIMEOUT_MS
    sslSocket.startHandshake()
    return sslSocket
  }

  private fun createTrustManagers(keyStore: KeyStore): Array<TrustManager>? {
    val trustedCertificates = mutableListOf<X509Certificate>()
    val aliases = keyStore.aliases()
    while (aliases.hasMoreElements()) {
      val alias = aliases.nextElement()
      val chain = keyStore.getCertificateChain(alias)
      if (!chain.isNullOrEmpty()) {
        chain.drop(1).forEach { certificate ->
          trustedCertificates.addTrustedCertificate(certificate)
        }
      } else if (keyStore.isCertificateEntry(alias)) {
        keyStore.getCertificate(alias)?.let { certificate ->
          trustedCertificates.addTrustedCertificate(certificate)
        }
      }
    }

    if (trustedCertificates.isEmpty()) {
      return null
    }

    return arrayOf(PinnedCaTrustManager(trustedCertificates.toTypedArray()))
  }

  private fun MutableList<X509Certificate>.addTrustedCertificate(certificate: Certificate) {
    if (certificate is X509Certificate) {
      add(certificate)
    }
  }

  private class PinnedCaTrustManager(
    private val trustedCertificates: Array<X509Certificate>,
  ) : X509TrustManager {
    override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) = Unit

    override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {
      if (chain.isEmpty()) {
        throw CertificateException("Server certificate chain is empty")
      }

      val leaf = chain.first()
      leaf.checkValidity()

      val trustedCertificate = trustedCertificates.firstOrNull { trustedCertificate ->
        chain.any { certificate ->
          certificate.issuerX500Principal == trustedCertificate.subjectX500Principal
        }
      } ?: throw CertificateException("Server certificate was not issued by the bundled MQTT CA")

      trustedCertificate.checkValidity()
      leaf.verify(trustedCertificate.publicKey)
    }

    override fun getAcceptedIssuers(): Array<X509Certificate> = trustedCertificates
  }

  private fun openAsset(assetName: String): InputStream =
    try {
      reactContext.assets.open(assetName)
    } catch (error: FileNotFoundException) {
      throw FileNotFoundException(
        "Android asset $assetName was not found. Place it in android/app/src/main/assets/$assetName",
      )
    }

  private fun disconnectSocket() {
    isReading = false
    keepAliveTask?.cancel(false)
    keepAliveTask = null
    try {
      socket?.close()
    } catch (_: Throwable) {
    } finally {
      socket = null
    }
  }

  private fun buildConnectPacket(
    clientId: String,
    cleanSession: Boolean,
    keepAliveSeconds: Int,
    username: String?,
    password: String?,
  ): ByteArray {
    val payload = ByteArrayOutputStream()
    payload.writeMqttString(clientId)
    if (username != null) {
      payload.writeMqttString(username)
    }
    if (password != null) {
      payload.writeMqttString(password)
    }

    var connectFlags = 0
    if (cleanSession) {
      connectFlags = connectFlags or 0x02
    }
    if (username != null) {
      connectFlags = connectFlags or 0x80
    }
    if (password != null) {
      connectFlags = connectFlags or 0x40
    }

    val variableHeader = ByteArrayOutputStream()
    variableHeader.writeMqttString("MQTT")
    variableHeader.write(0x04)
    variableHeader.write(connectFlags)
    variableHeader.write((keepAliveSeconds shr 8) and 0xFF)
    variableHeader.write(keepAliveSeconds and 0xFF)

    val remainingLength = variableHeader.size() + payload.size()
    val packet = ByteArrayOutputStream()
    packet.write(0x10)
    packet.write(encodeRemainingLength(remainingLength))
    packet.write(variableHeader.toByteArray())
    packet.write(payload.toByteArray())
    return packet.toByteArray()
  }

  private fun buildPublishPacket(topic: String, message: String): ByteArray {
    val variableHeader = ByteArrayOutputStream()
    variableHeader.writeMqttString(topic)

    val payload = message.toByteArray(Charsets.UTF_8)
    val remainingLength = variableHeader.size() + payload.size

    val packet = ByteArrayOutputStream()
    packet.write(0x30)
    packet.write(encodeRemainingLength(remainingLength))
    packet.write(variableHeader.toByteArray())
    packet.write(payload)
    return packet.toByteArray()
  }

  private fun buildSubscribePacket(packetIdentifier: Int, topic: String): ByteArray {
    val variableHeader = ByteArrayOutputStream()
    variableHeader.write((packetIdentifier shr 8) and 0xFF)
    variableHeader.write(packetIdentifier and 0xFF)

    val payload = ByteArrayOutputStream()
    payload.writeMqttString(topic)
    payload.write(0x00)

    val remainingLength = variableHeader.size() + payload.size()
    val packet = ByteArrayOutputStream()
    packet.write(0x82)
    packet.write(encodeRemainingLength(remainingLength))
    packet.write(variableHeader.toByteArray())
    packet.write(payload.toByteArray())
    return packet.toByteArray()
  }

  private fun buildUnsubscribePacket(packetIdentifier: Int, topic: String): ByteArray {
    val variableHeader = ByteArrayOutputStream()
    variableHeader.write((packetIdentifier shr 8) and 0xFF)
    variableHeader.write(packetIdentifier and 0xFF)

    val payload = ByteArrayOutputStream()
    payload.writeMqttString(topic)

    val remainingLength = variableHeader.size() + payload.size()
    val packet = ByteArrayOutputStream()
    packet.write(0xA2)
    packet.write(encodeRemainingLength(remainingLength))
    packet.write(variableHeader.toByteArray())
    packet.write(payload.toByteArray())
    return packet.toByteArray()
  }

  private fun startReadLoop(activeSocket: SSLSocket) {
    if (isReading) {
      return
    }
    isReading = true
    readerExecutor.execute {
      val input = activeSocket.inputStream
      while (isReading && socket === activeSocket) {
        try {
          val fixedHeader = input.read()
          if (fixedHeader < 0) {
            error("MQTT socket closed while reading")
          }

          val remainingLength = readRemainingLength(input::read)
          val packet = readExact(input, remainingLength)
          when (fixedHeader and 0xF0) {
            0x30 -> handlePublishPacket(fixedHeader, packet)
            0x90 -> Unit
            0xB0 -> Unit
            0xD0 -> Unit
            else -> log("MQTT packet ignored type=${fixedHeader and 0xF0}")
          }
        } catch (_: SocketTimeoutException) {
        } catch (error: Throwable) {
          if (isReading) {
            log("MQTT read loop stopped: ${error.javaClass.simpleName}: ${error.message}")
          }
          isReading = false
        }
      }
    }
  }

  private fun startKeepAlive(activeSocket: SSLSocket, keepAliveSeconds: Int) {
    keepAliveTask?.cancel(false)
    keepAliveTask = null

    if (keepAliveSeconds <= 0) {
      return
    }

    val pingIntervalSeconds = maxOf(1L, keepAliveSeconds.toLong() / 2)
    keepAliveTask = keepAliveExecutor.scheduleAtFixedRate(
      {
        executor.execute {
          if (socket !== activeSocket || activeSocket.isClosed) {
            return@execute
          }

          try {
            activeSocket.outputStream.write(byteArrayOf(0xC0.toByte(), 0x00))
            activeSocket.outputStream.flush()
          } catch (error: Throwable) {
            log("MQTT keepalive failed: ${error.javaClass.simpleName}: ${error.message}")
            disconnectSocket()
          }
        }
      },
      pingIntervalSeconds,
      pingIntervalSeconds,
      TimeUnit.SECONDS,
    )
  }

  private fun handlePublishPacket(fixedHeader: Int, packet: ByteArray) {
    if (packet.size < 2) {
      error("Malformed MQTT PUBLISH packet")
    }

    val topicLength = ((packet[0].toInt() and 0xFF) shl 8) or (packet[1].toInt() and 0xFF)
    val topicStart = 2
    val topicEnd = topicStart + topicLength
    if (topicEnd > packet.size) {
      error("Malformed MQTT PUBLISH topic")
    }

    val qos = (fixedHeader and 0x06) shr 1
    val payloadStart = topicEnd + if (qos > 0) 2 else 0
    if (payloadStart > packet.size) {
      error("Malformed MQTT PUBLISH payload")
    }

    val topic = packet.copyOfRange(topicStart, topicEnd).toString(Charsets.UTF_8)
    val message = packet.copyOfRange(payloadStart, packet.size).toString(Charsets.UTF_8)
    log("MQTT message received topic=$topic message=$message")
    emitMessage(topic = topic, message = message)
  }

  private fun emitMessage(topic: String, message: String) {
    try {
      if (!reactContext.hasActiveReactInstance()) {
        log("MQTT message dropped because React context is inactive topic=$topic")
        return
      }

      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(
          "MqttMessageReceived",
          Arguments.createMap().apply {
            putString("topic", topic)
            putString("message", message)
          },
        )
    } catch (error: Throwable) {
      log("MQTT message emit failed: ${error.javaClass.simpleName}: ${error.message}")
    }
  }

  private fun readExact(input: InputStream, length: Int): ByteArray {
    val bytes = ByteArray(length)
    var offset = 0
    while (offset < length) {
      val read = input.read(bytes, offset, length - offset)
      if (read < 0) {
        error("MQTT socket closed while reading packet")
      }
      offset += read
    }
    return bytes
  }

  private fun encodeRemainingLength(length: Int): ByteArray {
    var value = length
    val encoded = ByteArrayOutputStream()
    do {
      var digit = value % 128
      value /= 128
      if (value > 0) {
        digit = digit or 0x80
      }
      encoded.write(digit)
    } while (value > 0)
    return encoded.toByteArray()
  }

  private fun readRemainingLength(readByte: () -> Int): Int {
    var multiplier = 1
    var value = 0
    var encodedByte: Int
    do {
      encodedByte = readByte()
      if (encodedByte < 0) {
        error("MQTT remaining length ended unexpectedly")
      }
      value += (encodedByte and 127) * multiplier
      multiplier *= 128
      if (multiplier > 128 * 128 * 128) {
        error("Malformed MQTT remaining length")
      }
    } while ((encodedByte and 128) != 0)
    return value
  }

  private fun ReadableMap.getStringOrNull(key: String): String? =
    if (hasKey(key) && !isNull(key)) getString(key) else null

  private fun connectionResult(connected: Boolean, clientId: String? = null) =
    Arguments.createMap().apply {
      putBoolean("connected", connected)
      clientId?.let { putString("clientId", it) }
    }

  private fun log(message: String) {
    println("[MQTT][Android] $message")
  }

  private fun createMqttClientId(): String =
    "android_${SimpleDateFormat("HHmmssSSS", Locale.US).format(Date())}"

  private fun nextPacketIdentifier(): Int {
    val packetIdentifier = nextPacketIdentifier
    nextPacketIdentifier += 1
    if (nextPacketIdentifier > 0xFFFF) {
      nextPacketIdentifier = 1
    }
    return packetIdentifier
  }

  private fun ByteArrayOutputStream.writeMqttString(value: String) {
    val bytes = value.toByteArray(Charsets.UTF_8)
    DataOutputStream(this).writeShort(bytes.size)
    write(bytes)
  }

  companion object {
    private const val SOCKET_TIMEOUT_MS = 15_000
  }
}
