package app.omnivore.omnivore.di

import app.omnivore.omnivore.core.database.OmnivoreDatabase
import app.omnivore.omnivore.core.database.dao.HighlightChangesDao
import app.omnivore.omnivore.core.database.dao.HighlightDao
import app.omnivore.omnivore.core.database.dao.SavedItemAndSavedItemLabelCrossRefDao
import app.omnivore.omnivore.core.database.dao.SavedItemDao
import app.omnivore.omnivore.core.database.dao.SavedItemLabelDao
import app.omnivore.omnivore.core.database.dao.SavedItemWithLabelsAndHighlightsDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
object DaosModule {

    @Provides
    fun providesSavedItemDao(
        database: OmnivoreDatabase,
    ): SavedItemDao = database.savedItemDao()

    @Provides
    fun providesSavedItemLabelDao(
        database: OmnivoreDatabase,
    ): SavedItemLabelDao = database.savedItemLabelDao()

    @Provides
    fun providesHighlightDao(
        database: OmnivoreDatabase,
    ): HighlightDao = database.highlightDao()

    @Provides
    fun providesHighlightChangesDao(
        database: OmnivoreDatabase,
    ): HighlightChangesDao = database.highlightChangesDao()

    @Provides
    fun providesSavedItemWithLabelsAndHighlightsDao(
        database: OmnivoreDatabase,
    ): SavedItemWithLabelsAndHighlightsDao = database.savedItemWithLabelsAndHighlightsDao()

    @Provides
    fun providesSavedItemAndSavedItemLabelCrossRefDao(
        database: OmnivoreDatabase,
    ): SavedItemAndSavedItemLabelCrossRefDao = database.savedItemAndSavedItemLabelCrossRefDao()
}
