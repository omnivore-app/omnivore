package app.omnivore.omnivore.ui.library

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.MediatorLiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.*
import app.omnivore.omnivore.dataService.*
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.graphql.generated.type.SetLabelsInput
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import java.time.Instant
import javax.inject.Inject

@HiltViewModel
class LibraryViewModel @Inject constructor(
  private val networker: Networker,
  private val dataService: DataService,
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  private val contentRequestChannel = Channel<String>(capacity = Channel.UNLIMITED)

  private var cursor: String? = null
  private var librarySearchCursor: String? = null

  // These are used to make sure we handle search result
  // responses in the right order
  private var searchIdx = 0
  private var receivedIdx = 0

  // Live Data
  val searchTextLiveData = MutableLiveData("")
  val searchItemsLiveData = MutableLiveData<List<TypeaheadCardData>>(listOf())
  private var itemsLiveDataInternal = dataService.libraryLiveData(SavedItemFilter.INBOX, SavedItemSortFilter.NEWEST, listOf())
  val itemsLiveData = MediatorLiveData<List<SavedItemCardDataWithLabels>>()
  val appliedFilterLiveData = MutableLiveData(SavedItemFilter.INBOX)
  val appliedSortFilterLiveData = MutableLiveData(SavedItemSortFilter.NEWEST)
  val showLabelsSelectionSheetLiveData = MutableLiveData(false)
  val labelsSelectionCurrentItemLiveData = MutableLiveData<String?>(null)
  val savedItemLabelsLiveData = dataService.db.savedItemLabelDao().getSavedItemLabelsLiveData()
  val activeLabelsLiveData = MutableLiveData<List<SavedItemLabel>>(listOf())

  var isRefreshing by mutableStateOf(false)
  var hasLoadedInitialFilters = false

  fun loadInitialFilterValues() {
    if (hasLoadedInitialFilters) { return }
    hasLoadedInitialFilters = false

    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        dataService.syncLabels()
      }
    }

    runBlocking {
      datastoreRepo.getString(DatastoreKeys.lastUsedSavedItemFilter)?.let { str ->
        try {
          val filter = SavedItemFilter.values().first { it.rawValue == str }
          appliedFilterLiveData.postValue(filter)
        } catch (e: Exception) {
          Log.d("error", "invalid filter value stored in datastore repo: $e")
        }
      }

      datastoreRepo.getString(DatastoreKeys.lastUsedSavedItemSortFilter)?.let { str ->
        try {
          val filter = SavedItemSortFilter.values().first { it.rawValue == str }
          appliedSortFilterLiveData.postValue(filter)
        } catch (e: Exception) {
          Log.d("error", "invalid sort filter value stored in datastore repo: $e")
        }
      }
    }

    viewModelScope.launch {
      handleFilterChanges()
      for (slug in contentRequestChannel) {
        CoroutineScope(Dispatchers.IO).launch {
          dataService.fetchSavedItemContent(slug)
        }
      }
    }
  }

  fun updateSearchText(text: String) {
    searchTextLiveData.value = text

    if (text == "") {
      searchItemsLiveData.value = listOf()
    } else {
      viewModelScope.launch {
        performTypeaheadSearch(true)
      }
    }
  }

  fun performSearch() {
    // To perform search we just clear the current state, so the LibraryView infinite scroll
    // load will update items.
    viewModelScope.launch {
      itemsLiveData.postValue(listOf())
      librarySearchCursor = null

      withContext(Dispatchers.IO) {
        val result = dataService.librarySearch(cursor = librarySearchCursor, query = searchQueryString())
        result.cursor?.let {
          librarySearchCursor = it
        }
        CoroutineScope(Dispatchers.Main).launch {
          isRefreshing = false
        }

        result.savedItems.map {
          val isSavedInDB = dataService.isSavedItemContentStoredInDB(it.slug)

          if (!isSavedInDB) {
            delay(2000)
            contentRequestChannel.send(it.slug)
          }
        }

        val newItems = result.savedItems.map {
          SavedItemCardDataWithLabels(
            cardData = SavedItemCardData(
              savedItemId = it.savedItemId,
              savedAt = it.savedAt,
              readingProgress = it.readingProgress,
              slug = it.slug,
              publisherURLString = it.publisherURLString,
              title = it.title,
              author = it.author,
              imageURLString = it.imageURLString,
              isArchived = it.isArchived,
              pageURLString = it.pageURLString,
              contentReader = it.contentReader
            ),
            labels = listOf()
          )
        }

        itemsLiveData.postValue(newItems)
      }
    }
  }

  fun refresh() {
    isRefreshing = true
    load(true)
  }

  fun getLastSyncTime(): Instant? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.libraryLastSyncTimestamp)?.let {
      try {
        return@let Instant.parse(it)
      } catch (e: Exception) {
        return@let null
      }
    }
  }

  fun initialLoad() {
    if (getLastSyncTime() == null) {
      hasLoadedInitialFilters = false
      cursor = null
      librarySearchCursor = null
      searchIdx = 0
      receivedIdx = 0
    }

    if (hasLoadedInitialFilters) { return }
    load()
  }

  fun load(clearPreviousSearch: Boolean = false) {
    loadInitialFilterValues()

    viewModelScope.launch {
      syncItems()
      loadUsingSearchAPI()
    }
  }

  fun loadUsingSearchAPI() {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        val result = dataService.librarySearch(cursor = librarySearchCursor, query = searchQueryString())
        result.cursor?.let {
          librarySearchCursor = it
        }
        CoroutineScope(Dispatchers.Main).launch {
          isRefreshing = false
        }

        result.savedItems.map {
          val isSavedInDB = dataService.isSavedItemContentStoredInDB(it.slug)

          if (!isSavedInDB) {
            delay(2000)
            contentRequestChannel.send(it.slug)
          }
        }

        val newItems = result.savedItems.map {
          SavedItemCardDataWithLabels(
            cardData = SavedItemCardData(
              savedItemId = it.savedItemId,
              slug = it.slug,
              publisherURLString = it.publisherURLString,
              title = it.title,
              author = it.author,
              imageURLString = it.imageURLString,
              isArchived = it.isArchived,
              pageURLString = it.pageURLString,
              contentReader = it.contentReader,
              savedAt = it.savedAt,
              readingProgress = it.readingProgress
            ),
            labels = listOf()
          )
        }

        itemsLiveData.value?.let{
          itemsLiveData.postValue(newItems + it)
        } ?: run {
          itemsLiveData.postValue(newItems)
        }
      }
    }
  }

  fun updateSavedItemFilter(filter: SavedItemFilter) {
    viewModelScope.launch {
      datastoreRepo.putString(DatastoreKeys.lastUsedSavedItemFilter, filter.rawValue)
      appliedFilterLiveData.value = filter
      handleFilterChanges()
    }
  }

  fun updateSavedItemSortFilter(filter: SavedItemSortFilter) {
    viewModelScope.launch {
      datastoreRepo.putString(DatastoreKeys.lastUsedSavedItemSortFilter, filter.rawValue)
      appliedSortFilterLiveData.value = filter
      handleFilterChanges()
    }
  }

  fun updateAppliedLabels(labels: List<SavedItemLabel>) {
    viewModelScope.launch {
      activeLabelsLiveData.value = labels
      handleFilterChanges()
    }
  }

  suspend fun handleFilterChanges() {
    if (appliedSortFilterLiveData.value != null && appliedFilterLiveData.value != null) {
      itemsLiveDataInternal = dataService.libraryLiveData(appliedFilterLiveData.value!!, appliedSortFilterLiveData.value!!, activeLabelsLiveData.value ?: listOf())
      itemsLiveData.removeSource(itemsLiveDataInternal)
      itemsLiveData.addSource(itemsLiveDataInternal, itemsLiveData::setValue)
    }
  }

  private suspend fun syncItems() {
    val syncStart = Instant.now()
    val lastSyncDate = getLastSyncTime() ?: Instant.MIN

    withContext(Dispatchers.IO) {
      performItemSync(cursor = null, since = lastSyncDate.toString(), count = 0, startTime = syncStart.toString())
      CoroutineScope(Dispatchers.Main).launch {
        isRefreshing = false
      }
    }
  }

  private suspend fun performItemSync(cursor: String?, since: String, count: Int, startTime: String, isInitialBatch: Boolean = true) {
    dataService.syncOfflineItemsWithServerIfNeeded()
    val result = dataService.sync(since = since, cursor = cursor, limit = 20)

    // Fetch content for the initial batch only
    if (isInitialBatch) {
      for (slug in result.savedItemSlugs) {
        delay(250)
        contentRequestChannel.send(slug)
      }
    }

    val totalCount = count + result.count

    if (!result.hasError && result.hasMoreItems && result.cursor != null) {
      performItemSync(
        cursor = result.cursor,
        since = since,
        count = totalCount,
        startTime = startTime,
        isInitialBatch = false
      )
    } else {
      datastoreRepo.putString(DatastoreKeys.libraryLastSyncTimestamp, startTime)
    }
  }

  private suspend fun performTypeaheadSearch(clearPreviousSearch: Boolean) {
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

    searchItemsLiveData.postValue(searchResult.cardsData)

    CoroutineScope(Dispatchers.Main).launch {
      isRefreshing = false
    }
  }

  fun handleSavedItemAction(itemID: String, action: SavedItemAction) {
    when (action) {
      SavedItemAction.Delete -> {
        viewModelScope.launch {
          dataService.deleteSavedItem(itemID)
        }
      }
      SavedItemAction.Archive -> {
        viewModelScope.launch {
          dataService.archiveSavedItem(itemID)
        }
      }
      SavedItemAction.Unarchive -> {
        viewModelScope.launch {
          dataService.unarchiveSavedItem(itemID)
        }
      }
      SavedItemAction.EditLabels -> {
        labelsSelectionCurrentItemLiveData.value = itemID
        showLabelsSelectionSheetLiveData.value = true
      }
    }
  }

  fun updateSavedItemLabels(savedItemID: String, labels: List<SavedItemLabel>) {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        val input = SetLabelsInput(labelIds = labels.map { it.savedItemLabelId }, pageId = savedItemID)
        val networkResult = networker.updateLabelsForSavedItem(input)

        // TODO: assign a server sync status to these
        val crossRefs = labels.map {
          SavedItemAndSavedItemLabelCrossRef(
            savedItemLabelId = it.savedItemLabelId,
            savedItemId = savedItemID
          )
        }

        // Remove all labels first
        dataService.db.savedItemAndSavedItemLabelCrossRefDao().deleteRefsBySavedItemId(savedItemID)

        // Add back the current labels
        dataService.db.savedItemAndSavedItemLabelCrossRefDao().insertAll(crossRefs)

        CoroutineScope(Dispatchers.Main).launch {
          handleFilterChanges()
        }
      }
    }
  }

  fun createNewSavedItemLabel(labelName: String, hexColorValue: String) {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        val newLabel = networker.createNewLabel(CreateLabelInput(color = hexColorValue, name = labelName))

        newLabel?.let {
          val savedItemLabel = SavedItemLabel(
            savedItemLabelId = it.id,
            name = it.name,
            color = it.color,
            createdAt = it.createdAt as String?,
            labelDescription = it.description
          )

          dataService.db.savedItemLabelDao().insertAll(listOf(savedItemLabel))
        }
      }
    }
  }

  fun currentSavedItemUnderEdit(): SavedItemCardDataWithLabels? {
    labelsSelectionCurrentItemLiveData.value?.let { itemID ->
      return itemsLiveData.value?.first { it.cardData.savedItemId == itemID }
    }

    return null
  }

  private fun searchQueryString(): String {
    var query = "${appliedFilterLiveData.value?.queryString} ${appliedSortFilterLiveData.value?.queryString}"
    val searchText = searchTextLiveData.value ?: ""

    if (searchText.isNotEmpty()) {
      query += " $searchText"
    }

    activeLabelsLiveData.value?.let {
      if (it.isNotEmpty()) {
        query += " label:"
        query += it.joinToString { label -> label.name }
      }
    }

    return query
  }
}

enum class SavedItemAction {
  Delete,
  Archive,
  Unarchive,
  EditLabels
}
