package app.omnivore.omnivore

import android.content.Context
import com.segment.analytics.kotlin.android.Analytics
import com.segment.analytics.kotlin.core.*
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.identity.Registration
import org.json.JSONObject
import javax.inject.Inject

class EventTracker @Inject constructor(val app: Context) {
  val segmentAnalytics: Analytics

  init {
    val writeKey = app.getString(R.string.segment_write_key)

    segmentAnalytics = Analytics(writeKey, app.applicationContext) {
      trackApplicationLifecycleEvents = true
      application = app.applicationContext
      useLifecycleObserver = true
    }
  }

  fun registerUser(userID: String) {
    segmentAnalytics.identify(userID)
    Intercom.client().loginIdentifiedUser(Registration.create().withUserId(userID))
  }

  fun debugMessage(message: String) {
    track(message)
  }

  fun track(eventName: String, jsonObject: JSONObject = JSONObject()) {
    segmentAnalytics.track(eventName, jsonObject)
  }
}
