package app.omnivore.omnivore.di

import android.content.Context
import app.omnivore.omnivore.core.analytics.EventTracker
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.database.OmnivoreDatabase
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.OmnivoreDatastore
import app.omnivore.omnivore.core.network.Networker
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

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
  fun provideAnalytics(@ApplicationContext app: Context) = EventTracker(app)

  @Singleton
  @Provides
  fun provideDataService(
      networker: Networker,
      omnivoreDatabase: OmnivoreDatabase
  ) = DataService(networker, omnivoreDatabase)

}
