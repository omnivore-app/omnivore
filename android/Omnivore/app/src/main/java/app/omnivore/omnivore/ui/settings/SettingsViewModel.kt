package app.omnivore.omnivore.ui.settings

import androidx.lifecycle.ViewModel
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.dataService.DataService
import app.omnivore.omnivore.networking.Networker
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
  private val networker: Networker,
  private val dataService: DataService,
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  fun resetDataCache() {

  }
}
