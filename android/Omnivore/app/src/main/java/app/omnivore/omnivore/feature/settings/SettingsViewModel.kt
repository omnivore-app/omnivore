package app.omnivore.omnivore.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.utils.DatastoreKeys
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.viewer
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
      viewer?.let { v ->
        v.intercomHash?.let { intercomHash ->
          Intercom.client().setUserHash(intercomHash)
        }
        Intercom.client().present(space = IntercomSpace.Messages)
      }
    }
  }
}
