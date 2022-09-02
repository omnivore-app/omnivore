package app.omnivore.omnivore

import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.ui.Modifier
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.home.HomeViewModel
import app.omnivore.omnivore.ui.root.RootView
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val loginViewModel: LoginViewModel by viewModels()
    val homeViewModel: HomeViewModel by viewModels()

    setContent {
      OmnivoreTheme {
        RootView(
          loginViewModel,
          homeViewModel,
          modifier = Modifier
            .systemBarsPadding()
        )
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
