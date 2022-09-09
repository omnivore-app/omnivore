package app.omnivore.omnivore.ui.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.*
import app.omnivore.omnivore.*
import app.omnivore.omnivore.graphql.generated.SearchQuery
import app.omnivore.omnivore.graphql.generated.ValidateUsernameQuery
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.Optional
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

enum class RegistrationState {
  SocialLogin,
  EmailSignIn,
  PendingUser
}

@HiltViewModel
class LoginViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  private var validateUsernameJob: Job? = null

  var isLoading by mutableStateOf(false)
    private set

  var errorMessage by mutableStateOf<String?>(null)
    private set

  var hasValidUsername by mutableStateOf<Boolean>(false)
    private set

  var usernameValidationErrorMessage by mutableStateOf<String?>(null)
    private set

  val hasAuthTokenLiveData: LiveData<Boolean> = datastoreRepo
    .hasAuthTokenFlow
    .distinctUntilChanged()
    .asLiveData()

  val registrationStateLiveData = MutableLiveData(RegistrationState.PendingUser) // TODO: switch back to Social

  fun getAuthCookieString(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthCookieString)
  }

  fun showSocialLogin() {
    registrationStateLiveData.value = RegistrationState.SocialLogin
  }

  fun showEmailSignIn() {
    registrationStateLiveData.value = RegistrationState.EmailSignIn
  }

  fun cancelNewUserSignUp() {
    viewModelScope.launch {
      datastoreRepo.clearValue(DatastoreKeys.omnivorePendingUserToken)
    }
    showSocialLogin()
  }

  fun validateUsername(potentialUsername: String) {
    validateUsernameJob?.cancel()

    validateUsernameJob = viewModelScope.launch {
      delay(500)

      // Check the username requirements first
      if (potentialUsername.isEmpty()) {
        usernameValidationErrorMessage = null
        hasValidUsername = false
        return@launch
      }

      if (potentialUsername.length < 4 || potentialUsername.length > 15) {
        usernameValidationErrorMessage = "Username must be between 4 and 15 characters long."
        hasValidUsername = false
        return@launch
      }

      // TODO: check email regex

      val apolloClient = ApolloClient.Builder()
        .serverUrl("${Constants.apiURL}/api/graphql")
        .build()

      val response = apolloClient.query(
        ValidateUsernameQuery(username = potentialUsername)
      ).execute()

      if (response.data?.validateUsername == true) {
        usernameValidationErrorMessage = null
        hasValidUsername = true
      } else {
        hasValidUsername = false
        usernameValidationErrorMessage = "This username is not available."
      }
    }
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
      datastoreRepo.putString(
        DatastoreKeys.omnivorePendingUserToken, result.body()?.pendingUserToken!!
      )
      registrationStateLiveData.value = RegistrationState.PendingUser
    } else {
      errorMessage = "Something went wrong. Please check your credentials and try again"
    }
  }
}
