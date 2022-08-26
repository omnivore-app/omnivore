package app.omnivore.omnivore.ui.auth

import android.content.ContentValues
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.*
import app.omnivore.omnivore.*
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import javax.inject.Inject


enum class RegistrationState {
  AuthProviderButtons,
  EmailSignIn
}

@HiltViewModel
class LoginViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  var isLoading by mutableStateOf(false)
    private set

  var errorMessage by mutableStateOf<String?>(null)
    private set

  val hasAuthTokenLiveData: LiveData<Boolean> = datastoreRepo
    .hasAuthTokenFlow
    .distinctUntilChanged()
    .asLiveData()

  fun login(email: String, password: String) {
    val emailLogin = RetrofitHelper.getInstance().create(EmailLoginSubmit::class.java)

    viewModelScope.launch {
      isLoading = true
      errorMessage = null

      val result = emailLogin.submitEmailLogin(
        EmailLoginCredentials(email = email, password = password)
      )

      isLoading = false

      if (result.body()?.pendingEmailVerification == true) {
        errorMessage = "Email needs verification"
        return@launch
      }

      if (result.body()?.authToken != null) {
        datastoreRepo.putString(DatastoreKeys.omnivoreAuthToken, result.body()?.authToken!!)
      } else {
        errorMessage = "Something went wrong. Please check your email/password and try again"
      }

      if (result.body()?.authCookieString != null) {
        datastoreRepo.putString(
          DatastoreKeys.omnivoreAuthCookieString, result.body()?.authCookieString!!
        )
      }
    }
  }

  fun logout() {
    viewModelScope.launch {
      datastoreRepo.clear()
    }
  }

  fun resetErrorMessage() {
    errorMessage = null
  }

  fun showGoogleErrorMessage() {
    errorMessage = "Failed to authenticate with Google."
  }

  fun handleGoogleAuthTask(task: Task<GoogleSignInAccount>) {
    val result = task?.getResult(ApiException::class.java)
    Log.d(ContentValues.TAG, "server auth code?: ${result.serverAuthCode}")
    Log.d(ContentValues.TAG, "is Expired?: ${result.isExpired}")
    Log.d(ContentValues.TAG, "granted Scopes?: ${result.grantedScopes}")
    val googleIdToken = result.idToken
    Log.d(ContentValues.TAG, "Google id token?: $googleIdToken")

    // If token is missing then set the error message
    if (googleIdToken == null) {
      errorMessage = "No authentication token found."
      return
    }

    val login = RetrofitHelper.getInstance().create(AuthProviderLoginSubmit::class.java)

    viewModelScope.launch {
      isLoading = true
      errorMessage = null

      val result = login.submitAuthProviderLogin(
        SignInParams(token = googleIdToken, provider = "GOOGLE")
      )

      isLoading = false

      if (result.body()?.authToken != null) {
        datastoreRepo.putString(DatastoreKeys.omnivoreAuthToken, result.body()?.authToken!!)
      } else {
        errorMessage = "Something went wrong. Please check your credentials and try again"
      }

      if (result.body()?.authCookieString != null) {
        datastoreRepo.putString(
          DatastoreKeys.omnivoreAuthCookieString, result.body()?.authCookieString!!
        )
      }
    }
  }
}
