package app.omnivore.omnivore

import android.content.Context
import com.posthog.android.PostHog
import com.posthog.android.Properties
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.identity.Registration
import org.json.JSONObject
import javax.inject.Inject


class EventTracker @Inject constructor(val app: Context) {
  private val posthog: PostHog

  init {
    val posthogClientKey = app.getString(R.string.posthog_client_key)
    val posthogInstanceAddress = app.getString(R.string.posthog_instance_address)

    posthog = PostHog.Builder(app, posthogClientKey, posthogInstanceAddress)
      .captureApplicationLifecycleEvents()
      .collectDeviceId(false)
      .build()

    PostHog.setSingletonInstance(posthog)
  }

  fun registerUser(userID: String, intercomHash: String?) {
    posthog.identify(userID)
    Intercom.client().loginIdentifiedUser(Registration.create().withUserId(userID))
    intercomHash?.let { intercomHash ->
      Intercom.client().setUserHash(intercomHash)
    }
  }

  fun track(eventName: String, properties: Properties = Properties()) {
    posthog.capture(eventName, properties)
  }

  fun logout() {
    posthog.reset()
  }
}
