package app.omnivore.omnivore.ui.notebook

import androidx.lifecycle.*
import androidx.room.Query
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.dataService.DataService
import app.omnivore.omnivore.dataService.createNoteHighlight
import app.omnivore.omnivore.dataService.updateWebHighlight
import app.omnivore.omnivore.graphql.generated.type.UpdateHighlightInput
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.updateHighlight
import app.omnivore.omnivore.persistence.entities.Highlight
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.library.SavedItemViewModel
import com.apollographql.apollo3.api.Optional
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

                    networker.updateHighlight(input = UpdateHighlightInput(
                        highlightId = noteHighlight.highlightId,
                        annotation = Optional.presentIfNotNull(note),
                    ))
                } ?: run {
                    dataService.createNoteHighlight(savedItemId, note)
                }
            }
        }
    }

    suspend fun updateHighlightNote(highlightId: String, note: String?) {
        withContext(Dispatchers.IO) {
            dataService.db.highlightDao().updateNote(highlightId, note ?: "")
            networker.updateHighlight(input = UpdateHighlightInput(
                highlightId = highlightId,
                annotation = Optional.presentIfNotNull(note),
            ))
        }
    }
}
