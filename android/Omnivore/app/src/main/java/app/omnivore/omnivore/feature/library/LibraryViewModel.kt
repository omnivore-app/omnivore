package app.omnivore.omnivore.feature.library

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.data.archiveSavedItem
import app.omnivore.omnivore.core.data.deleteSavedItem
import app.omnivore.omnivore.core.data.fetchSavedItemContent
import app.omnivore.omnivore.core.data.isSavedItemContentStoredInDB
import app.omnivore.omnivore.core.data.librarySearch
import app.omnivore.omnivore.core.data.model.LibraryQuery
import app.omnivore.omnivore.core.data.repository.LibraryRepository
import app.omnivore.omnivore.core.data.sync
import app.omnivore.omnivore.core.data.syncLabels
import app.omnivore.omnivore.core.data.syncOfflineItemsWithServerIfNeeded
import app.omnivore.omnivore.core.data.unarchiveSavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.createNewLabel
import app.omnivore.omnivore.feature.ResourceProvider
import app.omnivore.omnivore.feature.setSavedItemLabels
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.utils.DatastoreKeys
import com.apollographql.apollo3.api.Optional
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.time.Instant
import javax.inject.Inject

@HiltViewModel
class LibraryViewModel @Inject constructor(
    private val networker: Networker,
    private val dataService: DataService,
    private val datastoreRepo: DatastoreRepository,
    private val resourceProvider: ResourceProvider,
    private val libraryRepository: LibraryRepository,
) : ViewModel(), SavedItemViewModel {

    private val contentRequestChannel = Channel<String>(capacity = Channel.UNLIMITED)
    private var cursor: String? = null
    private var librarySearchCursor: String? = null

    var snackbarMessage by mutableStateOf<String?>(null)
        private set

    private val _libraryQuery = MutableStateFlow(
        LibraryQuery(
            allowedArchiveStates = listOf(0),
            sortKey = "newest",
            requiredLabels = listOf(),
            excludedLabels = listOf(),
            allowedContentReaders = listOf("WEB", "PDF", "EPUB")
        )
    )

    // Correct way - but not working
/*    val uiState: StateFlow<LibraryUiState> = _libraryQuery.flatMapLatest { query ->
        libraryRepository.getSavedItems(query)
    }
        .map(LibraryUiState::Success)
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Lazily,
            initialValue = LibraryUiState.Loading
        )*/

    // This approach needs to be replaced with the StateFlow above after fixing Room Flow
    private val _uiState = MutableStateFlow<LibraryUiState>(LibraryUiState.Loading)
    val uiState: StateFlow<LibraryUiState> = _uiState

    init {
        loadSavedItems()
    }

    private fun loadSavedItems() {
        viewModelScope.launch {
            libraryRepository.getSavedItems(_libraryQuery.value)
                .collect { favoriteNews ->
                    _uiState.value = LibraryUiState.Success(favoriteNews)
                }
        }
    }

    val appliedFilterLiveData = MutableLiveData(SavedItemFilter.INBOX)
    val appliedSortFilterLiveData = MutableLiveData(SavedItemSortFilter.NEWEST)
    val bottomSheetState = MutableLiveData(LibraryBottomSheetState.HIDDEN)
    val currentItem = mutableStateOf<String?>(null)
    val savedItemLabelsLiveData = dataService.db.savedItemLabelDao().getSavedItemLabelsLiveData()
    val activeLabelsLiveData = MutableLiveData<List<SavedItemLabel>>(listOf())

    override val actionsMenuItemLiveData = MutableLiveData<SavedItemWithLabelsAndHighlights?>(null)

    var isRefreshing by mutableStateOf(false)
    private var hasLoadedInitialFilters = false

    private fun loadInitialFilterValues() {

        if (hasLoadedInitialFilters) {
            return
        }
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
        load()
    }

    private fun getLastSyncTime(): Instant? = runBlocking {
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
        }

        if (hasLoadedInitialFilters) {
            return
        }
        load()
    }

    fun load() {
        loadInitialFilterValues()

        viewModelScope.launch {
            syncItems()
            loadUsingSearchAPI()
        }
    }

    fun loadUsingSearchAPI() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                val result = dataService.librarySearch(
                    cursor = librarySearchCursor, query = searchQueryString()
                )
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

    private fun handleFilterChanges() {
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

            val allowedContentReaders = when (appliedFilterLiveData.value) {
                SavedItemFilter.FILES -> listOf("PDF", "EPUB")
                else -> listOf("WEB", "PDF", "EPUB")
            }

            var requiredLabels = when (appliedFilterLiveData.value) {
                SavedItemFilter.NEWSLETTERS -> listOf("Newsletter")
                SavedItemFilter.FEEDS -> listOf("RSS")
                else -> (activeLabelsLiveData.value ?: listOf()).map { it.name }
            }

            activeLabelsLiveData.value?.let { it ->
                requiredLabels = requiredLabels + it.map { it.name }
            }


            val excludeLabels = when (appliedFilterLiveData.value) {
                SavedItemFilter.READ_LATER -> listOf("Newsletter", "RSS")
                else -> listOf()
            }

            _libraryQuery.value = LibraryQuery(
                allowedArchiveStates = allowedArchiveStates,
                sortKey = sortKey,
                requiredLabels = requiredLabels,
                excludedLabels = excludeLabels,
                allowedContentReaders = allowedContentReaders
            )
            loadSavedItems()
        }
    }

    private suspend fun syncItems() {
        val syncStart = Instant.now()
        val lastSyncDate = getLastSyncTime() ?: Instant.MIN

        withContext(Dispatchers.IO) {
            performItemSync(
                cursor = null,
                since = lastSyncDate.toString(),
                count = 0,
                startTime = syncStart.toString()
            )
            CoroutineScope(Dispatchers.Main).launch {
                isRefreshing = false
            }
        }
    }

    private suspend fun performItemSync(
        cursor: String?,
        since: String,
        count: Int,
        startTime: String,
        isInitialBatch: Boolean = true
    ) {
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
                deleteSavedItem(itemID)
            }

            SavedItemAction.Archive -> {
                archiveSavedItem(itemID)
            }

            SavedItemAction.Unarchive -> {
                unarchiveSavedItem(itemID)
            }

            SavedItemAction.EditLabels -> {
                currentItem.value = itemID
                bottomSheetState.value = LibraryBottomSheetState.LABEL
            }

            SavedItemAction.EditInfo -> {
                currentItem.value = itemID
                bottomSheetState.value = LibraryBottomSheetState.EDIT
            }

            SavedItemAction.MarkRead -> {
                viewModelScope.launch {
                    _uiState.value = LibraryUiState.Success(emptyList())
                    libraryRepository.updateReadingProgress(itemID, 100.0, 0)
                    loadSavedItems()
                }
            }

            SavedItemAction.MarkUnread -> {
                viewModelScope.launch {
                    _uiState.value = LibraryUiState.Success(emptyList())
                    libraryRepository.updateReadingProgress(itemID, 0.0, 0)
                    loadSavedItems()
                }
            }
        }
        actionsMenuItemLiveData.postValue(null)
    }

    fun deleteSavedItem(itemID: String) {
        viewModelScope.launch {
            dataService.deleteSavedItem(itemID)
        }
    }

    fun archiveSavedItem(itemID: String) {
        viewModelScope.launch {
            dataService.archiveSavedItem(itemID)
        }
    }

    fun unarchiveSavedItem(itemID: String) {
        viewModelScope.launch {
            dataService.unarchiveSavedItem(itemID)
        }
    }

    fun updateSavedItemLabels(savedItemID: String, labels: List<SavedItemLabel>) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                val result = setSavedItemLabels(
                    networker = networker,
                    dataService = dataService,
                    savedItemID = savedItemID,
                    labels = labels
                )

                snackbarMessage = if (result) {
                    resourceProvider.getString(R.string.library_view_model_snackbar_success)
                } else {
                    resourceProvider.getString(R.string.library_view_model_snackbar_error)
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
                val newLabel = networker.createNewLabel(
                    CreateLabelInput(
                        color = Optional.presentIfNotNull(hexColorValue), name = labelName
                    )
                )

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
        currentItem.value?.let { itemID ->
            return (uiState.value as LibraryUiState.Success).items.first { it.savedItem.savedItemId == itemID }
        }

        return null
    }

    private fun searchQueryString(): String {
        var query =
            "${appliedFilterLiveData.value?.queryString} ${appliedSortFilterLiveData.value?.queryString}"

        activeLabelsLiveData.value?.let {
            if (it.isNotEmpty()) {
                query += " label:"
                query += it.joinToString { label -> label.name }
            }
        }

        return query
    }
}

sealed interface LibraryUiState {
    data object Loading : LibraryUiState

    data class Success(
        val items: List<SavedItemWithLabelsAndHighlights>,
    ) : LibraryUiState

    data object Error : LibraryUiState
}

enum class SavedItemAction {
    Delete, Archive, Unarchive, EditLabels, EditInfo, MarkRead, MarkUnread
}
