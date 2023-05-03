package com.passkit

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class AddPassButtonManager(private var reactApplicationContext: ReactApplicationContext) : SimpleViewManager<AddPassButton>() {
  private lateinit var themedReactContext: ThemedReactContext

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(themedReactContext: ThemedReactContext): AddPassButton {
    this.themedReactContext = themedReactContext
    return AddPassButton(themedReactContext)
  }

  override fun onAfterUpdateTransaction(view: AddPassButton) {
    super.onAfterUpdateTransaction(view)
//    view.render()
  }

  override fun onDropViewInstance(view: AddPassButton) {
    super.onDropViewInstance(view)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
    val REGISTRATION_NAME = "registrationName"
    val builder: MapBuilder.Builder<String, Any> = MapBuilder.builder()

    builder.put(PasskitInterface.ON_PRESS, MapBuilder.of(REGISTRATION_NAME, PasskitInterface.ON_PRESS))

    return builder.build()
  }

  @ReactProp(name = PasskitInterface.VARIANT)
  fun setVariant(view: AddPassButton, variant: String?){
    view.setVariant(variant)
  }

  companion object {
    private const val REACT_CLASS = "AddPassButton"
  }
}
