package app.omnivore.savetoomnivore

import android.annotation.SuppressLint
import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class AppDatastore(private val context: Context) {
    private val Context.datastore: DataStore<Preferences> by preferencesDataStore(name = "app_datastore")
    private val APIKEY = stringPreferencesKey(name = "API_KEY")

    companion object {
        @SuppressLint("StaticFieldLeak")
        var INSTANCE: AppDatastore? = null
        fun getInstance(base: Context): AppDatastore? {
            if (INSTANCE == null) {
                synchronized(AppDatastore::class.java) {
                    INSTANCE = AppDatastore(base.applicationContext)
                }
            }

            return INSTANCE
        }
    }

    suspend fun setApiKey(apiKey: String) {
        context.datastore.edit { preferences ->
            preferences[APIKEY] = apiKey
        }
    }

    val getApiKey: Flow<String> = context.datastore.data.map { preferences ->
        preferences[APIKEY] ?: ""
    }
}