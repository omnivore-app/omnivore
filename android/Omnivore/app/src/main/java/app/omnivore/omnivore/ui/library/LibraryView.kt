package app.omnivore.omnivore.ui.library

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.persistence.entities.SavedItemCardDataWithLabels
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.components.LabelChipColors
import app.omnivore.omnivore.ui.savedItemViews.SavedItemCard
import app.omnivore.omnivore.ui.reader.PDFReaderActivity
import app.omnivore.omnivore.ui.reader.WebReaderLoadingContainerActivity
import kotlinx.coroutines.flow.distinctUntilChanged


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryView(
  libraryViewModel: LibraryViewModel,
  navController: NavHostController
) {
  Scaffold(
    topBar = {
      SearchBar(
        libraryViewModel = libraryViewModel,
        onSettingsIconClick = { navController.navigate(Routes.Settings.route) }
      )
    }
  ) { paddingValues ->
    LibraryViewContent(
      libraryViewModel,
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
fun LibraryViewContent(libraryViewModel: LibraryViewModel, modifier: Modifier) {
  val context = LocalContext.current
  val listState = rememberLazyListState()

  val pullRefreshState = rememberPullRefreshState(
    refreshing = libraryViewModel.isRefreshing,
    onRefresh = { libraryViewModel.refresh() }
  )

  val cardsData: List<SavedItemCardDataWithLabels> by libraryViewModel.itemsLiveData.observeAsState(listOf())
  val searchedCardsData: List<SavedItemCardDataWithLabels> by libraryViewModel.searchItemsLiveData.observeAsState(listOf())

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
      if (!libraryViewModel.showSearchField) {
        item {
          LibraryFilterBar(libraryViewModel)
        }
      }
      items(if (libraryViewModel.showSearchField) searchedCardsData else cardsData) { cardDataWithLabels ->
        SavedItemCard(
          cardData = cardDataWithLabels.cardData,
          labels = cardDataWithLabels.labels,
          onClickHandler = {
            val activityClass = if (cardDataWithLabels.cardData.isPDF()) PDFReaderActivity::class.java else WebReaderLoadingContainerActivity::class.java
            val intent = Intent(context, activityClass)
            intent.putExtra("SAVED_ITEM_SLUG", cardDataWithLabels.cardData.slug)
            context.startActivity(intent)
          },
          actionHandler = { libraryViewModel.handleSavedItemAction(cardDataWithLabels.cardData.savedItemId, it) }
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

    LabelsSelectionSheet(viewModel = libraryViewModel)
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LabelsSelectionSheet(viewModel: LibraryViewModel) {
  val listState = rememberLazyListState()
  val isActive: Boolean by viewModel.showLabelsSelectionSheetLiveData.observeAsState(false)
  val labels: List<SavedItemLabel> by viewModel.savedItemLabelsLiveData.observeAsState(listOf())
  val selectedLabels = remember { mutableStateOf(viewModel.activeLabelsLiveData.value) }

  if (isActive) {
    Dialog(onDismissRequest = { viewModel.showLabelsSelectionSheetLiveData.value = false } ) {
      Surface(
        modifier = Modifier
          .fillMaxSize()
          .background(MaterialTheme.colorScheme.background),
        shape = RoundedCornerShape(16.dp)
      ) {
        LazyColumn(
          state = listState,
          verticalArrangement = Arrangement.Top,
          horizontalAlignment = Alignment.CenterHorizontally,
          modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 6.dp)
        ) {
          item {
            Row(
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier
                .fillMaxWidth()
            ) {
              TextButton(onClick = { viewModel.showLabelsSelectionSheetLiveData.value = false }) {
                Text(text = "Cancel")
              }

              Text("Filter by Label", fontWeight = FontWeight.ExtraBold)

              TextButton(
                onClick = {
                  selectedLabels.value?.let {
                    viewModel.activeLabelsLiveData.value = it
                  }
                  viewModel.showLabelsSelectionSheetLiveData.value = false
                }
              ) {
                Text(text = "Done")
              }
            }
          }
          items(labels) { label ->
            val isLabelSelected = (selectedLabels.value ?: listOf()).contains(label)

            Row(
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier
                .fillMaxWidth()
                .clickable {
                  if (isLabelSelected) {
                    selectedLabels.value = (selectedLabels.value ?: listOf()).filter { it.savedItemLabelId != label.savedItemLabelId }
                  } else {
                    selectedLabels.value = (selectedLabels.value ?: listOf()) + listOf(label)
                  }
                }
                .padding(horizontal = 6.dp)
            ) {
              val chipColors = LabelChipColors.fromHex(label.color)

              SuggestionChip(
                onClick = {},
                label = { Text(label.name) },
                border = null,
                colors = SuggestionChipDefaults.elevatedSuggestionChipColors(
                  containerColor = chipColors.containerColor,
                  labelColor = chipColors.textColor,
                  iconContentColor = chipColors.textColor
                )
              )
              if (isLabelSelected) {
                Icon(
                  imageVector = Icons.Default.Check,
                  contentDescription = null
                )
              }
            }
            Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)
          }
        }
      }
    }
  }
}
