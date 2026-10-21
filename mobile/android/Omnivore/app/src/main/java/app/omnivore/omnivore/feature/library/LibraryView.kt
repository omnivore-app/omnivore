package app.omnivore.omnivore.feature.library

import android.content.Intent
import android.util.Log
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.FloatTweenSpec
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.ExperimentalFoundationApi
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
import androidx.compose.material.SwipeToDismiss
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Unarchive
import androidx.compose.material.rememberDismissState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHostState
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
import app.omnivore.omnivore.navigation.TopLevelDestination
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

@Composable
internal fun LibraryView(
    navController: NavHostController,
    labelsViewModel: LabelsViewModel = hiltViewModel(),
    saveViewModel: SaveViewModel = hiltViewModel(),
    editInfoViewModel: EditInfoViewModel = hiltViewModel(),
    viewModel: LibraryViewModel = hiltViewModel()
) {
    val snackbarHostState = remember { SnackbarHostState() }

    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(viewModel.snackbarMessage) {
        viewModel.snackbarMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearSnackbarMessage()
        }
    }

    val labels by viewModel.labelsState.collectAsStateWithLifecycle()
    val currentTopLevelDestination =
        TopLevelDestination.entries.find { it.route == navController.currentDestination?.route }
    val selectedItem: SavedItemWithLabelsAndHighlights? by viewModel.actionsMenuItemLiveData.observeAsState()
    val savedItemFilter by viewModel.appliedFilterState.collectAsStateWithLifecycle()
    val activeLabels by viewModel.activeLabels.collectAsStateWithLifecycle()
    val sortFilter: SavedItemSortFilter by viewModel.appliedSortFilterLiveData.collectAsStateWithLifecycle()
    val bottomSheetState: LibraryBottomSheetState by viewModel.bottomSheetState.collectAsStateWithLifecycle()

    when (bottomSheetState) {
        LibraryBottomSheetState.ADD_LINK -> {
            AddLinkBottomSheet(saveViewModel) {
                viewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN
            }
        }

        LibraryBottomSheetState.LABEL -> {
            LabelBottomSheet(deleteCurrentItem = { viewModel.currentItem.value = null },
                labels = labels,
                currentSavedItemData = viewModel.currentSavedItemUnderEdit(),
                labelsViewModel,
                { viewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN },
                { labelName, hexColorValue ->
                    viewModel.createNewSavedItemLabel(labelName, hexColorValue)
                },
                { savedItemId, labels ->
                    viewModel.updateSavedItemLabels(savedItemId, labels)
                },
                activeLabels,
                { viewModel.updateAppliedLabels(it) })
        }

        LibraryBottomSheetState.EDIT -> {
            EditBottomSheet(
                editInfoViewModel,
                deleteCurrentItem = { viewModel.currentItem.value = null },
                { viewModel.refresh() },
                viewModel.currentSavedItemUnderEdit()
            ) {
                viewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN
            }
        }

        LibraryBottomSheetState.HIDDEN -> {
        }
    }

    Scaffold(
        topBar = {
            LibraryNavigationBar(currentDestination = currentTopLevelDestination,
                savedItemViewModel = viewModel,
                onSearchClicked = { navController.navigate(Routes.Search.route) },
                onAddLinkClicked = {
                    viewModel.bottomSheetState.value = LibraryBottomSheetState.ADD_LINK
                })
        },
    ) { paddingValues ->
        when (uiState) {
            is LibraryUiState.Success -> {
                LibraryViewContent(
                    itemsFilter = savedItemFilter,
                    activeLabels = activeLabels,
                    sortFilter = sortFilter,
                    updateSavedItemFilter = { viewModel.updateSavedItemFilter(it) },
                    updateSavedItemSortFilter = { viewModel.updateSavedItemSortFilter(it) },
                    setBottomSheetState = { viewModel.setBottomSheetState(it) },
                    updateAppliedLabels = { viewModel.updateAppliedLabels(it) },
                    isFollowingScreen = currentTopLevelDestination == TopLevelDestination.FOLLOWING,
                    { viewModel.actionsMenuItemLiveData.postValue(null) },
                    savedItemViewModel = viewModel,
                    refresh = { viewModel.refresh() },
                    onUnarchive = { viewModel.unarchiveSavedItem(it) },
                    onArchive = { viewModel.archiveSavedItem(it) },
                    onDelete = { viewModel.deleteSavedItem(it) },
                    paddingValues = paddingValues,
                    items = (uiState as LibraryUiState.Success).items,
                    selectedItem = selectedItem,
                    onSavedItemAction = { id, action ->
                        viewModel.handleSavedItemAction(id, action)
                    },
                    { viewModel.loadUsingSearchAPI() },
                    { viewModel.initialLoad() })
            }

            is LibraryUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(strokeCap = StrokeCap.Round)
                }
            }

            else -> {
                // TODO
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LabelBottomSheet(
    deleteCurrentItem: () -> Unit,
    labels: List<SavedItemLabel>,
    currentSavedItemData: SavedItemWithLabelsAndHighlights?,
    labelsViewModel: LabelsViewModel,
    onDismiss: () -> Unit = {},
    createNewSavedItemLabel: (String, String) -> Unit,
    updateSavedItemLabels: (String, List<SavedItemLabel>) -> Unit,
    activeLabels: List<SavedItemLabel>,
    updateAppliedLabels: (List<SavedItemLabel>) -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = { onDismiss() },
        containerColor = MaterialTheme.colorScheme.background,
        sheetState = rememberModalBottomSheetState(
            skipPartiallyExpanded = true
        ),
    ) {

        if (currentSavedItemData != null) {
            LabelsSelectionSheetContent(labels = labels,
                labelsViewModel = labelsViewModel,
                initialSelectedLabels = currentSavedItemData.labels,
                onCancel = {
                    deleteCurrentItem()
                    onDismiss()
                },
                isLibraryMode = false,
                onSave = {
                    if (it != labels) {
                        updateSavedItemLabels(currentSavedItemData.savedItem.savedItemId, it)
                    }
                    deleteCurrentItem()
                    onDismiss()
                },
                onCreateLabel = { newLabelName, labelHexValue ->
                    createNewSavedItemLabel(newLabelName, labelHexValue)
                })
        } else { // Is used in library mode
            LabelsSelectionSheetContent(labels = labels,
                labelsViewModel = labelsViewModel,
                initialSelectedLabels = activeLabels,
                onCancel = { onDismiss() },
                isLibraryMode = true,
                onSave = {
                    updateAppliedLabels(it)
                    deleteCurrentItem()
                    onDismiss()
                },
                onCreateLabel = { newLabelName, labelHexValue ->
                    createNewSavedItemLabel(newLabelName, labelHexValue)
                })
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddLinkBottomSheet(
    saveViewModel: SaveViewModel, onDismiss: () -> Unit = {}
) {
    ModalBottomSheet(
        onDismissRequest = { onDismiss() },
        containerColor = MaterialTheme.colorScheme.background,
        sheetState = rememberModalBottomSheetState(
            skipPartiallyExpanded = true
        ),
    ) {

        AddLinkSheetContent(viewModel = saveViewModel, onCancel = {
            saveViewModel.state.value = SaveState.DEFAULT
            onDismiss()
        }, onLinkAdded = {
            saveViewModel.state.value = SaveState.DEFAULT
            onDismiss()
        })
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditBottomSheet(
    editInfoViewModel: EditInfoViewModel,
    deleteCurrentItem: () -> Unit,
    refresh: () -> Unit,
    currentSavedItemUnderEdit: SavedItemWithLabelsAndHighlights?,
    onDismiss: () -> Unit = {}
) {
    ModalBottomSheet(
        onDismissRequest = { onDismiss() },
        containerColor = MaterialTheme.colorScheme.background,
        sheetState = rememberModalBottomSheetState(
            skipPartiallyExpanded = true
        ),
    ) {
        EditInfoSheetContent(savedItemId = currentSavedItemUnderEdit?.savedItem?.savedItemId,
            title = currentSavedItemUnderEdit?.savedItem?.title,
            author = currentSavedItemUnderEdit?.savedItem?.author,
            description = currentSavedItemUnderEdit?.savedItem?.descriptionText,
            viewModel = editInfoViewModel,
            onCancel = {
                deleteCurrentItem()
                onDismiss()
            },
            onUpdated = {
                deleteCurrentItem()
                refresh()
                onDismiss()
            })
    }
}


@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class,
    ExperimentalFoundationApi::class
)
@Composable
fun LibraryViewContent(
    itemsFilter: SavedItemFilter,
    activeLabels: List<SavedItemLabel>,
    sortFilter: SavedItemSortFilter,
    updateSavedItemFilter: (SavedItemFilter) -> Unit,
    updateSavedItemSortFilter: (SavedItemSortFilter) -> Unit,
    setBottomSheetState: (LibraryBottomSheetState) -> Unit,
    updateAppliedLabels: (List<SavedItemLabel>) -> Unit,
    isFollowingScreen: Boolean,
    selectItem: () -> Unit,
    savedItemViewModel: SavedItemViewModel,
    refresh: () -> Unit,
    onUnarchive: (String) -> Unit,
    onArchive: (String) -> Unit,
    onDelete: (String) -> Unit,
    paddingValues: PaddingValues,
    items: List<SavedItemWithLabelsAndHighlights>,
    selectedItem: SavedItemWithLabelsAndHighlights?,
    onSavedItemAction: (String, SavedItemAction) -> Unit,
    loadUsingSearchAPI: () -> Unit,
    initialLoad: () -> Unit
) {
    val context = LocalContext.current
    val listState = rememberLazyListState()

    val pullToRefreshState = rememberPullToRefreshState()
    if (pullToRefreshState.isRefreshing) {
        LaunchedEffect(true) {
            // fetch something
            delay(1500)
            refresh()
            pullToRefreshState.endRefresh()
        }
    }

    Box(
        modifier = Modifier
            .padding(top = paddingValues.calculateTopPadding())
            .fillMaxSize()
            .nestedScroll(pullToRefreshState.nestedScrollConnection)
    ) {
        Column {
            LibraryFilterBar(
                isFollowingScreen,
                itemsFilter,
                sortFilter,
                activeLabels,
                setBottomSheetState,
                updateSavedItemFilter,
                updateSavedItemSortFilter,
                updateAppliedLabels
            )
            HorizontalDivider()
            LazyColumn(
                state = listState,
                verticalArrangement = Arrangement.Top,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                items(items = items,
                    key = { item -> item.savedItem.savedItemId }) { cardDataWithLabels ->
                    val swipeThreshold = 0.45f
                    val currentThresholdFraction = remember { mutableStateOf(0f) }
                    val currentItem by rememberUpdatedState(cardDataWithLabels.savedItem)
                    val swipeState = rememberDismissState(confirmStateChange = {
                        when (it) {
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
                                onUnarchive(currentItem.savedItemId)
                            } else {
                                onArchive(currentItem.savedItemId)
                            }
                        } else if (it == DismissValue.DismissedToStart) { // Deleting.
                            onDelete(currentItem.savedItemId)
                        }

                        true
                    })
                    SwipeToDismiss(
                        modifier = Modifier.animateItemPlacement(),
                        state = swipeState,
                        directions = setOf(
                            DismissDirection.StartToEnd, DismissDirection.EndToStart
                        ),
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
                                    .padding(horizontal = 20.dp), contentAlignment = alignment
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
                            SavedItemCard(selected = selected,
                                savedItemViewModel = savedItemViewModel,
                                savedItem = savedItem,
                                onClickHandler = {
                                    selectItem()
                                    val activityClass =
                                        if (currentItem.contentReader == "PDF") PDFReaderActivity::class.java else WebReaderLoadingContainerActivity::class.java
                                    val intent = Intent(context, activityClass)
                                    intent.putExtra("SAVED_ITEM_SLUG", currentItem.slug)
                                    context.startActivity(intent)
                                })
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
            if (items.isEmpty()) {
                Log.d("sync", "loading with load func")
                initialLoad()
            } else {
                Log.d("sync", "loading with search api")
                loadUsingSearchAPI()
            }
        }

        PullToRefreshContainer(
            modifier = Modifier.align(Alignment.TopCenter),
            state = pullToRefreshState,
        )
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
    listState: LazyListState, buffer: Int = 2, onLoadMore: () -> Unit
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
