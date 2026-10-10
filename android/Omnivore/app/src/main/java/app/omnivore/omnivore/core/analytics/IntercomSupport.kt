package app.omnivore.omnivore.core.analytics

import app.omnivore.omnivore.R
import io.intercom.android.sdk.Intercom

/** Single place deciding whether Intercom is configured and safe to call. */
object IntercomSupport {
    @Volatile
    var isReady: Boolean = false
        private set

    fun initialize(app: android.app.Application) {
        val apiKey = app.getString(R.string.intercom_api_key)
        val appId = app.getString(R.string.intercom_app_id)
        if (apiKey.isBlank() || appId.isBlank()) return

        Intercom.initialize(app, apiKey, appId)
        isReady = true
    }

    fun clientOrNull(): Intercom? = if (isReady) Intercom.client() else null
}
