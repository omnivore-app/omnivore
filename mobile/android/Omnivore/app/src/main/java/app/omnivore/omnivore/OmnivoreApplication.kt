package app.omnivore.omnivore

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import io.intercom.android.sdk.Intercom
import javax.inject.Inject

@HiltAndroidApp
class OmnivoreApplication: Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

  override fun onCreate() {
    super.onCreate()

    Intercom.initialize(
      this,
      this.getString(R.string.intercom_api_key),
      this.getString(R.string.intercom_app_id)
    )
  }
}
