package app.omnivore.omnivore.ui.library

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.*
import app.omnivore.omnivore.*
import app.omnivore.omnivore.dataService.*
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.graphql.generated.type.SetLabelsInput
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.*
import app.omnivore.omnivore.ui.ResourceProvider
import com.apollographql.apollo3.api.Optional
import com.apollographql.apollo3.api.Optional.Companion.presentIfNotNull
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import java.time.Instant
import javax.inject.Inject

@HiltViewModel
class LibraryViewModel @Inject constructor(
  private val networker: Networker,
  private val dataService: DataService,
  private val datastoreRepo: DatastoreRepository,
  private val resourceProvider: ResourceProvider
): ViewModel(), SavedItemViewModel {
  private val contentRequestChannel = Channel<String>(capacity = Channel.UNLIMITED)

  private var cursor: String? = null
  private var librarySearchCursor: String? = null

  // These are used to make sure we handle search result
  // responses in the right order
  private var searchIdx = 0
  private var receivedIdx = 0

  var snackbarMessage by mutableStateOf<String?>(null)
    private set

  // Live Data
  private var itemsLiveDataInternal = dataService.db.savedItemDao().filteredLibraryData(
    allowedArchiveStates = listOf(0),
    sortKey = "newest",
    requiredLabels = listOf(),
    excludedLabels = listOf(),
    allowedContentReaders = listOf("WEB", "PDF", "EPUB")
  )
  val itemsLiveData = MediatorLiveData<List<SavedItemWithLabelsAndHighlights>>()
  val appliedFilterLiveData = MutableLiveData(SavedItemFilter.INBOX)
  val appliedSortFilterLiveData = MutableLiveData(SavedItemSortFilter.NEWEST)
  val showLabelsSelectionSheetLiveData = MutableLiveData(false)
  val labelsSelectionCurrentItemLiveData = MutableLiveData<String?>(null)
  val savedItemLabelsLiveData = dataService.db.savedItemLabelDao().getSavedItemLabelsLiveData()
  val activeLabelsLiveData = MutableLiveData<List<SavedItemLabel>>(listOf())

  override val actionsMenuItemLiveData = MutableLiveData<SavedItemWithLabelsAndHighlights?>(null)

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

    viewModelScope.launch {
      handleFilterChanges()
      for (slug in contentRequestChannel) {
        CoroutineScope(Dispatchers.IO).launch {
          dataService.fetchSavedItemContent(slug)
        }
      }
    }
  }

  fun clearSnackbarMessage() {
    snackbarMessage = null
  }

  fun refresh() {
    cursor = null
    librarySearchCursor = null
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
          val isSavedInDB = dataService.isSavedItemContentStoredInDB(it.savedItem.slug)

          if (!isSavedInDB) {
            delay(2000)
            contentRequestChannel.send(it.savedItem.slug)
          }
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

  fun sortKey(appliedSortKey: String) {
    when(appliedSortKey) {

    }
  }
  fun handleFilterChanges() {
    librarySearchCursor = null

    if (appliedSortFilterLiveData.value != null && appliedFilterLiveData.value != null) {
      val sortKey = when (appliedSortFilterLiveData.value) {
        SavedItemSortFilter.NEWEST -> "newest"
        SavedItemSortFilter.OLDEST -> "oldest"
        SavedItemSortFilter.RECENTLY_READ -> "recentlyRead"
        SavedItemSortFilter.RECENTLY_PUBLISHED -> "recentlyPublished"
        else -> "newest"
      }

      val allowedArchiveStates = when (appliedFilterLiveData.value) {
        SavedItemFilter.ALL -> listOf(0, 1)
        SavedItemFilter.ARCHIVED -> listOf(1)
        else -> listOf(0)
      }

      val allowedContentReaders = when(appliedFilterLiveData.value) {
        SavedItemFilter.FILES -> listOf("PDF", "EPUB")
        else -> listOf("WEB", "PDF", "EPUB")
      }

      var requiredLabels = when(appliedFilterLiveData.value) {
        SavedItemFilter.NEWSLETTERS -> listOf("Newsletter")
        else -> (activeLabelsLiveData.value ?: listOf()).map { it.name }
      }
     activeLabelsLiveData.value?.let {
       requiredLabels = requiredLabels + it.map { it.name }
     }


      val excludeLabels = when(appliedFilterLiveData.value) {
        SavedItemFilter.READ_LATER -> listOf("Newsletter")
        else -> listOf()
      }

      val newData = dataService.db.savedItemDao().filteredLibraryData(
        allowedArchiveStates = allowedArchiveStates,
        sortKey = sortKey,
        requiredLabels = requiredLabels,
        excludedLabels = excludeLabels,
        allowedContentReaders = allowedContentReaders
      )

     itemsLiveData.removeSource(itemsLiveDataInternal)
      itemsLiveDataInternal = newData
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

  override fun handleSavedItemAction(itemID: String, action: SavedItemAction) {
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
      else -> {

      }
    }
    actionsMenuItemLiveData.postValue(null)
  }

  fun updateSavedItemLabels(savedItemID: String, labels: List<SavedItemLabel>) {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        val syncedLabels = labels.filter { it.serverSyncStatus == ServerSyncStatus.IS_SYNCED.rawValue }
        val unsyncedLabels = labels.filter { it.serverSyncStatus != ServerSyncStatus.IS_SYNCED.rawValue }

        var labelCreationError = false
        val createdLabels = unsyncedLabels.mapNotNull { label ->
          val result = networker.createNewLabel(CreateLabelInput(
            name = label.name,
            color = presentIfNotNull(label.color),
            description = presentIfNotNull(label.labelDescription),
          ))
          result?.let {
            SavedItemLabel(
              savedItemLabelId = result.id,
              name = result.name,
              color = result.color,
              createdAt = result.createdAt.toString(),
              labelDescription = result.description,
              serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            )
          } ?: run {
            labelCreationError = true
            null
          }
        }

        dataService.db.savedItemLabelDao().insertAll(createdLabels)

        val allLabels = syncedLabels + createdLabels

        val input = SetLabelsInput(labelIds =  Optional.presentIfNotNull(allLabels.map { it.savedItemLabelId }), pageId = savedItemID)
        val networkResult = networker.updateLabelsForSavedItem(input)

        val crossRefs = allLabels.map {
          SavedItemAndSavedItemLabelCrossRef(
            savedItemLabelId = it.savedItemLabelId,
            savedItemId = savedItemID
          )
        }

        // Remove all labels first
        dataService.db.savedItemAndSavedItemLabelCrossRefDao().deleteRefsBySavedItemId(savedItemID)

        // Add back the current labels
        dataService.db.savedItemAndSavedItemLabelCrossRefDao().insertAll(crossRefs)

        if (!networkResult || labelCreationError) {
          snackbarMessage = resourceProvider.getString(R.string.library_view_model_snackbar_error)
        } else {
          snackbarMessage = resourceProvider.getString(R.string.library_view_model_snackbar_success)
        }

        CoroutineScope(Dispatchers.Main).launch {
          handleFilterChanges()
        }
      }
    }
  }

  fun createNewSavedItemLabel(labelName: String, hexColorValue: String) {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        val newLabel = networker.createNewLabel(CreateLabelInput(color = Optional.presentIfNotNull(hexColorValue), name = labelName))

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

  fun currentSavedItemUnderEdit(): SavedItemWithLabelsAndHighlights? {
    labelsSelectionCurrentItemLiveData.value?.let { itemID ->
      return itemsLiveData.value?.first { it.savedItem.savedItemId == itemID }
    }

    return null
  }

  private fun searchQueryString(): String {
    var query = "${appliedFilterLiveData.value?.queryString} ${appliedSortFilterLiveData.value?.queryString}"

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
  EditLabels,
}
