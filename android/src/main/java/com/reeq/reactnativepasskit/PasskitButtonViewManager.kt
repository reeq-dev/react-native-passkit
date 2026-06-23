package com.reeq.reactnativepasskit

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.PasskitButtonManagerDelegate
import com.facebook.react.viewmanagers.PasskitButtonManagerInterface

@ReactModule(name = PasskitButtonViewManager.NAME)
class PasskitButtonViewManager :
  SimpleViewManager<PasskitButtonView>(),
  PasskitButtonManagerInterface<PasskitButtonView> {

  private val mDelegate = PasskitButtonManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<PasskitButtonView> = mDelegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): PasskitButtonView =
    PasskitButtonView(context)

  @ReactProp(name = "variant")
  override fun setVariant(view: PasskitButtonView, value: String?) {
    view.setVariant(value ?: "dark")
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> =
    mutableMapOf<String, Any>(
      "topAddButtonPress" to mapOf("registrationName" to "onAddButtonPress")
    )

  companion object {
    const val NAME = "PasskitButton"
  }
}
