package app.omnivore.omnivore.feature.onboarding.auth.provider

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.BuildConfig
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.tasks.Task

@Composable
fun GoogleAuthButton(viewModel: OnboardingViewModel) {
    val context = LocalContext.current

    val signInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestIdToken(BuildConfig.OMNIVORE_GAUTH_SERVER_CLIENT_ID).requestEmail().build()

    val startForResult =
        rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result: ActivityResult ->
            if (result.resultCode == Activity.RESULT_OK) {
                val intent = result.data
                if (result.data != null) {
                    val task: Task<GoogleSignInAccount> =
                        GoogleSignIn.getSignedInAccountFromIntent(intent)
                    viewModel.handleGoogleAuthTask(task)
                }
            } else {
                viewModel.showGoogleErrorMessage()
            }
        }

    OutlinedButton(
        onClick = {
            val googleSignIn = GoogleSignIn.getClient(context, signInOptions)

            googleSignIn.silentSignIn().addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    viewModel.handleGoogleAuthTask(task)
                } else {
                    startForResult.launch(googleSignIn.signInIntent)
                }
            }.addOnFailureListener {
                startForResult.launch(googleSignIn.signInIntent)
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 16.dp, end = 16.dp),
        shape = RoundedCornerShape(6.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.White,
            contentColor = MaterialTheme.colorScheme.onSurface
        )
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_logo_google),
            contentDescription = "",
            modifier = Modifier.padding(end = 10.dp)
        )
        Text(text = stringResource(R.string.google_auth_text), modifier = Modifier.padding(vertical = 6.dp))
        if (viewModel.isLoading) {
            Spacer(modifier = Modifier.width(16.dp))
            CircularProgressIndicator(
                modifier = Modifier
                    .height(16.dp)
                    .width(16.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}
