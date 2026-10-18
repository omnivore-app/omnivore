package app.omnivore.omnivore.feature.library

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Icon
import androidx.compose.material3.SuggestionChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.intl.Locale
import androidx.compose.ui.text.toLowerCase
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.feature.components.LabelChipColors

@Composable
fun LibraryFilterBar(
    isFollowingScreen: Boolean,
    itemsFilter: SavedItemFilter,
    sortFilter: SavedItemSortFilter,
    activeLabels: List<SavedItemLabel>,
    setBottomSheetState: (LibraryBottomSheetState) -> Unit,
    updateSavedItemFilter: (SavedItemFilter) -> Unit,
    updateSavedItemSortFilter: (SavedItemSortFilter) -> Unit,
    updateAppliedLabels: (List<SavedItemLabel>) -> Unit
) {

    var isSavedItemFilterMenuExpanded by remember { mutableStateOf(false) }


    var isSavedItemSortFilterMenuExpanded by remember { mutableStateOf(false) }
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
                AssistChip(onClick = { isSavedItemFilterMenuExpanded = true },
                    label = { Text(
                        itemsFilter.displayText
                    ) },
                    trailingIcon = {
                        Icon(
                            Icons.Default.ArrowDropDown,
                            contentDescription = "drop down button to change primary library filter"
                        )
                    },
                    modifier = Modifier.padding(end = 6.dp)
                )
                AssistChip(onClick = { isSavedItemSortFilterMenuExpanded = true },
                    label = { Text(sortFilter.displayText) },
                    trailingIcon = {
                        Icon(
                            Icons.Default.ArrowDropDown,
                            contentDescription = "drop down button to change library sort order"
                        )
                    },
                    modifier = Modifier.padding(end = 6.dp)
                )
                AssistChip(
                    onClick = { setBottomSheetState(LibraryBottomSheetState.LABEL) },
                    label = { Text(stringResource(R.string.library_filter_bar_label_labels)) },
                    trailingIcon = {
                        Icon(
                            Icons.Default.ArrowDropDown,
                            contentDescription = "drop down button to open label selection sheet"
                        )
                    },
                    modifier = Modifier.padding(end = 6.dp)
                )
            }
            items(activeLabels.sortedWith(compareBy { it.name.toLowerCase(Locale.current) })) { label ->
                val chipColors = LabelChipColors.fromHex(label.color)

                AssistChip(
                    onClick = {
                        updateAppliedLabels(
                            activeLabels.filter { it.savedItemLabelId != label.savedItemLabelId }
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
                            Icons.Default.Close, contentDescription = "close icon to remove label"
                        )
                    },
                    modifier = Modifier.padding(horizontal = 4.dp)
                )
            }
        }

        SavedItemFilterContextMenu(
            isFollowingScreen = isFollowingScreen,
            isExpanded = isSavedItemFilterMenuExpanded,
            onDismiss = { isSavedItemFilterMenuExpanded = false },
            actionHandler = { updateSavedItemFilter(it) }
        )

        SavedItemSortFilterContextMenu(isExpanded = isSavedItemSortFilterMenuExpanded,
            onDismiss = { isSavedItemSortFilterMenuExpanded = false },
            actionHandler = { updateSavedItemSortFilter(it) })
    }
}
