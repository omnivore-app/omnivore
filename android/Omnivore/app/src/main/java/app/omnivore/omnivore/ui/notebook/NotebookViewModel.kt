package app.omnivore.omnivore.ui.notebook

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.dataService.DataService
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.library.SavedItemViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class NotebookViewModel @Inject constructor(
    private val networker: Networker,
    private val dataService: DataService,
    private val datastoreRepo: DatastoreRepository
): ViewModel() {

    fun getLibraryItemById(savedItemId: String): LiveData<SavedItemWithLabelsAndHighlights> {
        return dataService.db.savedItemDao().getLibraryItemById(savedItemId)
    }
}
