package app.omnivore.omnivore.feature.library

import android.content.Intent
import android.util.Log
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.FloatTweenSpec
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.DismissDirection
import androidx.compose.material.DismissState
import androidx.compose.material.DismissValue
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.FractionalThreshold
import androidx.compose.material.Icon
import androidx.compose.material.ScaffoldState
import androidx.compose.material.SwipeToDismiss
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Unarchive
import androidx.compose.material.rememberDismissState
import androidx.compose.material.rememberScaffoldState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.feature.components.AddLinkSheetContent
import app.omnivore.omnivore.feature.components.LabelsSelectionSheetContent
import app.omnivore.omnivore.feature.components.LabelsViewModel
import app.omnivore.omnivore.feature.editinfo.EditInfoSheetContent
import app.omnivore.omnivore.feature.editinfo.EditInfoViewModel
import app.omnivore.omnivore.feature.reader.PDFReaderActivity
import app.omnivore.omnivore.feature.reader.WebReaderLoadingContainerActivity
import app.omnivore.omnivore.feature.save.SaveState
import app.omnivore.omnivore.feature.save.SaveViewModel
import app.omnivore.omnivore.feature.savedItemViews.SavedItemCard
import app.omnivore.omnivore.navigation.Routes
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

@Composable
internal fun LibraryView(
    labelsViewModel: LabelsViewModel,
    saveViewModel: SaveViewModel,
    editInfoViewModel: EditInfoViewModel,
    navController: NavHostController,
    viewModel: LibraryViewModel = hiltViewModel()
) {
    val scaffoldState: ScaffoldState = rememberScaffoldState()

    val coroutineScope = rememberCoroutineScope()

    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    val showBottomSheet: LibraryBottomSheetState by viewModel.bottomSheetState.observeAsState(
        LibraryBottomSheetState.HIDDEN
    )

    viewModel.snackbarMessage?.let {
        coroutineScope.launch {
            scaffoldState.snackbarHostState.showSnackbar(it)
            viewModel.clearSnackbarMessage()
        }
    }

    when (showBottomSheet) {
        LibraryBottomSheetState.ADD_LINK -> {
            AddLinkBottomSheet(saveViewModel) {
                viewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN
            }
        }

        LibraryBottomSheetState.LABEL -> {
            LabelBottomSheet(
                viewModel,
                labelsViewModel
            ) {
                viewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN
            }
        }

        LibraryBottomSheetState.EDIT -> {
            EditBottomSheet(
                editInfoViewModel,
                viewModel
            ) {
                viewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN
            }
        }

        LibraryBottomSheetState.HIDDEN -> {
        }
    }

    Scaffold(
        topBar = {
            LibraryNavigationBar(
                savedItemViewModel = viewModel,
                onSearchClicked = { navController.navigate(Routes.Search.route) },
                onAddLinkClicked = { showAddLinkBottomSheet(viewModel) },
                onSettingsIconClick = { navController.navigate(Routes.Settings.route) }
            )
        },
    ) { paddingValues ->
        when (uiState) {
            is LibraryUiState.Success -> {
                LibraryViewContent(
                    viewModel,
                    paddingValues = paddingValues,
                    uiState = uiState
                )
            }
            is LibraryUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(strokeCap  = StrokeCap.Round)
                }
            }
            else -> {
                // TODO
            }
        }
    }
}

