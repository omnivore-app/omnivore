package app.omnivore.omnivore.ui.library

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DataService
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import java.time.LocalDateTime
import javax.inject.Inject

@HiltViewModel
class LibraryViewModel @Inject constructor(
  private val networker: Networker,
  private val dataService: DataService,
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  private var cursor: String? = null
  private var items: List<SavedItemCardData> = listOf()
  private var searchedItems: List<SavedItemCardData> = listOf()

  // These are used to make sure we handle search result
  // responses in the right order
  private var searchIdx = 0
  private var receivedIdx = 0

  // Live Data
  val searchTextLiveData = MutableLiveData("")
  val itemsLiveData = MutableLiveData<List<SavedItemCardData>>(listOf())
  var isRefreshing by mutableStateOf(false)

  fun updateSearchText(text: String) {
    searchTextLiveData.value = text

    if (text == "") {
      itemsLiveData.value = items
    } else {
      load(clearPreviousSearch = true)
    }
  }

  fun refresh() {
    isRefreshing = true
    load(true)
  }

  fun getLastSyncTime(): LocalDateTime? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.libraryLastSyncTimestamp)?.let {
      LocalDateTime.parse(it)
    }
  }

  fun syncItems() {
    val syncStart = LocalDateTime.now()
    val lastSyncDate = getLastSyncTime() ?: LocalDateTime.MIN

//    try? await dataService.syncOfflineItemsWithServerIfNeeded()
  }

  fun load(clearPreviousSearch: Boolean = false) {
    if (clearPreviousSearch) {
      cursor = null
    }

    viewModelScope.launch {
      val thisSearchIdx = searchIdx
      searchIdx += 1

      // Execute the search
      val searchResult =
        if (searchTextLiveData.value != "") {
          networker.typeaheadSearch(searchTextLiveData.value ?: "")
        } else {
          networker.search(cursor = cursor, query = searchQuery())
        }

      // Search results aren't guaranteed to return in order so this
      // will discard old results that are returned while a user is typing.
      // For example if a user types 'Canucks', often the search results
      // for 'C' are returned after 'Canucks' because it takes the backend
      // much longer to compute.
      if (thisSearchIdx in 1..receivedIdx) {
        return@launch
      }

      receivedIdx = thisSearchIdx
      cursor = searchResult.cursor

      if (searchTextLiveData.value != "" || clearPreviousSearch) {
        val previousItems = if (clearPreviousSearch) listOf() else searchedItems
        searchedItems = previousItems.plus(searchResult.cardsData)
        itemsLiveData.postValue(searchedItems)
      } else {
        items = items.plus(searchResult.cardsData)
        itemsLiveData.postValue(items)
      }

//      withContext(Dispatchers.IO) {
//        dataService.db.savedItemDao().insertAll(items)
//        val items = dataService.db.savedItemDao().getLibraryData()
//        Log.d("appDatabase", "libraryData: $items")
//      }

      CoroutineScope(Dispatchers.Main).launch {
        isRefreshing = false
      }
    }
  }

  fun handleSavedItemAction(itemID: String, action: SavedItemAction) {
    when (action) {
      SavedItemAction.Delete -> {
        removeItemFromList(itemID)

        viewModelScope.launch {
          networker.deleteSavedItem(itemID)
        }
      }
      SavedItemAction.Archive -> {
        removeItemFromList(itemID)
        viewModelScope.launch {
          networker.archiveSavedItem(itemID)
        }
      }
      SavedItemAction.Unarchive -> {
        removeItemFromList(itemID)
        viewModelScope.launch {
          networker.unarchiveSavedItem(itemID)
        }
      }
    }
  }

  private fun removeItemFromList(itemID: String) {
    itemsLiveData.value?.let {
      val newList = it.filter { item -> item.id != itemID }
      itemsLiveData.postValue(newList)
    }
  }

  private fun searchQuery(): String {
      var query = "in:inbox sort:saved"

      if (searchTextLiveData.value != "") {
        query = query.plus(" ${searchTextLiveData.value}")
      }

      return query
  }
}

enum class SavedItemAction {
  Delete,
  Archive,
  Unarchive
}
