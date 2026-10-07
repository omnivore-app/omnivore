package app.omnivore.omnivore.core.analytics

import android.content.Context
import app.omnivore.omnivore.R
import com.posthog.android.PostHog
import com.posthog.android.Properties
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.identity.Registration
import javax.inject.Inject

class EventTracker @Inject constructor(private val app: Context) {
    private val posthog: PostHog?

    init {
        val posthogClientKey = app.getString(R.string.posthog_client_key)
        val posthogInstanceAddress = app.getString(R.string.posthog_instance_address)

        posthog = if (posthogClientKey.isBlank() || posthogInstanceAddress.isBlank()) {
            null
        } else {
            PostHog.Builder(app, posthogClientKey, posthogInstanceAddress)
                .captureApplicationLifecycleEvents()
                .collectDeviceId(false)
                .build()
                .also { PostHog.setSingletonInstance(it) }
        }
    }

    fun registerUser(userID: String, intercomHash: String?, isDebug: Boolean) {
        posthog?.identify(userID)

        val intercomConfigured =
            app.getString(R.string.intercom_api_key).isNotBlank() &&
            app.getString(R.string.intercom_app_id).isNotBlank()

        if (!isDebug && intercomConfigured) {
            Intercom.client().loginIdentifiedUser(
                Registration.create().withUserId(userID)
            )
            intercomHash?.let { Intercom.client().setUserHash(it) }
        }
    }

    fun track(eventName: String, properties: Properties = Properties()) {
        posthog?.capture(eventName, properties)
    }

    fun logout() {
        posthog?.reset()
    }
}