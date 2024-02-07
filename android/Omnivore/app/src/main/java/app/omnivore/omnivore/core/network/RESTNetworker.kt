package app.omnivore.omnivore.core.network

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

data class AuthPayload(
  val authCookieString: String,
  val authToken: String
)

data class PendingUserAuthPayload(
  val pendingUserToken: String,
)

data class SignInParams(
  val token: String,
  val provider: String, // APPLE or GOOGLE
  val source: String = "ANDROID"
)

data class EmailSignUpParams(
  val email: String,
  val password: String,
  val username: String,
  val name: String
)

data class EmailAuthPayload(
  val authCookieString: String?,
  val authToken: String?,
  val pendingEmailVerification: Boolean?
)

data class EmailLoginCredentials(
  val email: String,
  val password: String
)

data class CreateAccountParams(
  val pendingUserToken: String,
  val userProfile: UserProfile
)

data class UserProfile(
  val username: String,
  val name: String
)

interface EmailLoginSubmit {
  @Headers("Content-Type: application/json")
  @POST("/api/mobile-auth/email-sign-in")
  suspend fun submitEmailLogin(@Body credentials: EmailLoginCredentials): Response<EmailAuthPayload>
}

interface AuthProviderLoginSubmit {
  @Headers("Content-Type: application/json")
  @POST("/api/mobile-auth/sign-in")
  suspend fun submitAuthProviderLogin(@Body params: SignInParams): Response<AuthPayload>
}

interface PendingUserSubmit {
  @Headers("Content-Type: application/json")
  @POST("/api/mobile-auth/sign-up")
  suspend fun submitPendingUser(@Body params: SignInParams): Response<PendingUserAuthPayload>
}

interface CreateAccountSubmit {
  @Headers("Content-Type: application/json")
  @POST("/api/mobile-auth/create-account")
  suspend fun submitCreateAccount(@Body params: CreateAccountParams): Response<AuthPayload>
}

interface CreateEmailAccountSubmit {
  @Headers("Content-Type: application/json")
  @POST("/api/mobile-auth/email-sign-up")
  suspend fun submitCreateEmailAccount(@Body params: EmailSignUpParams): Response<Unit>
}

object RetrofitHelper {
  suspend fun getInstance(networker: Networker): Retrofit {
    val baseUrl = networker.baseUrl()
    return Retrofit.Builder().baseUrl(baseUrl)
      .addConverterFactory(GsonConverterFactory.create())
      .build()
  }
}
