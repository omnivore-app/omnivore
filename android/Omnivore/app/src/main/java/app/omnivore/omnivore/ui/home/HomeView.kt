package app.omnivore.omnivore.ui.home

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes


@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun HomeView(
  homeViewModel: HomeViewModel,
  navController: NavHostController
) {
  Scaffold(
    topBar = {
      TopAppBar(
        title = { Text("Home") },
        backgroundColor = MaterialTheme.colorScheme.surfaceVariant,
        actions = {
          IconButton(onClick = { navController.navigate(Routes.Settings.route) }) {
            Icon(
              imageVector = Icons.Default.Menu,
              contentDescription = null
            )
          }
        }
      )
    }
  ) { paddingValues ->
    HomeViewContent(
      homeViewModel,
      navController,
      modifier = Modifier
        .padding(
          top = paddingValues.calculateTopPadding(),
          bottom = paddingValues.calculateBottomPadding()
        )
    )
  }
}

@Composable
fun HomeViewContent(
  homeViewModel: HomeViewModel,
  navController: NavHostController,
  modifier: Modifier
) {
  val linkedItems: List<LinkedItem> by homeViewModel.itemsLiveData.observeAsState(listOf())

  // Fetch items
  homeViewModel.load()

  LazyColumn(
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = modifier
      .background(MaterialTheme.colorScheme.background)
      .fillMaxSize()
      .padding(horizontal = 6.dp)
  ) {
    items(linkedItems) { item ->
      LinkedItemCard(
        item = item,
        onClickHandler = {
          navController.navigate("WebReader/${item.slug}")
        }
      )
    }
  }
}
