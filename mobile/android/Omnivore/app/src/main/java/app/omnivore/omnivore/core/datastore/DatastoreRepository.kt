package app.omnivore.omnivore.core.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import app.omnivore.omnivore.utils.Constants
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject

interface DatastoreRepository {
    val hasAuthTokenFlow: Flow<Boolean>
    val themeKeyFlow: Flow<String>

    suspend fun clear()
    suspend fun putBoolean(key: String, value: Boolean)
    fun getBoolean(key: String): Flow<Boolean>
    suspend fun putString(key: String, value: String)
    suspend fun putInt(key: String, value: Int)
    suspend fun getString(key: String): String?
    suspend fun getInt(key: String): Int?
    suspend fun clearValue(key: String)
}

class OmnivoreDatastore @Inject constructor(
    private val context: Context
) : DatastoreRepository {
    private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(
        name = Constants.dataStoreName
    )

    override suspend fun putBoolean(key: String, value: Boolean) {
        val preferencesKey = booleanPreferencesKey(key)
        context.dataStore.edit { preferences ->
            preferences[preferencesKey] = value
        }
    }

    override fun getBoolean(key: String): Flow<Boolean> {
        val preferencesKey = booleanPreferencesKey(key)
        return context.dataStore.data.map { preferences ->
            preferences[preferencesKey] ?: false
        }
    }

    override suspend fun putString(key: String, value: String) {
        val preferencesKey = stringPreferencesKey(key)
        context.dataStore.edit { preferences ->
            preferences[preferencesKey] = value
        }
    }

    override suspend fun putInt(key: String, value: Int) {
        val preferencesKey = intPreferencesKey(key)
        context.dataStore.edit { preferences ->
            preferences[preferencesKey] = value
        }
    }

    override suspend fun getString(key: String): String? {
        val preferencesKey = stringPreferencesKey(key)
        val preferences = context.dataStore.data.first()
        return preferences[preferencesKey]
    }

    override suspend fun getInt(key: String): Int? {
        val preferencesKey = intPreferencesKey(key)
        val preferences = context.dataStore.data.first()
        return preferences[preferencesKey]
    }

    override suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }

    override suspend fun clearValue(key: String) {
        val preferencesKey = stringPreferencesKey(key)
        context.dataStore.edit { it.remove(preferencesKey) }
    }

    override val hasAuthTokenFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
            val key = stringPreferencesKey(omnivoreAuthToken)
            val token = preferences[key]
            token != null
        }

    override val themeKeyFlow: Flow<String> = context.dataStore.data.map { preferences ->
            val key = stringPreferencesKey(preferredTheme)
            preferences[key] ?: "System"
        }
}
