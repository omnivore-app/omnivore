package app.omnivore.omnivore.ui.library

import android.content.Intent
import android.util.Log
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.FloatTweenSpec
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material.Scaffold
import androidx.compose.material.ScaffoldState
import androidx.compose.material.SwipeToDismiss
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Unarchive
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material.rememberDismissState
import androidx.compose.material.rememberScaffoldState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.components.AddLinkSheetContent
import app.omnivore.omnivore.ui.components.LabelsSelectionSheetContent
import app.omnivore.omnivore.ui.components.LabelsViewModel
import app.omnivore.omnivore.ui.editinfo.EditInfoSheetContent
import app.omnivore.omnivore.ui.editinfo.EditInfoViewModel
import app.omnivore.omnivore.ui.reader.PDFReaderActivity
import app.omnivore.omnivore.ui.reader.WebReaderLoadingContainerActivity
import app.omnivore.omnivore.ui.save.SaveState
import app.omnivore.omnivore.ui.save.SaveViewModel
import app.omnivore.omnivore.ui.savedItemViews.SavedItemCard
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

@Composable
fun LibraryView(
    libraryViewModel: LibraryViewModel,
    labelsViewModel: LabelsViewModel,
    saveViewModel: SaveViewModel,
    editInfoViewModel: EditInfoViewModel,
    navController: NavHostController
) {
    val scaffoldState: ScaffoldState = rememberScaffoldState()

    val coroutineScope = rememberCoroutineScope()

    val showBottomSheet: LibraryBottomSheetState by libraryViewModel.bottomSheetState.observeAsState(
        LibraryBottomSheetState.HIDDEN
    )

    libraryViewModel.snackbarMessage?.let {
        coroutineScope.launch {
            scaffoldState.snackbarHostState.showSnackbar(it)
            libraryViewModel.clearSnackbarMessage()
        }
    }

    when (showBottomSheet) {
        LibraryBottomSheetState.ADD_LINK -> {
            AddLinkBottomSheet(saveViewModel) {
                libraryViewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN
            }
        }

        LibraryBottomSheetState.LABEL -> {
            LabelBottomSheet(
                libraryViewModel,
                labelsViewModel
            ) {
                libraryViewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN
            }
        }

        LibraryBottomSheetState.EDIT -> {
            EditBottomSheet(
                editInfoViewModel,
                libraryViewModel
            ) {
                libraryViewModel.bottomSheetState.value = LibraryBottomSheetState.HIDDEN
            }
        }

        LibraryBottomSheetState.HIDDEN -> {
        }
    }

    Scaffold(
        scaffoldState = scaffoldState,
        topBar = {
            LibraryNavigationBar(
                savedItemViewModel = libraryViewModel,
                onSearchClicked = { navController.navigate(Routes.Search.route) },
                onAddLinkClicked = { showAddLinkBottomSheet(libraryViewModel) },
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
                    libraryViewModel.currentItemLiveData.value = null
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
                    libraryViewModel.currentItemLiveData.value = null
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
                    libraryViewModel.currentItemLiveData.value = null
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
                libraryViewModel.currentItemLiveData.value = null
                onDismiss()
            },
            onUpdated = {
                libraryViewModel.currentItemLiveData.value = null
                libraryViewModel.refresh()
                onDismiss()
            }
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

    val selectedItem: SavedItemWithLabelsAndHighlights? by libraryViewModel.actionsMenuItemLiveData.observeAsState()
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
            items(
                items = cardsData,
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
                    modifier = Modifier.padding(vertical = 4.dp),
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
                        SavedItemCard(
                            selected = selected,
                            savedItemViewModel = libraryViewModel,
                            savedItem = cardDataWithLabels,
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
