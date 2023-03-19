package app.omnivore.omnivore.ui.settings

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions

@Composable
fun LogoutDialog(onClose: (Boolean) -> Unit) {
  val context = LocalContext.current

  AlertDialog(
    onDismissRequest = { onClose(false) },
    title = { Text(text = "Logout") },
    text = {
      Text("Are you sure you want to logout?")
    },
    confirmButton = {
      Button(onClick = {
        // Sign out google users
        val signInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
          .build()

        val googleSignIn = GoogleSignIn.getClient(context, signInOptions)
        googleSignIn.signOut()
        onClose(true)
      }) {
        Text("Confirm")
      }
    },
    dismissButton = {
      Button(onClick = { onClose(false) }) {
        Text("Cancel")
      }
    }
  )
}
