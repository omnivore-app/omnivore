package app.omnivore.savetoomnivore

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.TextUtils.isEmpty
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore
import app.omnivore.generated.SaveUrlMutation
import app.omnivore.generated.type.SaveUrlInput
import com.apollographql.apollo3.ApolloClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.*
import java.util.regex.Matcher
import java.util.regex.Pattern


private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(
    name = "settings"
)

class ExtensionActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        when {
            intent?.action == Intent.ACTION_SEND -> {
                if ("text/plain" == intent.type) {
                    handleSendText(intent) // Handle text being sent
                }
            }
        }
        finish()
    }

    fun saveURL(url: String) {

        GlobalScope.launch {
            val apiKey = AppDatastore.getInstance(baseContext)?.getApiKey?.first()

            val apolloClient = ApolloClient.Builder()
                .serverUrl("https://api-prod.omnivore.app/api/graphql")
                .addHttpHeader(
                    "Authorization",
                    value = apiKey.toString()
                )
                .build()

            val source = "android"
            val clientRequestId = UUID.randomUUID().toString()
            val response = apolloClient.mutation(
                SaveUrlMutation(
                    SaveUrlInput(
                        clientRequestId = clientRequestId,
                        source = source,
                        url = url
                    )
                )
            ).execute()

            val success = (response.data?.saveUrl?.onSaveSuccess?.url != null)

            GlobalScope.launch(Dispatchers.Main) {
                runOnUiThread(Runnable {
                    val message = if (success) "Saved to Omnivore" else "Error saving to Omnivore"
                    Toast.makeText(baseContext, message, Toast.LENGTH_LONG).show()
                })
            }
        }
    }

    private fun handleSendText(intent: Intent) {
        intent.getStringExtra(Intent.EXTRA_TEXT)?.let {
            val url = getUrl(it)
            if (url == null || isEmpty(url)) {
                Toast.makeText(this, "Error: no URL found.", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(this, "Saving to Omnivore", Toast.LENGTH_LONG).show()
                saveURL(it)
            }
        }
    }

    fun getUrl(s: String): String? {
        val pattern =
            Pattern.compile("[(http(s)?):\\/\\/(www\\.)?a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)")
        try {
            val matcher: Matcher = pattern.matcher(s)
            if (matcher.find()) {
                return s.substring(matcher.start(), matcher.end())
            }
        } catch (e: Exception) {
            System.out.println("exception parsing string")
            System.out.println(e)
            return null
        }
        return null
    }
}
