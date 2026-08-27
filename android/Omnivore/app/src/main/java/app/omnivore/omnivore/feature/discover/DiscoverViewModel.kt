package app.omnivore.omnivore.feature.discover

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.discoverTopicsActive
import app.omnivore.omnivore.core.network.DiscoverFeed
import app.omnivore.omnivore.core.network.DiscoverFeedArticle
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.getDiscoverFeeds
import app.omnivore.omnivore.core.network.getDiscoverFeedArticles
import app.omnivore.omnivore.core.network.saveDiscoverArticle
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale
import javax.inject.Inject

data class DiscoverTopic(
  val title: String,
  val subTitle: String
)

sealed interface DiscoverUiState {
  data object Loading : DiscoverUiState
  data class Success(
    val articles: List<DiscoverFeedArticle>,
    val feeds: List<DiscoverFeed>,
    val selectedFeed: String,
    val selectedTopic: DiscoverTopic,
    val hasMore: Boolean,
    val cursor: String?
  ) : DiscoverUiState
  data object Error : DiscoverUiState
}

@HiltViewModel
class DiscoverViewModel @Inject constructor(
  private val networker: Networker,
  @ApplicationContext private val applicationContext: Context,
  private val datastoreRepository: DatastoreRepository
) : ViewModel() {

  var snackbarMessage by mutableStateOf<String?>(null)
    private set

  private val _uiState = MutableStateFlow<DiscoverUiState>(DiscoverUiState.Loading)
  val uiState: StateFlow<DiscoverUiState> = _uiState

  public val topics = listOf(
    DiscoverTopic("All", "All the discover stories..."),
    DiscoverTopic("Technology", "Stories about Gadgets, AI, Software and other technology related topics"),
    DiscoverTopic("Politics", "Stories about Leadership, Elections, and issues affecting countries and the world"),
    DiscoverTopic("Health & Wellbeing", "Stories about Physical, Mental and Preventative Health"),
    DiscoverTopic("Business & Finance", "Stories about the business world, startups, and the world of financial advice."),
    DiscoverTopic("Science & Education", "Stories about science, breakthroughs, and the way the world works."),
    DiscoverTopic("Culture", "Entertainment, Movies, Television and things that make life worth living"),
    DiscoverTopic("Gaming", "PC and Console gaming, reviews, and opinions"),
  )

  private val _selectedTopic = MutableStateFlow(topics[0])
  val selectedTopic: StateFlow<DiscoverTopic> = _selectedTopic

  private val _selectedFeedName = MutableStateFlow("All Feeds")
  private val _selectedFeedId = MutableStateFlow("All Feeds")
  val selectedFeed: StateFlow<String> = _selectedFeedName

  private val _feeds = MutableStateFlow<List<DiscoverFeed>>(emptyList())
  val feeds: StateFlow<List<DiscoverFeed>> = _feeds

    val discoverTopicsActiveState: StateFlow<Boolean> = datastoreRepository.getBoolean(discoverTopicsActive).stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(),
        initialValue = false
    )

  private var currentCursor: String? = null

  init {
    loadFeeds()
    loadArticles(initialLoad = true)
  }

  fun clearSnackbarMessage() {
    snackbarMessage = null
  }

  fun setTopic(topic: DiscoverTopic) {
    if (_selectedTopic.value.title != topic.title) {
      _selectedTopic.value = topic
      currentCursor = null
      loadArticles(initialLoad = true)
    }
  }

  fun setFeed(feed: DiscoverFeed?) {
      if (feed == null) {
        _selectedFeedName.value = "All Feeds"
          _selectedFeedId.value = "All Feeds"
          currentCursor = null
          loadArticles(initialLoad = true)
      } else if (_selectedFeedName.value != feed.title) {
      _selectedFeedName.value = feed.visibleName ?: feed.title
        _selectedFeedId.value = feed.id
      currentCursor = null
      loadArticles(initialLoad = true)
    }
  }

  fun refresh() {
    currentCursor = null
    loadFeeds()
    loadArticles(initialLoad = true)
  }

  fun loadMore() {
    val state = _uiState.value
    if (state is DiscoverUiState.Success && state.hasMore) {
      loadArticles(initialLoad = false)
    }
  }

  private fun loadFeeds() {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        val result = networker.getDiscoverFeeds()
        _feeds.value = result
      }
    }
  }

  private fun loadArticles(initialLoad: Boolean) {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        if (initialLoad) {
          _uiState.value = DiscoverUiState.Loading
        }

        val limit = 10
        val after = if (initialLoad) "0" else currentCursor
        val feedId = if (_selectedFeedId.value == "All Feeds") null else _selectedFeedId.value
        val topicId = _selectedTopic.value.title

        val result = networker.getDiscoverFeedArticles(
          after = after,
          discoverTopicId = topicId,
          feedId = feedId,
          first = limit,
          showHidden = true
        )

        if (result.error) {
          if (initialLoad) {
            _uiState.value = DiscoverUiState.Error
          }
        } else {
          currentCursor = result.cursor
          if (initialLoad) {
            _uiState.value = DiscoverUiState.Success(
              articles = result.articles,
              feeds = _feeds.value,
              selectedFeed = _selectedFeedId.value,
              selectedTopic = _selectedTopic.value,
              hasMore = result.hasMore,
              cursor = result.cursor
            )
          } else {
            val currentState = _uiState.value
            if (currentState is DiscoverUiState.Success) {
              _uiState.value = currentState.copy(
                articles = currentState.articles + result.articles,
                hasMore = result.hasMore,
                cursor = result.cursor
              )
            }
          }
        }
      }
    }
  }

  fun saveArticle(discoverArticleId: String) {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        val locale = Locale.getDefault().toLanguageTag()
        val saveId = networker.saveDiscoverArticle(discoverArticleId, locale)
        if (saveId != null) {
          snackbarMessage = "Article saved to your library"
          val currentState = _uiState.value
          if (currentState is DiscoverUiState.Success) {
            val updatedArticles = currentState.articles.map { article ->
              if (article.id == discoverArticleId) {
                article.copy(savedId = saveId)
              } else {
                article
              }
            }
            _uiState.value = currentState.copy(articles = updatedArticles)
          }
        } else {
          snackbarMessage = "Error saving article"
        }
      }
    }
  }
}