fun showAddLinkBottomSheet(libraryViewModel: LibraryViewModel) {
    libraryViewModel.bottomSheetState.value = LibraryBottomSheetState.ADD_LINK
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LabelBottomSheet(
    libraryViewModel: LibraryViewModel,
    labelsViewModel: LabelsViewModel,
    onDismiss: () -> Unit = {}
) {
    ModalBottomSheet(
        onDismissRequest = { onDismiss() },
        containerColor = MaterialTheme.colorScheme.background,
        sheetState = rememberModalBottomSheetState(
            skipPartiallyExpanded = true
        ),
    ) {

        val currentSavedItemData = libraryViewModel.currentSavedItemUnderEdit()
        val labels: List<SavedItemLabel> by libraryViewModel.savedItemLabelsLiveData.observeAsState(
            listOf()
        )
        if (currentSavedItemData != null) {
            LabelsSelectionSheetContent(
                labels = labels,
                labelsViewModel = labelsViewModel,
                initialSelectedLabels = currentSavedItemData.labels,
                onCancel = {
                    libraryViewModel.currentItem.value = null
                    onDismiss()
                },
                isLibraryMode = false,
                onSave = {
                    if (it != labels) {
                        libraryViewModel.updateSavedItemLabels(
                            savedItemID = currentSavedItemData.savedItem.savedItemId,
                            labels = it
                        )
                    }
                    libraryViewModel.currentItem.value = null
                    onDismiss()
                },
                onCreateLabel = { newLabelName, labelHexValue ->
                    libraryViewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
                }
            )
        } else { // Is used in library mode
            LabelsSelectionSheetContent(
                labels = labels,
                labelsViewModel = labelsViewModel,
                initialSelectedLabels = libraryViewModel.activeLabelsLiveData.value ?: listOf(),
                onCancel = { onDismiss() },
                isLibraryMode = true,
                onSave = {
                    libraryViewModel.updateAppliedLabels(it)
                    libraryViewModel.currentItem.value = null
                    onDismiss()
                },
                onCreateLabel = { newLabelName, labelHexValue ->
                    libraryViewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddLinkBottomSheet(
    saveViewModel: SaveViewModel,
    onDismiss: () -> Unit = {}
) {
    ModalBottomSheet(
        onDismissRequest = { onDismiss() },
        containerColor = MaterialTheme.colorScheme.background,
        sheetState = rememberModalBottomSheetState(
            skipPartiallyExpanded = true
        ),
    ) {

        AddLinkSheetContent(
            viewModel = saveViewModel,
            onCancel = {
                saveViewModel.state.value = SaveState.DEFAULT
                onDismiss()
            },
            onLinkAdded = {
                saveViewModel.state.value = SaveState.DEFAULT
                onDismiss()
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditBottomSheet(
    editInfoViewModel: EditInfoViewModel,
    libraryViewModel: LibraryViewModel,
    onDismiss: () -> Unit = {}
) {
    ModalBottomSheet(
        onDismissRequest = { onDismiss() },
        containerColor = MaterialTheme.colorScheme.background,
        sheetState = rememberModalBottomSheetState(
            skipPartiallyExpanded = true
        ),
    ) {
        val currentSavedItemData = libraryViewModel.currentSavedItemUnderEdit()
        EditInfoSheetContent(
            savedItemId = currentSavedItemData?.savedItem?.savedItemId,
            title = currentSavedItemData?.savedItem?.title,
            author = currentSavedItemData?.savedItem?.author,
            description = currentSavedItemData?.savedItem?.descriptionText,
            viewModel = editInfoViewModel,
            onCancel = {
                libraryViewModel.currentItem.value = null
                onDismiss()
            },
            onUpdated = {
                libraryViewModel.currentItem.value = null
                libraryViewModel.refresh()
                onDismiss()
            }
        )
    }
}


@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class)
@Composable
fun LibraryViewContent(
    libraryViewModel: LibraryViewModel,
    paddingValues: PaddingValues,
    uiState: LibraryUiState
) {
    val context = LocalContext.current
    val listState = rememberLazyListState()

    val pullToRefreshState = rememberPullToRefreshState()
    if (pullToRefreshState.isRefreshing) {
        LaunchedEffect(true) {
            // fetch something
            delay(1500)
            libraryViewModel.refresh()
            pullToRefreshState.endRefresh()
        }
    }

    val selectedItem: SavedItemWithLabelsAndHighlights? by libraryViewModel.actionsMenuItemLiveData.observeAsState()

    Box(
        modifier = Modifier
            .padding(top = paddingValues.calculateTopPadding())
            .fillMaxSize()
            .nestedScroll(pullToRefreshState.nestedScrollConnection)
    ) {
        Column {
            LibraryFilterBar()
            HorizontalDivider()
            LazyColumn(
                state = listState,
                verticalArrangement = Arrangement.Top,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                items(
                    items = (uiState as LibraryUiState.Success).items,
                    key = { item -> item.savedItem.savedItemId }
                ) { cardDataWithLabels ->
                    val swipeThreshold = 0.45f

                    val currentThresholdFraction = remember { mutableStateOf(0f) }
                    val currentItem by rememberUpdatedState(cardDataWithLabels.savedItem)
                    val swipeState = rememberDismissState(
                        confirmStateChange = {
                            when(it) {
                                DismissValue.Default -> {
                                    return@rememberDismissState false
                                }
                                DismissValue.DismissedToEnd -> {
                                    if (currentThresholdFraction.value < swipeThreshold) {
                                        return@rememberDismissState false
                                    }
                                }
                                DismissValue.DismissedToStart -> {
                                    if (currentThresholdFraction.value < swipeThreshold) {
                                        return@rememberDismissState false
                                    }
                                }
                            }

                            if (it == DismissValue.DismissedToEnd) { // Archiving/UnArchiving.
                                if (currentItem.isArchived) {
                                    libraryViewModel.unarchiveSavedItem(currentItem.savedItemId)
                                } else {
                                    libraryViewModel.archiveSavedItem(currentItem.savedItemId)
                                }
                            } else if (it == DismissValue.DismissedToStart) { // Deleting.
                                libraryViewModel.deleteSavedItem(currentItem.savedItemId)
                            }

                            true
                        }
                    )
                    SwipeToDismiss(
                        state = swipeState,
                        directions = setOf(DismissDirection.StartToEnd, DismissDirection.EndToStart),
                        dismissThresholds = { FractionalThreshold(swipeThreshold) },
                        background = {
                            val direction = swipeState.dismissDirection ?: return@SwipeToDismiss
                            val color by animateColorAsState(
                                when (swipeState.targetValue) {
                                    DismissValue.Default -> Color.LightGray
                                    DismissValue.DismissedToEnd -> Color.Green
                                    DismissValue.DismissedToStart -> Color.Red
                                }, label = "backgroundColor"
                            )
                            val alignment = when (direction) {
                                DismissDirection.StartToEnd -> Alignment.CenterStart
                                DismissDirection.EndToStart -> Alignment.CenterEnd
                            }
                            val icon = when (direction) {
                                DismissDirection.StartToEnd -> if (currentItem.isArchived) Icons.Default.Unarchive else Icons.Default.Archive
                                DismissDirection.EndToStart -> Icons.Default.Delete
                            }
                            val scale by animateFloatAsState(
                                if (swipeState.targetValue == DismissValue.Default) 0.75f else 1f,
                                label = "scaleAnimation"
                            )

                            Box(
                                Modifier
                                    .fillMaxSize()
                                    .background(color)
                                    .padding(horizontal = 20.dp),
                                contentAlignment = alignment
                            ) {
                                currentThresholdFraction.value = swipeState.progress.fraction
                                Icon(
                                    icon,
                                    contentDescription = null,
                                    modifier = Modifier.scale(scale)
                                )
                            }
                        },
                        dismissContent = {
                            val selected =
                                currentItem.savedItemId == selectedItem?.savedItem?.savedItemId
                            val savedItem = SavedItemWithLabelsAndHighlights(
                                savedItem = cardDataWithLabels.savedItem,
                                labels = cardDataWithLabels.labels,
                                highlights = cardDataWithLabels.highlights
                            )
                            SavedItemCard(
                                selected = selected,
                                savedItemViewModel = libraryViewModel,
                                savedItem = savedItem,
                                onClickHandler = {
                                    libraryViewModel.actionsMenuItemLiveData.postValue(null)
                                    val activityClass =
                                        if (currentItem.contentReader == "PDF") PDFReaderActivity::class.java else WebReaderLoadingContainerActivity::class.java
                                    val intent = Intent(context, activityClass)
                                    intent.putExtra("SAVED_ITEM_SLUG", currentItem.slug)
                                    context.startActivity(intent)
                                },
                                actionHandler = {
                                    libraryViewModel.handleSavedItemAction(
                                        currentItem.savedItemId,
                                        it
                                    )
                                }
                            )
                        },
                    )
                    when {
                        swipeState.isDismissed(DismissDirection.EndToStart) -> Reset(state = swipeState)
                        swipeState.isDismissed(DismissDirection.StartToEnd) -> Reset(state = swipeState)
                    }
                }
            }
        }

        InfiniteListHandler(listState = listState) {
            if ((uiState as LibraryUiState.Success).items.isEmpty()) {
                Log.d("sync", "loading with load func")
                libraryViewModel.initialLoad()
            } else {
                Log.d("sync", "loading with search api")
                libraryViewModel.loadUsingSearchAPI()
            }
        }

        PullToRefreshContainer(
            modifier = Modifier.align(Alignment.TopCenter),
            state = pullToRefreshState,
        )

        // LabelsSelectionSheet(viewModel = libraryViewModel)
    }
}

@OptIn(ExperimentalMaterialApi::class)
@Composable
private fun Reset(state: DismissState) {
    val scope = rememberCoroutineScope()
    LaunchedEffect(key1 = state.dismissDirection) {
        scope.launch {
            state.reset()
            state.animateTo(DismissValue.Default, FloatTweenSpec(duration = 0, delay = 0))
        }
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
