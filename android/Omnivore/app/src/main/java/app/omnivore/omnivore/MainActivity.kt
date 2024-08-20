package app.omnivore.omnivore

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import app.omnivore.omnivore.feature.root.RootView
import app.omnivore.omnivore.feature.theme.OmnivoreTheme
import com.pspdfkit.PSPDFKit
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {

        installSplashScreen()

        super.onCreate(savedInstanceState)


        lifecycleScope.launch(Dispatchers.IO) {
            val licenseKey = getString(R.string.pspdfkit_license_key)

            if (licenseKey.length > 30) {
                PSPDFKit.initialize(this@MainActivity, licenseKey)
            } else {
                PSPDFKit.initialize(this@MainActivity, null)
            }
        }

        enableEdgeToEdge()

        setContent {
            OmnivoreTheme {
                Box(
                    modifier = Modifier.fillMaxSize()
                ) {
                    RootView()
                }
            }
        }
    }
}
