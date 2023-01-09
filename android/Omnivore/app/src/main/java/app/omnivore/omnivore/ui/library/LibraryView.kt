package app.omnivore.omnivore.ui.library

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.ui.savedItemViews.SavedItemCard
import app.omnivore.omnivore.ui.reader.PDFReaderActivity
import kotlinx.coroutines.flow.distinctUntilChanged


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryView(
  libraryViewModel: LibraryViewModel,
  navController: NavHostController
) {
  val searchText: String by libraryViewModel.searchTextLiveData.observeAsState("")

  Scaffold(
    topBar = {
      SearchBar(
        searchText = searchText,
        onSearchTextChanged = { libraryViewModel.updateSearchText(it) },
        onSettingsIconClick = { navController.navigate(Routes.Settings.route) }
      )
    }
  ) { paddingValues ->
    LibraryViewContent(
      libraryViewModel,
      navController,
      modifier = Modifier
        .padding(
          top = paddingValues.calculateTopPadding(),
          bottom = paddingValues.calculateBottomPadding()
        )
    )
  }
}

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun LibraryViewContent(
  libraryViewModel: LibraryViewModel,
  navController: NavHostController,
  modifier: Modifier
) {
  val context = LocalContext.current
  val listState = rememberLazyListState()

  val pullRefreshState = rememberPullRefreshState(
    refreshing = libraryViewModel.isRefreshing,
    onRefresh = { libraryViewModel.refresh() }
  )

  val cardsData: List<SavedItemCardData> by libraryViewModel.itemsLiveData.observeAsState(listOf())

  Box(
    modifier = Modifier
      .fillMaxSize()
      .pullRefresh(pullRefreshState)
  ) {
    LazyColumn(
      state = listState,
      verticalArrangement = Arrangement.Top,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = modifier
        .background(MaterialTheme.colorScheme.background)
        .fillMaxSize()
        .padding(horizontal = 6.dp)
    ) {
      items(cardsData) { cardData ->
        SavedItemCard(
          cardData = cardData,
          onClickHandler = {
            if (cardData.isPDF()) {
              val intent = Intent(context, PDFReaderActivity::class.java)
              intent.putExtra("SAVED_ITEM_SLUG", cardData.slug)
              context.startActivity(intent)
            } else {
              navController.navigate("WebReader/${cardData.slug}")
            }
          },
          actionHandler = { libraryViewModel.handleSavedItemAction(cardData.id, it) }
        )
      }
    }

    InfiniteListHandler(listState = listState) {
      libraryViewModel.load()
    }
    
    PullRefreshIndicator(
      refreshing = libraryViewModel.isRefreshing,
      state = pullRefreshState,
      modifier = Modifier.align(Alignment.TopCenter)
    )
  }
}

@Composable
fun InfiniteListHandler(
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
    snapshotFlow { loadMore.value }
      .distinctUntilChanged()
      .collect {
        onLoadMore()
      }
  }
}
