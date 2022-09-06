package app.omnivore.omnivore.ui.home

import android.util.Log
import androidx.core.net.toUri
import androidx.lifecycle.*
import app.omnivore.omnivore.Constants
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.graphql.generated.SearchQuery
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.Optional
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  private var cursor: String? = null
  private var items: List<LinkedItem> = listOf()
  private var searchedItems: List<LinkedItem> = listOf()

  // Live Data
  val searchTextLiveData = MutableLiveData<String>("")
  val itemsLiveData = MutableLiveData<List<LinkedItem>>(listOf())

  private fun getAuthToken(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthToken)
  }

  fun updateSearchText(text: String) {
    searchTextLiveData.value = text

    if (text == "") {
      itemsLiveData.value = items
    } else {
      load(clearPreviousSearch = true)
    }
  }

  fun load(clearPreviousSearch: Boolean = false) {
    viewModelScope.launch {
      val authToken = getAuthToken()

      val apolloClient = ApolloClient.Builder()
        .serverUrl("${Constants.apiURL}/api/graphql")
        .addHttpHeader("Authorization", value = authToken ?: "")
        .build()

      val response = apolloClient.query(
        SearchQuery(
          after = Optional.presentIfNotNull(cursor),
          first = Optional.presentIfNotNull(15),
          query = Optional.presentIfNotNull(searchQuery())
        )
      ).execute()

      cursor = response.data?.search?.onSearchSuccess?.pageInfo?.endCursor
      val itemList = response.data?.search?.onSearchSuccess?.edges ?: listOf()

      val newItems = itemList.map {
        LinkedItem(
          id = it.node.id,
          title = it.node.title,
          createdAt = it.node.createdAt,
          readAt = it.node.readAt,
          readingProgress = it.node.readingProgressPercent,
          readingProgressAnchor = it.node.readingProgressAnchorIndex,
          imageURLString = it.node.image,
          descriptionText = it.node.description,
          publisherURLString = it.node.originalArticleUrl,
          author = it.node.author,
          slug = it.node.slug
        )
      }

      if (searchTextLiveData.value != "") {
        val previousItems = if (clearPreviousSearch) listOf() else searchedItems
        searchedItems = previousItems.plus(newItems)
        itemsLiveData.value = searchedItems
      } else {
        items = items.plus(newItems)
        itemsLiveData.value = items
      }
    }
  }

  private fun searchQuery(): String {
      var query = "in:inbox sort:saved"

      if (searchTextLiveData.value != "") {
        query.plus(" ${searchTextLiveData.value}")
      }

      return query
  }
}

public data class LinkedItem(
  public val id: String,
  public val title: String,
  public val createdAt: Any,
//  public val savedAt: Any,
  public val readAt: Any?,
//  public val updatedAt: Any,
  public val readingProgress: Double,
  public val readingProgressAnchor: Int,
  public val imageURLString: String?,
//  public val onDeviceImageURLString: String?,
//  public val documentDirectoryPath: String?,
//  public val pageURLString: String,
  public val descriptionText: String?,
  public val publisherURLString: String?,
//  public val siteName: String?,
  public val author: String?,
//  public val publishDate: Any?,
  public val slug: String,
//  public val isArchived: Boolean,
//  public val contentReader: String?,
//  public val originalHtml: String?,
) {
  fun publisherDisplayName(): String? {
    return publisherURLString?.toUri()?.host
  }
}
