package app.omnivore.omnivore.ui.notebook

import androidx.lifecycle.*
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.dataService.DataService
import app.omnivore.omnivore.dataService.createNoteHighlight
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.persistence.entities.Highlight
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.library.SavedItemViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class NotebookViewModel @Inject constructor(
    private val networker: Networker,
    private val dataService: DataService,
    private val datastoreRepo: DatastoreRepository
): ViewModel() {
    var highlightUnderEdit: Highlight? = null

    fun getLibraryItemById(savedItemId: String): LiveData<SavedItemWithLabelsAndHighlights> {
        return dataService.db.savedItemDao().getLibraryItemById(savedItemId)
    }

    suspend fun addArticleNote(savedItemId: String, note: String) {
        withContext(Dispatchers.IO) {
            val item = dataService.db.savedItemDao().getById(savedItemId)
            item?.let { item ->
                val noteHighlight = item.highlights.firstOrNull { it.type == "NOTE" }
                noteHighlight?.let {
                    dataService.db.highlightDao()
                        .updateNote(highlightId = noteHighlight.highlightId, note = note)
                } ?: run {
                    dataService.createNoteHighlight(savedItemId, note)
                }
            }
        }
    }
}
