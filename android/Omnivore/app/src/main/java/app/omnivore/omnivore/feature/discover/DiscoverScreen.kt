package app.omnivore.omnivore.feature.discover

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.AssistChip
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import app.omnivore.omnivore.core.datastore.discoverTabActive
import app.omnivore.omnivore.core.network.DiscoverFeed
import app.omnivore.omnivore.core.network.DiscoverFeedArticle
import app.omnivore.omnivore.navigation.Routes
import coil.compose.AsyncImage
import com.apollographql.apollo3.api.label
import kotlinx.coroutines.flow.distinctUntilChanged

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun DiscoverScreen(
  navController: NavHostController,
  viewModel: DiscoverViewModel = hiltViewModel()
) {
  val snackbarHostState = remember { SnackbarHostState() }
  val uiState by viewModel.uiState.collectAsStateWithLifecycle()
  val selectedTopic by viewModel.selectedTopic.collectAsStateWithLifecycle()
  val selectedFeed by viewModel.selectedFeed.collectAsStateWithLifecycle()
  val feeds by viewModel.feeds.collectAsStateWithLifecycle()
  val discoverTopicsActive by viewModel.discoverTopicsActiveState.collectAsStateWithLifecycle()

  LaunchedEffect(viewModel.snackbarMessage) {
    viewModel.snackbarMessage?.let {
      snackbarHostState.showSnackbar(it)
      viewModel.clearSnackbarMessage()
    }
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = { Text("Discover") },
        actions = {

        }
      )
    },
    snackbarHost = { SnackbarHost(snackbarHostState) }
  ) { paddingValues ->
    when (uiState) {
      is DiscoverUiState.Loading -> {
        Box(
          modifier = Modifier.fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          CircularProgressIndicator()
        }
      }
      is DiscoverUiState.Success -> {
        val successState = uiState as DiscoverUiState.Success
        DiscoverContent(
          paddingValues = paddingValues,
          articles = successState.articles,
          topics = viewModel.topics,
          selectedTopic = selectedTopic,
          feeds = feeds,
          selectedFeed = selectedFeed,
            topicBarActive = discoverTopicsActive,
          onTopicSelected = { viewModel.setTopic(it) },
          onFeedSelected = { viewModel.setFeed(it) },
          onSaveArticle = { viewModel.saveArticle(it) },
          onLoadMore = { viewModel.loadMore() },
          onRefresh = { viewModel.refresh() }
        )
      }
      is DiscoverUiState.Error -> {
        Box(
          modifier = Modifier.fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          Text("Error loading discover feed")
        }
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DiscoverContent(
    paddingValues: PaddingValues,
    articles: List<DiscoverFeedArticle>,
    topics: List<DiscoverTopic>,
    selectedTopic: DiscoverTopic,
    feeds: List<DiscoverFeed>,
    selectedFeed: String,
    topicBarActive: Boolean,
    onTopicSelected: (DiscoverTopic) -> Unit,
    onFeedSelected: (DiscoverFeed?) -> Unit,
    onSaveArticle: (String) -> Unit,
    onLoadMore: () -> Unit,
    onRefresh: () -> Unit
) {
  val context = LocalContext.current
  val listState = rememberLazyListState()
  val pullToRefreshState = rememberPullToRefreshState()


  if (pullToRefreshState.isRefreshing) {
    LaunchedEffect(true) {
      onRefresh()
      pullToRefreshState.endRefresh()
    }
  }

  Box(
    modifier = Modifier
      .padding(top = paddingValues.calculateTopPadding())
      .fillMaxSize()
      .nestedScroll(pullToRefreshState.nestedScrollConnection)
  ) {
    LazyColumn(
      state = listState,
      verticalArrangement = Arrangement.Top,
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      if (topicBarActive) item {
        TopicFilterBar(
          topics = topics,
          selectedTopic = selectedTopic,
          onTopicSelected = onTopicSelected
        )
      }

      if (feeds.isNotEmpty()) {
        item {
          FeedFilterDropdown(
            feeds = feeds,
            selectedFeed = selectedFeed,
            onFeedSelected = onFeedSelected
          )
        }
      }

      items(
        items = articles,
        key = { it.id }
      ) { article ->
        DiscoverArticleCard(
          article = article,
          onSave = { onSaveArticle(article.id) },
          onClick = {
            val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(article.url))
            context.startActivity(intent)
          }
        )
        HorizontalDivider(thickness = 1.dp)
      }
    }

    InfiniteListHandler(listState = listState) {
      onLoadMore()
    }

    PullToRefreshContainer(
      modifier = Modifier.align(Alignment.TopCenter),
      state = pullToRefreshState,
    )
  }
}

@Composable
private fun TopicFilterBar(
  topics: List<DiscoverTopic>,
  selectedTopic: DiscoverTopic,
  onTopicSelected: (DiscoverTopic) -> Unit
) {
  LazyRow(
    modifier = Modifier
      .fillMaxWidth()
      .padding(vertical = 8.dp, horizontal = 12.dp),
    horizontalArrangement = Arrangement.spacedBy(8.dp)
  ) {
    items(topics) { topic ->
      val selected = topic.title == selectedTopic.title
      Text(
        text = topic.title,
        modifier = Modifier
          .clip(RoundedCornerShape(16.dp))
          .background(
            if (selected) MaterialTheme.colorScheme.primary
            else MaterialTheme.colorScheme.surfaceVariant
          )
          .clickable { onTopicSelected(topic) }
          .padding(horizontal = 16.dp, vertical = 8.dp),
        color = if (selected) MaterialTheme.colorScheme.onPrimary
        else MaterialTheme.colorScheme.onSurface,
        style = TextStyle(
          fontSize = 14.sp,
          fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal
        )
      )
    }
  }
}

@Composable
private fun FeedFilterDropdown(
  feeds: List<DiscoverFeed>,
  selectedFeed: String,
  onFeedSelected: (DiscoverFeed?) -> Unit
) {
  var expanded by remember { mutableStateOf(false) }

  Box(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 16.dp, vertical = 4.dp)
  ) {

      AssistChip(onClick = { expanded = true },
          label = { Text(selectedFeed) },
          trailingIcon = {
              Icon(
                  Icons.Default.ArrowDropDown,
                  contentDescription = "drop down button to change primary library filter"
              )
          },
      )

    DropdownMenu(
      expanded = expanded,
      onDismissRequest = { expanded = false }
    ) {
      DropdownMenuItem(
        text = { Text("All Feeds") },
        onClick = {
          onFeedSelected(null)
          expanded = false
        }
      )
      feeds.forEach { feed ->
        DropdownMenuItem(
          text = { Text(feed.visibleName ?: feed.title) },
          onClick = {
            onFeedSelected(feed)
            expanded = false
          }
        )
      }
    }
  }
}

@Composable
private fun DiscoverArticleCard(
  article: DiscoverFeedArticle,
  onSave: () -> Unit,
  onClick: () -> Unit
) {
  Row(
    verticalAlignment = Alignment.Top,
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    modifier = Modifier
      .fillMaxWidth()
      .clickable(onClick = onClick)
      .padding(horizontal = 16.dp, vertical = 12.dp)
  ) {
    Column(
      modifier = Modifier
        .weight(1f)
        .padding(vertical = 4.dp)
    ) {
      article.siteName?.let {
        Text(
          text = it,
          style = TextStyle(
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
          )
        )
      }

      Text(
        text = article.title,
        style = TextStyle(
          fontSize = 18.sp,
          fontWeight = FontWeight.SemiBold,
          color = MaterialTheme.colorScheme.onBackground
        ),
        maxLines = 2,
        overflow = TextOverflow.Ellipsis
      )

      if (!article.author.isNullOrEmpty()) {
        Text(
          text = article.author,
          style = TextStyle(
            fontSize = 14.sp,
            color = Color(137, 137, 137)
          ),
          maxLines = 1
        )
      }

      if (!article.description.isNullOrEmpty()) {
        Text(
          text = article.description,
          style = TextStyle(
            fontSize = 14.sp,
            color = Color(137, 137, 137)
          ),
          maxLines = 2,
          overflow = TextOverflow.Ellipsis,
          modifier = Modifier.padding(top = 4.dp)
        )
      }

      if (article.savedId != null) {
        Text(
          text = "Saved to library",
          style = TextStyle(
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Medium
          ),
          modifier = Modifier.padding(top = 4.dp)
        )
      }
    }

    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
      AsyncImage(
        model = article.image,
        contentDescription = null,
        modifier = Modifier
          .size(80.dp, 80.dp)
          .clip(RoundedCornerShape(8.dp)),
        contentScale = ContentScale.Crop
      )

      IconButton(onClick = onSave) {
        Icon(
          imageVector = if (article.savedId != null) Icons.Default.Check else Icons.Default.Add,
          contentDescription = if (article.savedId != null) "Saved" else "Save to library",
          tint = if (article.savedId != null) MaterialTheme.colorScheme.primary
          else MaterialTheme.colorScheme.onSurface
        )
      }
    }
  }
}

@Composable
private fun InfiniteListHandler(
  listState: LazyListState,
  buffer: Int = 2,
  onLoadMore: () -> Unit
) {
  val loadMore = remember {
    derivedStateOf {
      val layoutInfo = listState.layoutInfo
      val totalItemsNumber = layoutInfo.totalItemsCount
      val lastVisibleItemIndex = (layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0) + 1
      lastVisibleItemIndex > (totalItemsNumber - buffer)
    }
  }

  LaunchedEffect(loadMore) {
    snapshotFlow { loadMore.value }.distinctUntilChanged().collect {
      onLoadMore()
    }
  }
}
