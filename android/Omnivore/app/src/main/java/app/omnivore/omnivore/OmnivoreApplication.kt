package app.omnivore.omnivore

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import io.intercom.android.sdk.Intercom
import com.google.android.material.color.DynamicColors;

@HiltAndroidApp
class OmnivoreApplication: Application() {
  override fun onCreate() {
    super.onCreate()

    DynamicColors.applyToActivitiesIfAvailable(this);

    Intercom.initialize(
      this,
      this.getString(R.string.intercom_api_key),
      this.getString(R.string.intercom_app_id)
    )
  }
}
