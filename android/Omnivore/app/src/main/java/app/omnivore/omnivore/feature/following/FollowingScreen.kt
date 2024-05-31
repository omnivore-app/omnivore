package app.omnivore.omnivore.feature.following

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.feature.components.LabelsViewModel
import app.omnivore.omnivore.feature.editinfo.EditInfoViewModel
import app.omnivore.omnivore.feature.library.AddLinkBottomSheet
import app.omnivore.omnivore.feature.library.EditBottomSheet
import app.omnivore.omnivore.feature.library.LabelBottomSheet
import app.omnivore.omnivore.feature.library.LibraryBottomSheetState
import app.omnivore.omnivore.feature.library.LibraryNavigationBar
import app.omnivore.omnivore.feature.library.LibraryViewContent
import app.omnivore.omnivore.feature.library.SavedItemSortFilter
import app.omnivore.omnivore.feature.save.SaveViewModel
import app.omnivore.omnivore.navigation.Routes
import app.omnivore.omnivore.navigation.TopLevelDestination
import kotlinx.coroutines.launch

@Composable
internal fun FollowingScreen(
    navController: NavHostController,
    labelsViewModel: LabelsViewModel = hiltViewModel(),
    saveViewModel: SaveViewModel = hiltViewModel(),
    editInfoViewModel: EditInfoViewModel = hiltViewModel(),
    viewModel: FollowingViewModel = hiltViewModel()
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
            LabelBottomSheet(
                deleteCurrentItem = { viewModel.currentItem.value = null },
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
                { viewModel.updateAppliedLabels(it) }
            )
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
            LibraryNavigationBar(
                currentDestination = currentTopLevelDestination,
                savedItemViewModel = viewModel,
                onSearchClicked = { navController.navigate(Routes.Search.route) },
                onAddLinkClicked = {
                    viewModel.bottomSheetState.value = LibraryBottomSheetState.ADD_LINK
                }
            )
        },
    ) { paddingValues ->
        when (uiState) {
            is FollowingUiState.Success -> {
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
                    items = (uiState as FollowingUiState.Success).items,
                    selectedItem = selectedItem,
                    onSavedItemAction = { id, action ->
                        viewModel.handleSavedItemAction(id, action)
                    },
                    { viewModel.loadUsingSearchAPI() },
                    { viewModel.initialLoad() }
                )
            }
            is FollowingUiState.Loading -> {
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
