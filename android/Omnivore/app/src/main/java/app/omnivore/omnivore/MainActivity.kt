package app.omnivore.omnivore

import android.Manifest
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.annotation.RequiresApi
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.work.*
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.home.HomeViewModel
import app.omnivore.omnivore.ui.root.RootView
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
  private lateinit var requestMultiplePermission: ActivityResultLauncher<Array<String>>

  @RequiresApi(Build.VERSION_CODES.N)
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val loginViewModel: LoginViewModel by viewModels()
    val homeViewModel: HomeViewModel by viewModels()

    requestMultiplePermission = registerForActivityResult(
      ActivityResultContracts.RequestMultiplePermissions()
    ){
      var isGranted = false
      it.forEach { _, granted ->
        isGranted = granted
      }

      if (!isGranted){
        Toast.makeText(this, "Permission Not Granted", Toast.LENGTH_SHORT).show()
      }
    }

    setContent {
      OmnivoreTheme {
        requestMultiplePermission.launch(
          arrayOf(
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
          )
        )

        RootView(loginViewModel, homeViewModel)
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
