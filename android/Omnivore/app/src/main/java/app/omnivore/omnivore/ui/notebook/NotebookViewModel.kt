package app.omnivore.omnivore.ui.notebook

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.liveData
import androidx.lifecycle.map
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

    suspend fun addArticleNote(savedItemId: String, note: String): Boolean {
        val item = dataService.db.savedItemDao().getById(savedItemId)
        println("this is an item: $item")
        return item?.let { item ->
            println("this is an item: $item")
            val noteHighlight = item.highlights.first { it.type == "NOTE" }
            noteHighlight?.let {

            } ?: run {

            }
            return true
        } ?: false
    }
}
