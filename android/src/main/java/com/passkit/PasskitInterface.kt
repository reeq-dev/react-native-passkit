package com.passkit

class PasskitInterface {
  companion object {
    // add pass button props
    const val VARIANT = "variant"
    const val ON_PRESS = "onAddButtonPress"

    // pass result events
    const val ADD_PASS_RESULT_SUCCESS = "success"
    const val ADD_PASS_RESULT_CANCELLED = "cancelled"
    const val ADD_PASS_RESULT_ERROR = "error"

    const val ERROR_TYPE_API = "api"
    const val ERROR_TYPE_UNEXPECTED = "unexpected"

    const val EVENT_PROPERTY_STATUS = "status"
    const val EVENT_PROPERTY_ERROR_TYPE = "errorType"
    const val EVENT_PROPERTY_ERROR_MESSAGE = "message"
  }
}

