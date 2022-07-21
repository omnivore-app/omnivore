package app.omnivore.savetoomnivore

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.material3.OutlinedTextField
import kotlinx.coroutines.launch
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.GlobalScope

class MainActivity : ComponentActivity() {

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Save to Omnivore")
                        var apiKey by remember { mutableStateOf("") }
                        OutlinedTextField(
                            value = apiKey,
                            onValueChange = {
                                apiKey = it
                                GlobalScope.launch {
                                    setApiKey(apiKey)
                                }
                            },
                            label = { Text("API Key") }
                        )
                        Text("Get an API key from https://omnivore.app/settings/api")
                    }
                }
            }
        }
    }

    private suspend fun setApiKey(apiKey: String) {
        AppDatastore.getInstance(base = baseContext)?.setApiKey(apiKey)
    }
}
