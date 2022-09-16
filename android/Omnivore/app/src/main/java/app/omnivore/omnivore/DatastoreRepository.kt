package app.omnivore.omnivore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject

interface DatastoreRepository {
  val hasAuthTokenFlow: Flow<Boolean>
  suspend fun clear()
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

  override val hasAuthTokenFlow: Flow<Boolean> = context
    .dataStore.data.map { preferences ->
      val key = stringPreferencesKey(DatastoreKeys.omnivoreAuthToken)
      val token = preferences[key]
      token != null
    }
}
