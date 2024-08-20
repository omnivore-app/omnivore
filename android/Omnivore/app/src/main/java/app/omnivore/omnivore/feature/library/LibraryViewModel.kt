package app.omnivore.omnivore.feature.library

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.data.model.LibraryQuery
import app.omnivore.omnivore.core.data.repository.LibraryRepository
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.followingTabActive
import app.omnivore.omnivore.core.datastore.lastUsedSavedItemFilter
import app.omnivore.omnivore.core.datastore.lastUsedSavedItemSortFilter
import app.omnivore.omnivore.core.datastore.libraryLastSyncTimestamp
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.time.Instant
import javax.inject.Inject

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class LibraryViewModel @Inject constructor(
    private val datastoreRepository: DatastoreRepository,
    private val libraryRepository: LibraryRepository,
    @ApplicationContext private val applicationContext: Context
) : ViewModel(), SavedItemViewModel {

    private val contentRequestChannel = Channel<String>(capacity = Channel.UNLIMITED)
    private var librarySearchCursor: String? = null

    var snackbarMessage by mutableStateOf<String?>(null)
        private set

    private val folders = MutableStateFlow(listOf<String>())

    private val _libraryQuery = MutableStateFlow(
        LibraryQuery(
            folders = folders.value,
            allowedArchiveStates = listOf(0),
            sortKey = "newest",
            requiredLabels = listOf(),
            excludedLabels = listOf(),
            allowedContentReaders = listOf("WEB", "PDF", "EPUB")
        )
    )

    private val followingTabActiveState: StateFlow<Boolean> = datastoreRepository.getBoolean(followingTabActive).stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(),
        initialValue = false
    )

    private fun updateLibraryQuery() {
        _libraryQuery.value = _libraryQuery.value.copy(folders = folders.value)
    }

    init {
        viewModelScope.launch {
            followingTabActiveState.collect { tabActive ->
                if (tabActive) {
                    folders.value = listOf("inbox")
                } else {
                    folders.value = listOf("inbox","following")
                }
                updateLibraryQuery()
            }
        }
    }

    val uiState: StateFlow<LibraryUiState> = _libraryQuery.flatMapLatest { query ->
        libraryRepository.getSavedItems(query)
    }.map(LibraryUiState::Success).stateIn(
        scope = viewModelScope,
        started = SharingStarted.Lazily,
        initialValue = LibraryUiState.Loading
    )

    val appliedFilterState = MutableStateFlow(SavedItemFilter.INBOX)
    val appliedSortFilterLiveData = MutableStateFlow(SavedItemSortFilter.NEWEST)
    val bottomSheetState = MutableStateFlow(LibraryBottomSheetState.HIDDEN)

    val currentItem = mutableStateOf<String?>(null)

    val labelsState = libraryRepository.getSavedItemsLabels().stateIn(
        scope = viewModelScope, started = SharingStarted.Lazily, initialValue = listOf()
    )

    val activeLabels = MutableStateFlow<List<SavedItemLabel>>(listOf())

    override val actionsMenuItemLiveData = MutableLiveData<SavedItemWithLabelsAndHighlights?>(null)

    private fun loadInitialFilterValues() {
        syncLabels()

        viewModelScope.launch {
            handleFilterChanges()
            for (slug in contentRequestChannel) {
                val context = applicationContext
                libraryRepository.fetchSavedItemContent(context, slug)
            }
        }

        updateSavedItemFilter(appliedFilterState.value)
    }

    private fun syncLabels() {
        viewModelScope.launch {
            val labels = libraryRepository.getLabels()
            libraryRepository.insertAllLabels(labels)
        }
    }

    fun clearSnackbarMessage() {
        snackbarMessage = null
    }

    fun refresh() {
        librarySearchCursor = null
        load()
    }

    fun setBottomSheetState(state: LibraryBottomSheetState) {
        bottomSheetState.value = state
    }

    private fun getLastSyncTime(): Instant? = runBlocking {
        datastoreRepository.getString(libraryLastSyncTimestamp)?.let {
            try {
                return@let Instant.parse(it)
            } catch (e: Exception) {
                return@let null
            }
        }
    }

    fun initialLoad() {
        if (getLastSyncTime() == null) {
            librarySearchCursor = null
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
        val context = applicationContext
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                val result = libraryRepository.librarySearch(
                    context = context,
                    cursor = librarySearchCursor,
                    query = searchQueryString()
                )
                result.cursor?.let {
                    librarySearchCursor = it
                }
                result.savedItems.map {
                    val isSavedInDB =
                        libraryRepository.isSavedItemContentStoredInDB(context, it.savedItem.slug)

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
            datastoreRepository.putString(lastUsedSavedItemFilter, filter.rawValue)
            appliedFilterState.value = filter
            handleFilterChanges()
        }
    }

    fun updateSavedItemSortFilter(filter: SavedItemSortFilter) {
        viewModelScope.launch {
            datastoreRepository.putString(lastUsedSavedItemSortFilter, filter.rawValue)
            appliedSortFilterLiveData.value = filter
            handleFilterChanges()
        }
    }

    fun updateAppliedLabels(labels: List<SavedItemLabel>) {
        viewModelScope.launch {
            activeLabels.value = labels
            handleFilterChanges()
        }
    }

    private fun handleFilterChanges() {
        librarySearchCursor = null

        val sortKey = when (appliedSortFilterLiveData.value) {
            SavedItemSortFilter.NEWEST -> "newest"
            SavedItemSortFilter.OLDEST -> "oldest"
            SavedItemSortFilter.RECENTLY_READ -> "recentlyRead"
            SavedItemSortFilter.RECENTLY_PUBLISHED -> "recentlyPublished"
        }

        val allowedArchiveStates = when (appliedFilterState.value) {
            SavedItemFilter.ALL -> listOf(0, 1)
            SavedItemFilter.ARCHIVED -> listOf(1)
            else -> listOf(0)
        }

        val allowedContentReaders = when (appliedFilterState.value) {
            SavedItemFilter.FILES -> listOf("PDF", "EPUB")
            else -> listOf("WEB", "PDF", "EPUB")
        }

        var requiredLabels = when (appliedFilterState.value) {
            SavedItemFilter.NEWSLETTERS -> listOf("Newsletter")
            SavedItemFilter.FEEDS -> listOf("RSS")
            else -> activeLabels.value.map { it.name }
        }

        activeLabels.value.let { it ->
            requiredLabels = requiredLabels + it.map { it.name }
        }

        val excludeLabels = when (appliedFilterState.value) {
            SavedItemFilter.NON_FEED -> listOf("Newsletter", "RSS")
            else -> listOf()
        }

        _libraryQuery.value = LibraryQuery(
            folders = folders.value,
            allowedArchiveStates = allowedArchiveStates,
            sortKey = sortKey,
            requiredLabels = requiredLabels,
            excludedLabels = excludeLabels,
            allowedContentReaders = allowedContentReaders
        )
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
        }
    }

    private suspend fun performItemSync(
        cursor: String?,
        since: String,
        count: Int,
        startTime: String
    ) {
        libraryRepository.syncOfflineItemsWithServerIfNeeded()

        val result = libraryRepository.sync(context = this.applicationContext, since = since, cursor = cursor, limit = 10)
        val totalCount = count + result.count

        if (result.hasError) {
            result.errorString?.let { errorString ->
                System.out.println("SYNC ERROR: ${errorString}")
            }
        }

        if (!result.hasError && result.hasMoreItems && result.cursor != null) {
            performItemSync(
                cursor = result.cursor,
                since = since,
                count = totalCount,
                startTime = startTime,
            )
        } else {
            datastoreRepository.putString(libraryLastSyncTimestamp, startTime)
        }
    }

    override fun handleSavedItemAction(itemId: String, action: SavedItemAction) {
        when (action) {
            SavedItemAction.Delete -> {
                deleteSavedItem(itemId)
            }

            SavedItemAction.Archive -> {
                archiveSavedItem(itemId)
            }

            SavedItemAction.Unarchive -> {
                unarchiveSavedItem(itemId)
            }

            SavedItemAction.EditLabels -> {
                currentItem.value = itemId
                bottomSheetState.value = LibraryBottomSheetState.LABEL
            }

            SavedItemAction.EditInfo -> {
                currentItem.value = itemId
                bottomSheetState.value = LibraryBottomSheetState.EDIT
            }

            SavedItemAction.MarkRead -> {
                viewModelScope.launch {
                    libraryRepository.updateReadingProgress(itemId, 100.0, 0)
                }
            }

            SavedItemAction.MarkUnread -> {
                viewModelScope.launch {
                    libraryRepository.updateReadingProgress(itemId, 0.0, 0)
                }
            }
        }
        actionsMenuItemLiveData.postValue(null)
    }

    fun deleteSavedItem(itemID: String) {
        viewModelScope.launch {
            libraryRepository.deleteSavedItem(itemID)
        }
    }

    fun archiveSavedItem(itemID: String) {
        viewModelScope.launch {
            libraryRepository.archiveSavedItem(itemID)
        }
    }

    fun unarchiveSavedItem(itemID: String) {
        viewModelScope.launch {
            libraryRepository.unarchiveSavedItem(itemID)
        }
    }

    fun updateSavedItemLabels(savedItemId: String, labels: List<SavedItemLabel>) {
        viewModelScope.launch {
            val result = libraryRepository.setSavedItemLabels(
                itemId = savedItemId, labels = labels
            )
            snackbarMessage = if (result) {
                applicationContext.getString(R.string.library_view_model_snackbar_success)
            } else {
                applicationContext.getString(R.string.library_view_model_snackbar_error)
            }
            handleFilterChanges()
        }
    }

    fun createNewSavedItemLabel(labelName: String, hexColorValue: String) {
        viewModelScope.launch {
            libraryRepository.createNewSavedItemLabel(labelName, hexColorValue)
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
            "${appliedFilterState.value.queryString} ${appliedSortFilterLiveData.value.queryString}"

        activeLabels.value.let {
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
