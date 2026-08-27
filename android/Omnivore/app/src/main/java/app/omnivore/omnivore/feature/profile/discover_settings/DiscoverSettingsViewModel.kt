package app.omnivore.omnivore.feature.profile.discover_settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.discoverTabActive
import app.omnivore.omnivore.core.datastore.discoverTopicsActive
import app.omnivore.omnivore.core.datastore.followingTabActive
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DiscoverSettingsViewModel @Inject constructor(
    private val datastoreRepository: DatastoreRepository
) : ViewModel() {

    val discoverTabActiveState: StateFlow<Boolean> = datastoreRepository.getBoolean(discoverTabActive).stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(),
        initialValue = false
    )

    val discoverTopicsActiveState: StateFlow<Boolean> = datastoreRepository.getBoolean(discoverTopicsActive).stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(),
        initialValue = false
    )

    fun setDiscoverTabActiveState(value: Boolean) {
        viewModelScope.launch {
            datastoreRepository.putBoolean(discoverTabActive, value)
        }
    }

    fun setDiscoverTopicsActiveState(value: Boolean) {
        viewModelScope.launch {
            datastoreRepository.putBoolean(discoverTopicsActive, value)
        }
    }
}
