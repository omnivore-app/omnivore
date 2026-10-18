package app.omnivore.omnivore.di

import android.content.Context
import androidx.room.Room
import app.omnivore.omnivore.core.database.OmnivoreDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun providesOmnivoreDatabase(
        @ApplicationContext context: Context,
    ): OmnivoreDatabase = Room.databaseBuilder(
        context,
        OmnivoreDatabase::class.java,
        "omnivore-database",
    )
    .fallbackToDestructiveMigration()
    .build()
}
