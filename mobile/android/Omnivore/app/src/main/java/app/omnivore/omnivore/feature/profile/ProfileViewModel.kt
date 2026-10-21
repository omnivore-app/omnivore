package app.omnivore.omnivore.feature.profile

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.libraryLastSyncTimestamp
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.viewer
import dagger.hilt.android.lifecycle.HiltViewModel
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.IntercomSpace
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val networker: Networker,
    private val dataService: DataService,
    private val datastoreRepo: DatastoreRepository
) : ViewModel() {

    var snackbarMessage by mutableStateOf("Resetting data...")

    var isResettingData by mutableStateOf(false)
    var isDataResetCompleted by mutableStateOf(false)

    fun resetDataCache() {
        isResettingData = true

        viewModelScope.launch {
            datastoreRepo.clearValue(libraryLastSyncTimestamp)
            dataService.clearDatabase()
            delay(1000)
            isResettingData = false

            if (!isDataResetCompleted) {
                isDataResetCompleted = true
            }
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
