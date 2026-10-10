package app.omnivore.omnivore

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import app.omnivore.omnivore.core.analytics.IntercomSupport
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

    IntercomSupport.initialize(this)
  }
}
