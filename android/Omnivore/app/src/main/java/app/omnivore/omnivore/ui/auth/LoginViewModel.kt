package app.omnivore.omnivore.ui.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.*
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
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

  fun getAuthCookieString(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthCookieString)
  }

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

  fun handleAppleToken(authToken: String) {
    submitAuthProviderPayload(
      params = SignInParams(token = authToken, provider = "APPLE")
    )
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
    val googleIdToken = result.idToken

    // If token is missing then set the error message
    if (googleIdToken == null) {
      errorMessage = "No authentication token found."
      return
    }

    submitAuthProviderPayload(
      params = SignInParams(token = googleIdToken, provider = "GOOGLE")
    )
  }

  private fun submitAuthProviderPayload(params: SignInParams) {
    val login = RetrofitHelper.getInstance().create(AuthProviderLoginSubmit::class.java)

    viewModelScope.launch {
      isLoading = true
      errorMessage = null

      val result = login.submitAuthProviderLogin(params)

      isLoading = false

      if (result.body()?.authToken != null) {
        datastoreRepo.putString(DatastoreKeys.omnivoreAuthToken, result.body()?.authToken!!)

        if (result.body()?.authCookieString != null) {
          datastoreRepo.putString(
            DatastoreKeys.omnivoreAuthCookieString, result.body()?.authCookieString!!
          )
        }
      } else {
        when (result.code()) {
          401, 403 -> {
            // This is a new user so they should go through the new user flow
            submitAuthProviderPayloadForPendingToken(params = params)
          }
          418 -> {
            // Show pending email state
            errorMessage = "Something went wrong. Please check your credentials and try again"
          }
          else -> {
            errorMessage = "Something went wrong. Please check your credentials and try again"
          }
        }
      }
    }
  }

  private suspend fun submitAuthProviderPayloadForPendingToken(params: SignInParams) {
    isLoading = true
    errorMessage = null

    val request = RetrofitHelper.getInstance().create(PendingUserSubmit::class.java)
    val result = request.submitPendingUser(params)

    isLoading = false

    if (result.body()?.pendingUserToken != null) {
      // store in datastore
    } else {
      errorMessage = "Something went wrong. Please check your credentials and try again"
    }
  }
}
