package app.omnivore.omnivore.feature.library

import android.content.Context
import androidx.lifecycle.MediatorLiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.data.archiveSavedItem
import app.omnivore.omnivore.core.data.deleteSavedItem
import app.omnivore.omnivore.core.data.isSavedItemContentStoredInDB
import app.omnivore.omnivore.core.data.librarySearch
import app.omnivore.omnivore.core.data.unarchiveSavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.core.database.entities.TypeaheadCardData
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.typeaheadSearch
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val networker: Networker,
    private val dataService: DataService,
    private val datastoreRepo: DatastoreRepository,
    @ApplicationContext private val applicationContext: Context
) : ViewModel(), SavedItemViewModel {
    private val contentRequestChannel = Channel<String>(capacity = Channel.UNLIMITED)

    private var cursor: String? = null
    private var librarySearchCursor: String? = null

    // These are used to make sure we handle search result
    // responses in the right order
    private var searchIdx = 0
    private var receivedIdx = 0

    // Live Data
    var isRefreshing = MutableLiveData(false)
    val typeaheadMode = MutableLiveData(true)
    val searchTextLiveData = MutableLiveData("")
    val searchItemsLiveData = MutableLiveData<List<TypeaheadCardData>>(listOf())
    val itemsLiveData = MediatorLiveData<List<SavedItemWithLabelsAndHighlights>>()

    override val actionsMenuItemLiveData = MutableLiveData<SavedItemWithLabelsAndHighlights?>(null)

    fun updateSearchText(text: String) {
        typeaheadMode.postValue(true)
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
            isRefreshing.postValue(true)
            itemsLiveData.postValue(listOf())
            typeaheadMode.postValue(false)

            loadUsingSearchAPI()
        }
    }

    private fun loadUsingSearchAPI() {
        viewModelScope.launch {
            val context = applicationContext
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

                itemsLiveData.value?.let {
                    itemsLiveData.postValue(newItems + it)
                } ?: run {
                    itemsLiveData.postValue(newItems)
                }

                isRefreshing.postValue(false)
            }
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

        isRefreshing.postValue(false)
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

    private fun searchQueryString(): String {
        var query = ""
        val searchText = searchTextLiveData.value ?: ""

        if (searchText.isNotEmpty()) {
            query += " $searchText"
        }

        return query
    }
}
