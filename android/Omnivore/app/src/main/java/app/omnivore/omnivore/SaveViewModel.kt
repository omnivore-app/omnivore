package app.omnivore.omnivore

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@HiltViewModel
class SaveViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  fun getAuthToken(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthToken)
  }
}
