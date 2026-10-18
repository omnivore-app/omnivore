package app.omnivore.omnivore.feature.library

import android.content.Intent
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.feature.reader.PDFReaderActivity
import app.omnivore.omnivore.feature.reader.WebReaderLoadingContainerActivity
import app.omnivore.omnivore.feature.savedItemViews.SavedItemCard
import app.omnivore.omnivore.feature.savedItemViews.TypeaheadSearchCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchView(
    navController: NavHostController,
    viewModel: SearchViewModel = hiltViewModel()
) {
    val isRefreshing: Boolean by viewModel.isRefreshing.collectAsStateWithLifecycle()
    val typeaheadMode: Boolean by viewModel.typeaheadMode.collectAsStateWithLifecycle()
    val searchText: String by viewModel.searchTextFlow.collectAsState("")
    val actionsMenuItem: SavedItemWithLabelsAndHighlights? by viewModel.actionsMenuItemLiveData.observeAsState(
        null
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                navigationIcon = {
                    if (actionsMenuItem != null) {
                        IconButton(onClick = {
                            viewModel.actionsMenuItemLiveData.postValue(null)
                        }) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                modifier = Modifier,
                                contentDescription = "Back"
                            )
                        }
                    }
                },
                actions = {
                    if (actionsMenuItem != null) {
                        IconButton(onClick = { }) {
                            Icon(
                                painter = painterResource(id = R.drawable.archive_outline),
                                contentDescription = null
                            )
                        }
                        IconButton(onClick = { }) {
                            Icon(
                                painter = painterResource(id = R.drawable.tag),
                                contentDescription = null
                            )
                        }
                        IconButton(onClick = { }) {
                            Icon(
                                imageVector = Icons.Outlined.Delete,
                                contentDescription = null
                            )
                        }
                        IconButton(onClick = { }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = null
                            )
                        }
                    } else {
                        Row {
                            SearchField(
                                searchText,
                                onSearch = {
                                    viewModel.performSearch()
                                },
                                onSearchTextChanged = { viewModel.updateSearchText(it) },
                                navController = navController
                            )
                        }
                    }
                }
            )

        }
    ) { paddingValues ->
        if (isRefreshing) {
            Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier
                    .padding(top = paddingValues.calculateTopPadding())
                    .fillMaxWidth()
            ) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .height(45.dp)
                        .width(45.dp),
                    strokeWidth = 5.dp,
                    color = colorResource(R.color.green_55B938)
                )
            }
        } else if (typeaheadMode) {
            TypeaheadSearchViewContent(
                viewModel,
                modifier = Modifier
                    .padding(top = paddingValues.calculateTopPadding())
            )
        } else {
            SearchViewContent(
                viewModel,
                modifier = Modifier
                    .padding(top = paddingValues.calculateTopPadding())
            )
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun TypeaheadSearchViewContent(viewModel: SearchViewModel, modifier: Modifier) {
    val context = LocalContext.current
    val listState = rememberLazyListState()

    val searchedCardsData by viewModel.searchItemsFlow.collectAsStateWithLifecycle()

    LazyColumn(
        state = listState,
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .background(MaterialTheme.colorScheme.background)
            .fillMaxSize()

    ) {
        items(searchedCardsData, key = { it.savedItemId } ) { cardData ->
            TypeaheadSearchCard(
                modifier = Modifier.animateItemPlacement(),
                cardData = cardData,
                onClickHandler = {
                    // val activityClass = if (cardData.isPDF()) PDFReaderActivity::class.java else WebReaderLoadingContainerActivity::class.java
                    val activityClass = WebReaderLoadingContainerActivity::class.java
                    val intent = Intent(context, activityClass)
                    intent.putExtra("SAVED_ITEM_SLUG", cardData.slug)
                    context.startActivity(intent)
                },
                actionHandler = { viewModel.handleSavedItemAction(cardData.savedItemId, it) }
            )
        }
    }
}

@Composable
fun SearchViewContent(viewModel: SearchViewModel, modifier: Modifier) {
    val context = LocalContext.current
    val listState = rememberLazyListState()

    val cardsData: List<SavedItemWithLabelsAndHighlights> by viewModel.itemsState.collectAsStateWithLifecycle()

    LazyColumn(
        state = listState,
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .background(MaterialTheme.colorScheme.background)
            .fillMaxSize()

    ) {
        items(cardsData) { cardDataWithLabels ->
            SavedItemCard(
                selected = false,
                savedItemViewModel = viewModel,
                savedItem = cardDataWithLabels,
                onClickHandler = {
                    val activityClass =
                        if (cardDataWithLabels.savedItem.contentReader == "PDF") PDFReaderActivity::class.java else WebReaderLoadingContainerActivity::class.java
                    val intent = Intent(context, activityClass)
                    intent.putExtra("SAVED_ITEM_SLUG", cardDataWithLabels.savedItem.slug)
                    context.startActivity(intent)
                }
            )
        }
    }
}
