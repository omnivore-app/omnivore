package app.omnivore.omnivore.ui.settings

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import app.omnivore.omnivore.R
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions

@Composable
fun LogoutDialog(onClose: (Boolean) -> Unit) {
  val context = LocalContext.current

  AlertDialog(
    onDismissRequest = { onClose(false) },
    title = { Text(text = stringResource(R.string.logout_dialog_title)) },
    text = {
      Text(stringResource(R.string.logout_dialog_confirm_msg))
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
        Text(stringResource(R.string.logout_dialog_action_confirm))
      }
    },
    dismissButton = {
      Button(onClick = { onClose(false) }) {
        Text(stringResource(R.string.logout_dialog_action_cancel))
      }
    }
  )
}
