package app.omnivore.omnivore.ui.home

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.search
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
  private val networker: Networker
): ViewModel() {
  private var cursor: String? = null
  private var items: List<LinkedItem> = listOf()
  private var searchedItems: List<LinkedItem> = listOf()

  // These are used to make sure we handle search result
  // responses in the right order
  private var searchIdx = 0
  private var receivedIdx = 0

  // Live Data
  val searchTextLiveData = MutableLiveData<String>("")
  val itemsLiveData = MutableLiveData<List<LinkedItem>>(listOf())

  fun updateSearchText(text: String) {
    searchTextLiveData.value = text

    if (text == "") {
      itemsLiveData.value = items
    } else {
      load(clearPreviousSearch = true)
    }
  }

  fun load(clearPreviousSearch: Boolean = false) {
    if (clearPreviousSearch) {
      cursor = null
    }

    viewModelScope.launch {
      val thisSearchIdx = searchIdx
      searchIdx += 1

      // Execute the search
      val searchResult = networker.search(cursor = cursor, query = searchQuery())

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

      if (searchTextLiveData.value != "") {
        val previousItems = if (clearPreviousSearch) listOf() else searchedItems
        searchedItems = previousItems.plus(searchResult.items)
        itemsLiveData.value = searchedItems
      } else {
        items = items.plus(searchResult.items)
        itemsLiveData.value = items
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
