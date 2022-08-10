package app.omnivore.omnivore

import android.content.ContentValues
import android.util.Log
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class LoginViewModel: ViewModel() {
  fun login(email: String, password: String) {
    val emailLogin = RetrofitHelper.getInstance().create(EmailLoginSubmit::class.java)

    GlobalScope.launch {
      val result = emailLogin.submitEmailLogin(
        EmailLoginCredentials(email = email, password = password)
      )

      // TODO: parse out result and store auth token
      // set some variable that compose can observe
      if (result != null) {
        Log.d(ContentValues.TAG, result.body().toString())
      } else {
        Log.d(ContentValues.TAG, result.body().toString())
      }
    }
  }
}
