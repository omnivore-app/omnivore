package app.omnivore.omnivore.ui.auth

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import app.omnivore.omnivore.R
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.tasks.Task


@OptIn(ExperimentalMaterialApi::class)
@Composable
fun GoogleAuthButton(viewModel: LoginViewModel) {
  val context = LocalContext.current

  val signInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
    .requestEmail()
    .requestIdToken(stringResource(R.string.gcp_id))
    .requestId()
    .requestProfile()
    .build()

  val startForResult =
    rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result: ActivityResult ->
      if (result.resultCode == Activity.RESULT_OK) {
        val intent = result.data
        if (result.data != null) {
          val task: Task<GoogleSignInAccount> = GoogleSignIn.getSignedInAccountFromIntent(intent)
          viewModel.handleGoogleAuthTask(task)
        }
      }
    }

  LoadingButtonWithIcon(
    text = "Continue with Google",
    loadingText = "Signing in...",
    isLoading = viewModel.isLoading,
    icon = painterResource(id = R.drawable.ic_logo_google),
    onClick = {
      val googleSignIn = GoogleSignIn.getClient(context, signInOptions)
      startForResult.launch(googleSignIn.signInIntent)
    }
  )
}
