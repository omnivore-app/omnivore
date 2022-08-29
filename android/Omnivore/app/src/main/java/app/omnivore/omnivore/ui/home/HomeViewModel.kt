package app.omnivore.omnivore.ui.home

import android.util.Log
import androidx.lifecycle.ViewModel
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  private fun getAuthToken(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthToken)
  }

  fun loggo() {
    Log.d("TAG", "logging it!")
  }
}
