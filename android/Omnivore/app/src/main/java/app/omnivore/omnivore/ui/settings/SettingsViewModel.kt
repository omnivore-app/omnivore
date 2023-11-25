package app.omnivore.omnivore.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.dataService.DataService
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.viewer
import dagger.hilt.android.lifecycle.HiltViewModel
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.IntercomSpace
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
  private val networker: Networker,
  private val dataService: DataService,
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  fun resetDataCache() {
    viewModelScope.launch {
      datastoreRepo.clearValue(DatastoreKeys.libraryLastSyncTimestamp)
      dataService.clearDatabase()
    }
  }

  fun presentIntercom() {
    viewModelScope.launch {
      val viewer = networker.viewer()
      viewer?.let { viewer ->
        viewer?.intercomHash?.let { intercomHash ->
          Intercom.client().setUserHash(intercomHash)
        }
        Intercom.client().present(space = IntercomSpace.Messages)
      }
    }
  }
}
