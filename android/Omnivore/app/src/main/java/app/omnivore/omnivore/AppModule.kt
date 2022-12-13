package app.omnivore.omnivore

import android.content.Context
import app.omnivore.omnivore.networking.Networker
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import com.segment.analytics.kotlin.android.Analytics
import com.segment.analytics.kotlin.core.*

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

  @Singleton
  @Provides
  fun provideDataStoreRepository(
    @ApplicationContext app: Context
  ): DatastoreRepository = OmnivoreDatastore(app)

  @Singleton
  @Provides
  fun provideNetworker(datastore: DatastoreRepository) = Networker(datastore)

  @Singleton
  @Provides
  fun provideAnalytics(
    @ApplicationContext app: Context
  ): Analytics {
    val writeKey = app.getString(R.string.segment_write_key)

    // TODO: abstract analytics to custom class
    return Analytics(writeKey, app.applicationContext) {
      trackApplicationLifecycleEvents = true
      application = app.applicationContext
      useLifecycleObserver = true
    }
  }
}
