package app.omnivore.omnivore.ui.library

import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.components.LabelChipColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryFilterBar(viewModel: LibraryViewModel) {
  var isSavedItemFilterMenuExpanded by remember { mutableStateOf(false) }
  val activeSavedItemFilter: SavedItemFilter by viewModel.appliedFilterLiveData.observeAsState(SavedItemFilter.INBOX)
  val activeLabels: List<SavedItemLabel> by viewModel.activeLabelsLiveData.observeAsState(listOf())

  var isSavedItemSortFilterMenuExpanded by remember { mutableStateOf(false) }
  val activeSavedItemSortFilter: SavedItemSortFilter by viewModel.appliedSortFilterLiveData.observeAsState(SavedItemSortFilter.NEWEST)
  val listState = rememberLazyListState()

  Column {
    LazyRow(
      state = listState,
      horizontalArrangement = Arrangement.Start,
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier
        .padding(start = 6.dp)
        .fillMaxWidth()
    ) {
      item {
        AssistChip(
          onClick = { isSavedItemFilterMenuExpanded = true },
          label = { Text(activeSavedItemFilter.displayText) },
          trailingIcon = {
            Icon(
              Icons.Default.ArrowDropDown,
              contentDescription = "drop down button to change primary library filter"
            )
          },
          modifier = Modifier.padding(end = 6.dp)
        )
        AssistChip(
          onClick = { isSavedItemSortFilterMenuExpanded = true },
          label = { Text(activeSavedItemSortFilter.displayText) },
          trailingIcon = {
            Icon(
              Icons.Default.ArrowDropDown,
              contentDescription = "drop down button to change library sort order"
            )
          },
          modifier = Modifier.padding(end = 6.dp)
        )
        AssistChip(
          onClick = { viewModel.showLabelsSelectionSheetLiveData.value = true },
          label = { Text("Labels") },
          trailingIcon = {
            Icon(
              Icons.Default.ArrowDropDown,
              contentDescription = "drop down button to open label selection sheet"
            )
          },
          modifier = Modifier.padding(end = 6.dp)
        )
      }
      items(activeLabels.sortedBy { it.name }) { label ->
        val chipColors = LabelChipColors.fromHex(label.color)

        AssistChip(
          onClick = {
            viewModel.updateAppliedLabels(
              (viewModel.activeLabelsLiveData.value ?: listOf()).filter { it.savedItemLabelId != label.savedItemLabelId }
            )
          },
          label = { Text(label.name) },
          border = null,
          colors = SuggestionChipDefaults.elevatedSuggestionChipColors(
            containerColor = chipColors.containerColor,
            labelColor = chipColors.textColor,
            iconContentColor = chipColors.textColor
          ),
          trailingIcon = {
            Icon(
              Icons.Default.Close,
              contentDescription = "close icon to remove label"
            )
          },
          modifier = Modifier
            .padding(horizontal = 4.dp)
        )
      }
    }

    SavedItemFilterContextMenu(
      isExpanded = isSavedItemFilterMenuExpanded,
      onDismiss = { isSavedItemFilterMenuExpanded = false },
      actionHandler = { viewModel.updateSavedItemFilter(it) }
    )

    SavedItemSortFilterContextMenu(
      isExpanded = isSavedItemSortFilterMenuExpanded,
      onDismiss = { isSavedItemSortFilterMenuExpanded = false },
      actionHandler = { viewModel.updateSavedItemSortFilter(it) }
    )
  }
}
