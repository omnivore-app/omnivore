package app.omnivore.omnivore.ui.library

import android.content.Intent
import android.util.Log
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.ModalBottomSheetLayout
import androidx.compose.material.ModalBottomSheetValue
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material.rememberModalBottomSheetState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.components.LabelsSelectionSheetContent
import app.omnivore.omnivore.ui.savedItemViews.SavedItemCard
import app.omnivore.omnivore.ui.reader.PDFReaderActivity
import app.omnivore.omnivore.ui.reader.WebReaderLoadingContainerActivity
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch


@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun LibraryView(
  libraryViewModel: LibraryViewModel,
  navController: NavHostController
) {
  val showLabelsSelectionSheet: Boolean by libraryViewModel.showLabelsSelectionSheetLiveData.observeAsState(false)

  val coroutineScope = rememberCoroutineScope()
  val modalBottomSheetState = rememberModalBottomSheetState(
    ModalBottomSheetValue.Hidden,
    confirmStateChange = { it != ModalBottomSheetValue.Hidden }
  )

  if (showLabelsSelectionSheet) {
    coroutineScope.launch {
      modalBottomSheetState.animateTo(ModalBottomSheetValue.HalfExpanded)
    }
  } else {
    coroutineScope.launch {
      modalBottomSheetState.hide()
    }
  }

  ModalBottomSheetLayout(
    sheetBackgroundColor = Color.Transparent,
    sheetState = modalBottomSheetState,
    sheetContent = {
      BottomSheetContent(libraryViewModel)
      Spacer(modifier = Modifier.weight(1.0F))
    }
  ) {
    Scaffold(
      topBar = {
        LibraryNavigationBar(
          savedItemViewModel = libraryViewModel,
          onSearchClicked = { navController.navigate(Routes.Search.route) },
          onSettingsIconClick = { navController.navigate(Routes.Settings.route) }
        )
      },
    ) { paddingValues ->
      LibraryViewContent(
        libraryViewModel,
        modifier = Modifier
          .padding(top = paddingValues.calculateTopPadding())
      )
    }
  }
}

@Composable
fun BottomSheetContent(libraryViewModel: LibraryViewModel) {
  val showLabelsSelectionSheet: Boolean by libraryViewModel.showLabelsSelectionSheetLiveData.observeAsState(false)
  val currentSavedItemData = libraryViewModel.currentSavedItemUnderEdit()
  val labels: List<SavedItemLabel> by libraryViewModel.savedItemLabelsLiveData.observeAsState(listOf())

  if (showLabelsSelectionSheet) {
    BottomSheetUI {
      if (currentSavedItemData != null) {
        LabelsSelectionSheetContent(
          labels = labels,
          initialSelectedLabels = currentSavedItemData.labels,
          onCancel = {
            libraryViewModel.showLabelsSelectionSheetLiveData.value = false
            libraryViewModel.labelsSelectionCurrentItemLiveData.value = null
          },
          isLibraryMode = false,
          onSave = {
            if (it != labels) {
              libraryViewModel.updateSavedItemLabels(
                savedItemID = currentSavedItemData.savedItem.savedItemId,
                labels = it
              )
            }
            libraryViewModel.labelsSelectionCurrentItemLiveData.value = null
            libraryViewModel.showLabelsSelectionSheetLiveData.value = false
          },
          onCreateLabel = { newLabelName, labelHexValue ->
            libraryViewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
          }
        )
      } else { // Is used in library mode
        LabelsSelectionSheetContent(
          labels = labels,
          initialSelectedLabels = libraryViewModel.activeLabelsLiveData.value ?: listOf(),
          onCancel = { libraryViewModel.showLabelsSelectionSheetLiveData.value = false },
          isLibraryMode = true,
          onSave = {
            libraryViewModel.updateAppliedLabels(it)
            libraryViewModel.labelsSelectionCurrentItemLiveData.value = null
            libraryViewModel.showLabelsSelectionSheetLiveData.value = false
          },
          onCreateLabel = { newLabelName, labelHexValue ->
            libraryViewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
          }
        )
      }
    }
  }
}

@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class)
@Composable
fun LibraryViewContent(libraryViewModel: LibraryViewModel, modifier: Modifier) {
  val context = LocalContext.current
  val listState = rememberLazyListState()

  val pullRefreshState = rememberPullRefreshState(
    refreshing = libraryViewModel.isRefreshing,
    onRefresh = { libraryViewModel.refresh() }
  )

  val cardsData: List<SavedItemWithLabelsAndHighlights> by libraryViewModel.itemsLiveData.observeAsState(
    listOf()
  )

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
      item {
        LibraryFilterBar(libraryViewModel)
      }
      items(cardsData) { cardDataWithLabels ->
        SavedItemCard(
          savedItemViewModel = libraryViewModel,
          savedItem = cardDataWithLabels,
          onClickHandler = {
            val activityClass =
              if (cardDataWithLabels.savedItem.contentReader == "PDF") PDFReaderActivity::class.java else WebReaderLoadingContainerActivity::class.java
            val intent = Intent(context, activityClass)
            intent.putExtra("SAVED_ITEM_SLUG", cardDataWithLabels.savedItem.slug)
            context.startActivity(intent)
          },
          actionHandler = {
            libraryViewModel.handleSavedItemAction(
              cardDataWithLabels.savedItem.savedItemId,
              it
            )
          }
        )
      }
    }

    InfiniteListHandler(listState = listState) {
      if (cardsData.isEmpty()) {
        Log.d("sync", "loading with load func")
        libraryViewModel.initialLoad()
      } else {
        Log.d("sync", "loading with search api")
        libraryViewModel.loadUsingSearchAPI()
      }
    }

    PullRefreshIndicator(
      refreshing = libraryViewModel.isRefreshing,
      state = pullRefreshState,
      modifier = Modifier.align(Alignment.TopCenter)
    )

    // LabelsSelectionSheet(viewModel = libraryViewModel)
  }
}

@Composable
private fun BottomSheetUI(content: @Composable () -> Unit) {
  Box(
    modifier = Modifier
      .wrapContentHeight()
      .fillMaxWidth()
      .clip(RoundedCornerShape(topEnd = 20.dp, topStart = 20.dp))
      .background(Color.White)
      .statusBarsPadding()
  ) {
    content()
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
