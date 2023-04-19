package app.omnivore.omnivore.ui.library

import android.content.Intent
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.persistence.entities.SavedItemCardDataWithLabels
import app.omnivore.omnivore.ui.components.LabelsSelectionSheet
import app.omnivore.omnivore.ui.savedItemViews.SavedItemCard
import app.omnivore.omnivore.ui.reader.PDFReaderActivity
import app.omnivore.omnivore.ui.reader.WebReaderLoadingContainerActivity
import kotlinx.coroutines.flow.distinctUntilChanged
import androidx.compose.ui.res.stringResource
import app.omnivore.omnivore.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchView(
    libraryViewModel: LibraryViewModel,
    navController: NavHostController
) {
    val searchText: String by libraryViewModel.searchTextLiveData.observeAsState("")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("") },
//                SearchField(searchText) { libraryViewModel.updateSearchText(it) }
//                              },
//                navigationIcon = {
//                IconButton(
//                    modifier = Modifier.background(color = Color.Red),
//                    onClick = { navController.popBackStack() }
//                ) {
//                    Icon(
//                        imageVector = androidx.compose.material.icons.Icons.Filled.ArrowBack,
//                        contentDescription = "Back"
//                    )
//                },

                actions = {
                    Row {
                        SearchField(
                            searchText,
                            onSearchTextChanged = { libraryViewModel.updateSearchText(it) },
                            navController = navController
                        )
                    }
                }
            )

        }
    ) { paddingValues ->
        SearchViewContent(
            libraryViewModel,
            modifier = Modifier
                .padding(vertical = paddingValues.calculateTopPadding())
                .background(Color.Blue)
        )
    }
}

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun SearchViewContent(libraryViewModel: LibraryViewModel, modifier: Modifier) {
    val context = LocalContext.current
    val listState = rememberLazyListState()

    val searchedCardsData: List<SavedItemCardDataWithLabels> by libraryViewModel.searchItemsLiveData.observeAsState(listOf())


        LazyColumn(
            state = listState,
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = modifier
                .background(MaterialTheme.colorScheme.background)
                .fillMaxSize()

        ) {
            items(searchedCardsData) { cardDataWithLabels ->
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
}
