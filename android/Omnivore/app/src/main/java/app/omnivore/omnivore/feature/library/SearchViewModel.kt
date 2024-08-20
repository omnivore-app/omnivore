package app.omnivore.omnivore.feature.library

import android.content.Context
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.data.archiveSavedItem
import app.omnivore.omnivore.core.data.deleteSavedItem
import app.omnivore.omnivore.core.data.isSavedItemContentStoredInDB
import app.omnivore.omnivore.core.data.librarySearch
import app.omnivore.omnivore.core.data.repository.LibraryRepository
import app.omnivore.omnivore.core.data.unarchiveSavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.core.database.entities.TypeaheadCardData
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@OptIn(FlowPreview::class)
@HiltViewModel
class SearchViewModel @Inject constructor(
    private val dataService: DataService,
    private val datastoreRepo: DatastoreRepository,
    private val repository: LibraryRepository,
    @ApplicationContext private val applicationContext: Context
) : ViewModel(), SavedItemViewModel {
    private val contentRequestChannel = Channel<String>(capacity = Channel.UNLIMITED)

    private var librarySearchCursor: String? = null

    var isRefreshing = MutableStateFlow(false)
    val typeaheadMode = MutableStateFlow(true)
    val searchTextFlow = MutableStateFlow("")
    val searchItemsFlow = MutableStateFlow<List<TypeaheadCardData>>(emptyList())
    val itemsState = MutableStateFlow<List<SavedItemWithLabelsAndHighlights>>(emptyList())

    override val actionsMenuItemLiveData = MutableLiveData<SavedItemWithLabelsAndHighlights?>(null)

    init {
        searchTextFlow
            .debounce(300)
            .onEach {
                if (it.isBlank()){
                    searchItemsFlow.update { emptyList() }
                } else {
                    performTypeaheadSearch()
                }
            }.launchIn(viewModelScope)
    }
    fun updateSearchText(text: String) {
        typeaheadMode.update { true }
        searchTextFlow.update { text }
    }

    fun performSearch() {
        // To perform search we just clear the current state, so the LibraryView infinite scroll
        // load will update items.
        viewModelScope.launch {
            isRefreshing.update { true }
            itemsState.update { (listOf()) }
            typeaheadMode.update { false }

            loadUsingSearchAPI()
        }
    }

    private fun loadUsingSearchAPI() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                val result = dataService.librarySearch(
                    context = applicationContext,
                    cursor = librarySearchCursor,
                    query = searchQueryString()
                )
                result.cursor?.let {
                    librarySearchCursor = it
                }

                result.savedItems.map {
                    val isSavedInDB = dataService.isSavedItemContentStoredInDB(applicationContext, it.savedItem.slug)

                    if (!isSavedInDB) {
                        delay(2000)
                        contentRequestChannel.send(it.savedItem.slug)
                    }
                }

                val newItems = result.savedItems
                /*
                .map {
                SavedItemCardDataWithLabels(
                    cardData = SavedItemCardData(
                        savedItemId = it.savedItem.savedItemId,
                        slug = it.savedItem.slug,
                        publisherURLString = it.savedItem.publisherURLString,
                        title = it.savedItem.title,
                        author = it.savedItem.author,
                        imageURLString = it.savedItem.imageURLString,
                        isArchived = it.savedItem.isArchived,
                        pageURLString = it.savedItem.pageURLString,
                        contentReader = it.savedItem.contentReader,
                        savedAt = it.savedItem.savedAt,
                        readingProgress = it.savedItem.readingProgress,
                        wordsCount = it.savedItem.wordsCount
                    ),
                    labels = listOf()
                )
            }
            */

                itemsState.update {
                    it + newItems
                }

                isRefreshing.update { false }
            }
        }
    }

    private suspend fun performTypeaheadSearch() {
        isRefreshing.update { true }

        // Execute the search
        val searchResult = repository.getTypeaheadData(searchTextFlow.value)

        searchItemsFlow.update { searchResult }

        isRefreshing.update { false }
    }

    override fun handleSavedItemAction(itemId: String, action: SavedItemAction) {
        when (action) {
            SavedItemAction.Delete -> {
                viewModelScope.launch {
                    dataService.deleteSavedItem(itemId)
                }
            }

            SavedItemAction.Archive -> {
                viewModelScope.launch {
                    dataService.archiveSavedItem(itemId)
                }
            }

            SavedItemAction.Unarchive -> {
                viewModelScope.launch {
                    dataService.unarchiveSavedItem(itemId)
                }
            }

            SavedItemAction.EditLabels -> {
                // TODO
            }

            SavedItemAction.EditInfo -> {
                // TODO
            }

            SavedItemAction.MarkRead -> TODO()
            SavedItemAction.MarkUnread -> TODO()
        }
        actionsMenuItemLiveData.postValue(null)
    }

    fun updateSavedItemLabels(savedItemID: String, labels: List<SavedItemLabel>) {
//        viewModelScope.launch {
//            withContext(Dispatchers.IO) {
//                val input = SetLabelsInput(labelIds = labels.map { it.savedItemLabelId }, pageId = savedItemID)
//                val networkResult = networker.updateLabelsForSavedItem(input)
//
//                // TODO: assign a server sync status to these
//                val crossRefs = labels.map {
//                    SavedItemAndSavedItemLabelCrossRef(
//                        savedItemLabelId = it.savedItemLabelId,
//                        savedItemId = savedItemID
//                    )
//                }
//
//                // Remove all labels first
//                dataService.db.savedItemAndSavedItemLabelCrossRefDao().deleteRefsBySavedItemId(savedItemID)
//
//                // Add back the current labels
//                dataService.db.savedItemAndSavedItemLabelCrossRefDao().insertAll(crossRefs)
//
//                CoroutineScope(Dispatchers.Main).launch {
//                    handleFilterChanges()
//                }
//            }
//        }
    }

    private fun searchQueryString() = " ${searchTextFlow.value.ifBlank { "" }}"
}
