package app.omnivore.omnivore.ui.library

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.persistence.entities.SavedItemCardDataWithLabels
import app.omnivore.omnivore.ui.reader.WebReaderLoadingContainerActivity
import app.omnivore.omnivore.persistence.entities.TypeaheadCardData
import app.omnivore.omnivore.ui.reader.PDFReaderActivity
import app.omnivore.omnivore.ui.savedItemViews.SavedItemCard
import app.omnivore.omnivore.ui.savedItemViews.TypeaheadSearchCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchView(
    viewModel: SearchViewModel,
    navController: NavHostController
) {
    val isRefreshing: Boolean by viewModel.isRefreshing.observeAsState(false)
    val typeaheadMode: Boolean by viewModel.typeaheadMode.observeAsState(true)
    val searchText: String by viewModel.searchTextLiveData.observeAsState("")
    val actionsMenuItem: SavedItemCardData? by viewModel.actionsMenuItemLiveData.observeAsState(null)

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
                                imageVector = androidx.compose.material.icons.Icons.Filled.ArrowBack,
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

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun TypeaheadSearchViewContent(viewModel: SearchViewModel, modifier: Modifier) {
    val context = LocalContext.current
    val listState = rememberLazyListState()

    val searchedCardsData: List<TypeaheadCardData> by viewModel.searchItemsLiveData.observeAsState(listOf())

        LazyColumn(
            state = listState,
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = modifier
                .background(MaterialTheme.colorScheme.background)
                .fillMaxSize()

        ) {
            items(searchedCardsData) { cardData ->
                TypeaheadSearchCard(
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

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun SearchViewContent(viewModel: SearchViewModel, modifier: Modifier) {
    val context = LocalContext.current
    val listState = rememberLazyListState()

    val cardsData: List<SavedItemCardDataWithLabels> by viewModel.itemsLiveData.observeAsState(listOf())

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
                savedItemViewModel = viewModel,
                cardData = cardDataWithLabels.cardData,
                labels = cardDataWithLabels.labels,
                onClickHandler = {
                    val activityClass = if (cardDataWithLabels.cardData.isPDF()) PDFReaderActivity::class.java else WebReaderLoadingContainerActivity::class.java
                    val intent = Intent(context, activityClass)
                    intent.putExtra("SAVED_ITEM_SLUG", cardDataWithLabels.cardData.slug)
                    context.startActivity(intent)
                },
                actionHandler = { viewModel.handleSavedItemAction(cardDataWithLabels.cardData.savedItemId, it) }
            )
        }
    }
}
