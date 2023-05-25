package app.omnivore.omnivore.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val LightColors = lightColorScheme(
  primary = md_theme_light_primary,
  onPrimary = md_theme_light_onPrimary,
)


private val DarkColors = darkColorScheme(
  primary = md_theme_dark_primary,
  onPrimary = md_theme_dark_onPrimary,
)

@Composable
fun OmnivoreTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  useDynamicTheme: Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S,
  content: @Composable () -> Unit
) {
  val colorScheme = if (darkTheme) DarkColors else LightColors

  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography,
//    shapes = Shapes,
    content = content
  )
}
