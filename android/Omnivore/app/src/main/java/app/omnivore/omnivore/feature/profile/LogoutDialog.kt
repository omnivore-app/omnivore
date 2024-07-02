package app.omnivore.omnivore.feature.profile

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import app.omnivore.omnivore.R
import kotlinx.coroutines.launch

@Composable
fun LogoutDialog(onClose: (Boolean) -> Unit) {
    val context = LocalContext.current

    val credentialManager = remember { CredentialManager.create(context) }
    val scope = rememberCoroutineScope()

    AlertDialog(onDismissRequest = { onClose(false) },
        title = { Text(text = stringResource(R.string.logout_dialog_title)) },
        text = {
            Text(stringResource(R.string.logout_dialog_confirm_msg))
        },
        containerColor = MaterialTheme.colorScheme.background,
        confirmButton = {
            TextButton(
                colors = ButtonDefaults.textButtonColors(
                    contentColor = MaterialTheme.colorScheme.onSurface
                ),
                onClick = {
                    scope.launch {
                        credentialManager.clearCredentialState(ClearCredentialStateRequest())
                        onClose(true)
                    }
            }) {
                Text(stringResource(R.string.logout_dialog_action_confirm))
            }
        },
        dismissButton = {
            TextButton(
                colors = ButtonDefaults.textButtonColors(
                    contentColor = MaterialTheme.colorScheme.onSurface
                ),
                onClick = { onClose(false) }) {
                Text(stringResource(R.string.logout_dialog_action_cancel))
            }
        })
}
