package app.omnivore.omnivore.ui.components

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.library.LibraryViewModel
import app.omnivore.omnivore.ui.reader.WebPreferencesView
import app.omnivore.omnivore.ui.reader.WebReaderViewModel

@Composable
fun LabelsSelectionSheet(viewModel: LibraryViewModel) {
  val isActive: Boolean by viewModel.showLabelsSelectionSheetLiveData.observeAsState(false)
  val labels: List<SavedItemLabel> by viewModel.savedItemLabelsLiveData.observeAsState(listOf())
  val currentSavedItemData = viewModel.currentSavedItemUnderEdit()

  if (isActive) {
    Dialog(onDismissRequest = {
      viewModel.labelsSelectionCurrentItemLiveData.value = null
      viewModel.showLabelsSelectionSheetLiveData.value = false
    } ) {
      if (currentSavedItemData != null) {
        LabelsSelectionSheetContent(
          labels = labels,
          initialSelectedLabels = currentSavedItemData.labels,
          onCancel = {
            viewModel.showLabelsSelectionSheetLiveData.value = false
            viewModel.labelsSelectionCurrentItemLiveData.value = null
          },
          isLibraryMode = false,
          onSave = {
            if (it != labels) {
              viewModel.updateSavedItemLabels(savedItemID = currentSavedItemData.cardData.savedItemId, labels = it)
            }
            viewModel.labelsSelectionCurrentItemLiveData.value = null
            viewModel.showLabelsSelectionSheetLiveData.value = false
          },
          onCreateLabel = { newLabelName, labelHexValue ->
            viewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
          }
        )
      } else { // Is used in library mode
        LabelsSelectionSheetContent(
          labels = labels,
          initialSelectedLabels = viewModel.activeLabelsLiveData.value ?: listOf(),
          onCancel = { viewModel.showLabelsSelectionSheetLiveData.value = false },
          isLibraryMode = true,
          onSave = {
            viewModel.updateAppliedLabels(it)
            viewModel.labelsSelectionCurrentItemLiveData.value = null
            viewModel.showLabelsSelectionSheetLiveData.value = false
          },
          onCreateLabel = { newLabelName, labelHexValue ->
            viewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
          }
        )
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LabelsSelectionSheetContent(
  isLibraryMode: Boolean,
  labels: List<SavedItemLabel>,
  initialSelectedLabels: List<SavedItemLabel>,
  onCancel: () -> Unit,
  onSave: (List<SavedItemLabel>) -> Unit,
  onCreateLabel: (String, String) -> Unit
) {
  val listState = rememberLazyListState()
  val selectedLabels = remember { mutableStateOf(initialSelectedLabels) }
  var showCreateLabelDialog by remember { mutableStateOf(false ) }

  val titleText = if (isLibraryMode) "Filter by Label" else "Set Labels"

  Surface(
    modifier = Modifier
      .fillMaxSize()
      .background(MaterialTheme.colorScheme.background),
    shape = RoundedCornerShape(16.dp)
  ) {

    if (showCreateLabelDialog) {
      LabelCreationDialog(
        onDismiss = { showCreateLabelDialog = false },
        onSave = { labelName, hexColor ->
          onCreateLabel(labelName, hexColor)
          showCreateLabelDialog = false
        }
      )
    }

    Column(
      verticalArrangement = Arrangement.Top,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 6.dp)
    ) {
      Row(
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
          .fillMaxWidth()
      ) {
        TextButton(onClick = onCancel) {
          Text(text = "Cancel")
        }

        Text(titleText, fontWeight = FontWeight.ExtraBold)

        TextButton(onClick = { onSave(selectedLabels.value) }) {
          Text(text = "Done")
        }
      }
      LazyColumn(
        state = listState,
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
          .fillMaxSize()
      ) {
        items(labels) { label ->
          val isLabelSelected = selectedLabels.value.contains(label)

          Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .fillMaxWidth()
              .clickable {
                if (isLabelSelected) {
                  selectedLabels.value = selectedLabels.value.filter { it.savedItemLabelId != label.savedItemLabelId }
                } else {
                  selectedLabels.value = selectedLabels.value + listOf(label)
                }
              }
              .padding(horizontal = 6.dp)
          ) {
            val chipColors = LabelChipColors.fromHex(label.color)

            SuggestionChip(
              onClick = {},
              label = { Text(label.name) },
              border = null,
              colors = SuggestionChipDefaults.elevatedSuggestionChipColors(
                containerColor = chipColors.containerColor,
                labelColor = chipColors.textColor,
                iconContentColor = chipColors.textColor
              )
            )
            if (isLabelSelected) {
              Icon(
                imageVector = Icons.Default.Check,
                contentDescription = null
              )
            }
          }
          Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)
        }

        if (!isLibraryMode) {
          item {
            Row(
              horizontalArrangement = Arrangement.Start,
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier
                .fillMaxWidth()
                .clickable { showCreateLabelDialog = true }
                .padding(horizontal = 6.dp)
                .padding(vertical = 12.dp)
            )
            {
              Icon(
                imageVector = Icons.Filled.AddCircle,
                contentDescription = null,
                modifier = Modifier.padding(end = 8.dp)
              )
              Text(text = "Create a new Label")
            }
          }
        }
      }
    }
  }
}
