package app.omnivore.omnivore

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST


data class EmailAuthPayload(
  val authCookieString: String?,
  val authToken: String?,
  val pendingEmailVerification: Boolean?
)

data class EmailLoginCredentials(
  val email: String,
  val password: String
)

interface EmailLoginSubmit {
  @Headers("Content-Type: application/json")
  @POST("/api/mobile-auth/email-sign-in")
  suspend fun submitEmailLogin(@Body credentials: EmailLoginCredentials): Response<EmailAuthPayload>
}

object RetrofitHelper {
  fun getInstance(): Retrofit {
    return Retrofit.Builder().baseUrl(Constants.demoProdURL)
      .addConverterFactory(GsonConverterFactory.create())
      .build()
  }
}
