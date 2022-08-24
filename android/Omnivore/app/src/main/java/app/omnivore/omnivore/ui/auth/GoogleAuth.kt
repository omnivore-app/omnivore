package app.omnivore.omnivore.ui.auth

import android.app.Activity
import android.content.ContentValues
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import app.omnivore.omnivore.R
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.OnCompleteListener
import com.google.android.gms.tasks.Task

@Composable
fun GoogleAuthButton(viewModel: LoginViewModel) {
  val context = LocalContext.current

  val signInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
    .requestIdToken(stringResource(R.string.gcp_id))
//    .requestServerAuthCode(stringResource(R.string.gcp_id), true)
    .build()

  val startForResult =
    rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result: ActivityResult ->
      if (result.resultCode == Activity.RESULT_OK) {
        val intent = result.data
        if (result.data != null) {
          val task: Task<GoogleSignInAccount> = GoogleSignIn.getSignedInAccountFromIntent(intent)
          viewModel.handleGoogleAuthTask(task)
        }
      } else {
        viewModel.showGoogleErrorMessage()
      }
    }



  LoadingButtonWithIcon(
    text = "Continue with Google",
    loadingText = "Signing in...",
    isLoading = viewModel.isLoading,
    icon = painterResource(id = R.drawable.ic_logo_google),
    onClick = {
      val googleSignIn = GoogleSignIn.getClient(context, signInOptions)
      val silentSignInTask = googleSignIn.silentSignIn()
      Log.d(ContentValues.TAG, "silent auth success?: ${silentSignInTask.isSuccessful}")
      val result = silentSignInTask.getResult(ApiException::class.java)
      Log.d(ContentValues.TAG, "silent id token?: ${result.idToken}")



      if (silentSignInTask.isSuccessful) {
        silentSignInTask.addOnCompleteListener(OnCompleteListener<GoogleSignInAccount?> { task ->
          viewModel.handleGoogleAuthTask(task)
        })
      } else {
//        googleSignIn.signOut() // TODO: Should use this on logout instead
        startForResult.launch(googleSignIn.signInIntent)
      }
    }
  )
}
