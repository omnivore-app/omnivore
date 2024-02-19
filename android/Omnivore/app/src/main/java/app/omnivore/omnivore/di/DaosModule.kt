package app.omnivore.omnivore.di

import app.omnivore.omnivore.core.database.AppDatabase
import app.omnivore.omnivore.core.database.dao.SavedItemDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
object DaosModule {
    @Provides
    fun providesTopicsDao(
        database: AppDatabase,
    ): SavedItemDao = database.savedItemDao()
}
