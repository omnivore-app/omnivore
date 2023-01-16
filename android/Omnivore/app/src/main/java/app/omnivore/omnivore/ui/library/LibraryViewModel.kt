package app.omnivore.omnivore.ui.library

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.*
import app.omnivore.omnivore.dataService.DataService
import app.omnivore.omnivore.dataService.sync
import app.omnivore.omnivore.dataService.syncOfflineItemsWithServerIfNeeded
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.persistence.entities.SavedItemCardDataWithLabels
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

  // These are used to make sure we handle search result
  // responses in the right order
  private var searchIdx = 0
  private var receivedIdx = 0

  // Live Data
  val searchTextLiveData = MutableLiveData("")
  val searchItemsLiveData = MutableLiveData<List<SavedItemCardDataWithLabels>>(listOf())
  val itemsLiveData = dataService.db.savedItemDao().getLibraryLiveDataWithLabels()

  var isRefreshing by mutableStateOf(false)

  fun updateSearchText(text: String) {
    searchTextLiveData.value = text

    if (text == "") {
      searchItemsLiveData.value = listOf()
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

  fun load(clearPreviousSearch: Boolean = false) {
    viewModelScope.launch {
      if (searchTextLiveData.value != "") {
        performSearch(clearPreviousSearch)
      } else {
        syncItems()
      }
    }
  }

  private suspend fun syncItems() {
    val syncStart = LocalDateTime.now()
    val lastSyncDate = getLastSyncTime() ?: LocalDateTime.MIN

    CoroutineScope(Dispatchers.Main).launch {
      isRefreshing = false
    }

    withContext(Dispatchers.IO) {
      performItemSync(cursor = null, since = lastSyncDate.toString(), count = 0, startTime = syncStart.toString())
    }
  }

  private suspend fun performItemSync(cursor: String?, since: String, count: Int, startTime: String) {
    dataService.syncOfflineItemsWithServerIfNeeded()
    val result = dataService.sync(since = since, cursor = cursor)

    // TODO: Defer this until later? /fix - this results in a 429 server error
//    for (slug in result.savedItemSlugs) {
//      dataService.syncSavedItemContent(slug)
//    }

    val totalCount = count + result.count

    Log.d("sync", "fetched ${result.count} items")

    if (totalCount < 180 && !result.hasError && result.hasMoreItems && result.cursor != null) {
      performItemSync(cursor = result.cursor, since = since, count = totalCount, startTime = startTime)
    } else {
      datastoreRepo.putString(DatastoreKeys.libraryLastSyncTimestamp, startTime)
    }
  }

  private suspend fun performSearch(clearPreviousSearch: Boolean) {
    if (clearPreviousSearch) {
      cursor = null
    }

    val thisSearchIdx = searchIdx
    searchIdx += 1

    // Execute the search
    val searchResult = networker.typeaheadSearch(searchTextLiveData.value ?: "")

    // Search results aren't guaranteed to return in order so this
    // will discard old results that are returned while a user is typing.
    // For example if a user types 'Canucks', often the search results
    // for 'C' are returned after 'Canucks' because it takes the backend
    // much longer to compute.
    if (thisSearchIdx in 1..receivedIdx) {
      return
    }

    val cardsDataWithLabels = searchResult.cardsData.map {
      SavedItemCardDataWithLabels(cardData = it, labels = listOf())
    }

    searchItemsLiveData.postValue(cardsDataWithLabels)

    CoroutineScope(Dispatchers.Main).launch {
      isRefreshing = false
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
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        dataService.db.savedItemDao().deleteById(itemID)
      }
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
