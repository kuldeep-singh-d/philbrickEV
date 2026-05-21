package com.philbrickev

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

@Suppress("DEPRECATION")
class MqttPackage : ReactPackage {
  @Deprecated("Required by ReactPackage.")
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(MqttClientModule(reactContext))

  @Suppress("DEPRECATION")
  override fun createViewManagers(
    reactContext: ReactApplicationContext,
  ): List<ViewManager<*, *>> = emptyList()
}
