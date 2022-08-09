package app.omnivore.omnivore

import android.content.ContentValues
import android.util.Log
import androidx.lifecycle.ViewModel

class LoginViewModel: ViewModel() {
  fun login(email: String, password: String) {
    Log.v(ContentValues.TAG, "in view model $email / $password")
  }
}
