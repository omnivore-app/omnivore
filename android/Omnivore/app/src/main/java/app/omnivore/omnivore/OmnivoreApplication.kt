package app.omnivore.omnivore

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import io.intercom.android.sdk.Intercom

@HiltAndroidApp
class OmnivoreApplication: Application() {
  override fun onCreate() {
    super.onCreate()

    Intercom.initialize(
      this,
      this.getString(R.string.intercom_api_key),
      this.getString(R.string.intercom_app_id)
    )
  }
}
