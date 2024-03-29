package app.omnivore.omnivore

import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import app.omnivore.omnivore.feature.auth.LoginViewModel
import app.omnivore.omnivore.feature.components.LabelsViewModel
import app.omnivore.omnivore.feature.editinfo.EditInfoViewModel
import app.omnivore.omnivore.feature.library.SearchViewModel
import app.omnivore.omnivore.feature.library.LibraryViewModel
import app.omnivore.omnivore.feature.root.RootView
import app.omnivore.omnivore.feature.save.SaveViewModel
import app.omnivore.omnivore.feature.theme.OmnivoreTheme
import com.pspdfkit.PSPDFKit
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import android.util.Log
import android.view.KeyEvent
import android.widget.Toast

    @OptIn(DelicateCoroutinesApi::class)
    @AndroidEntryPoint
    class MainActivity : ComponentActivity() {

        private val libraryViewModel: LibraryViewModel by viewModels()
        // Detect page turning in main activity and pass it to library view model
        override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
            when (keyCode) {
                KeyEvent.KEYCODE_VOLUME_DOWN -> {
                    // Handle volume down press
                    //Toast.makeText(applicationContext, "Volume Down Key Pressed", Toast.LENGTH_SHORT).show()
                    libraryViewModel.triggerScrollDown()
                    return true
                }
                KeyEvent.KEYCODE_VOLUME_UP -> {
                    // Handle volume up press
                    //Toast.makeText(applicationContext, "Volume Up Key Pressed", Toast.LENGTH_SHORT).show()
                    libraryViewModel.triggerScrollUp()
                    return true
                }
                // Add more key handling as needed
            }
            return super.onKeyDown(keyCode, event)
        }


    override fun onCreate(savedInstanceState: Bundle?) {

        installSplashScreen()

        super.onCreate(savedInstanceState)
        //window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN


        val loginViewModel: LoginViewModel by viewModels()
        val searchViewModel: SearchViewModel by viewModels()
        val labelsViewModel: LabelsViewModel by viewModels()
        val saveViewModel: SaveViewModel by viewModels()
        val editInfoViewModel: EditInfoViewModel by viewModels()

        val context = this

        GlobalScope.launch(Dispatchers.IO) {
            val licenseKey = getString(R.string.pspdfkit_license_key)

            if (licenseKey.length > 30) {
                PSPDFKit.initialize(context, licenseKey)
            } else {
                PSPDFKit.initialize(context, null)
            }
        }

        enableEdgeToEdge()

        setContent {
            val libraryViewModel: LibraryViewModel by viewModels()

            OmnivoreTheme {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                ) {
                    RootView(
                        loginViewModel,
                        searchViewModel,
                        labelsViewModel,
                        saveViewModel,
                        editInfoViewModel,
                        libraryViewModel // Passing the ViewModel instance here
                    )
                }
            }
        }

        // animate the view up when keyboard appears
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val rootView = findViewById<View>(android.R.id.content).rootView
        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
            val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
            rootView.setPadding(0, 0, 0, imeHeight)
            insets
        }
    }
}
