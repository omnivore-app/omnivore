@file:OptIn(ExperimentalMaterialApi::class)

package app.omnivore.omnivore.ui.components

import LabelChip
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.ModalBottomSheetLayout
import androidx.compose.material.ModalBottomSheetValue
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.rememberModalBottomSheetState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalViewConfiguration
import androidx.compose.ui.platform.ViewConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.library.LibraryViewModel
import com.dokar.chiptextfield.*
import com.google.accompanist.flowlayout.FlowRow


//@Composable
//fun LabelsSelectionSheet(viewModel: LibraryViewModel) {
//  val isActive: Boolean by viewModel.showLabelsSelectionSheetLiveData.observeAsState(false)
//  val labels: List<SavedItemLabel> by viewModel.savedItemLabelsLiveData.observeAsState(listOf())
//  val currentSavedItemData = viewModel.currentSavedItemUnderEdit()
//
//  val modalBottomSheetState = rememberModalBottomSheetState(
//    ModalBottomSheetValue.HalfExpanded,
//    confirmStateChange = { it != ModalBottomSheetValue.Hidden }
//  )
//
//  if (isActive) {
//    ModalBottomSheetLayout(
//      sheetBackgroundColor = Color.Transparent,
//      sheetState = modalBottomSheetState,
//      sheetContent = {
//        BottomSheetUI {
//          if (currentSavedItemData != null) {
//            LabelsSelectionSheetContent(
//              labels = labels,
//              initialSelectedLabels = currentSavedItemData.labels,
//              onCancel = {
//                viewModel.showLabelsSelectionSheetLiveData.value = false
//                viewModel.labelsSelectionCurrentItemLiveData.value = null
//              },
//              isLibraryMode = false,
//              onSave = {
//                if (it != labels) {
//                  viewModel.updateSavedItemLabels(
//                    savedItemID = currentSavedItemData.savedItem.savedItemId,
//                    labels = it
//                  )
//                }
//                viewModel.labelsSelectionCurrentItemLiveData.value = null
//                viewModel.showLabelsSelectionSheetLiveData.value = false
//              },
//              onCreateLabel = { newLabelName, labelHexValue ->
//                viewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
//              }
//            )
//          } else { // Is used in library mode
//            LabelsSelectionSheetContent(
//              labels = labels,
//              initialSelectedLabels = viewModel.activeLabelsLiveData.value ?: listOf(),
//              onCancel = { viewModel.showLabelsSelectionSheetLiveData.value = false },
//              isLibraryMode = true,
//              onSave = {
//                viewModel.updateAppliedLabels(it)
//                viewModel.labelsSelectionCurrentItemLiveData.value = null
//                viewModel.showLabelsSelectionSheetLiveData.value = false
//              },
//              onCreateLabel = { newLabelName, labelHexValue ->
//                viewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
//              }
//            )
//          }
//        }
//      }
//    ) {}
//  }
//}

@Composable
fun CircleIcon(colorHex: String){
  val chipColors = LabelChipColors.fromHex(colorHex)
  val viewConfiguration = LocalViewConfiguration.current
  val viewConfigurationOverride = remember(viewConfiguration) {
    ViewConfigurationOverride(
      base = viewConfiguration,
      minimumTouchTargetSize = DpSize(24.dp, 24.dp)
    )
  }

  CompositionLocalProvider(LocalViewConfiguration provides viewConfigurationOverride) {
    Row(
      modifier = Modifier
        .padding(start = 10.dp, end = 2.dp)
        .padding(vertical = 10.dp)
    ) {
      Canvas(modifier = Modifier.size(12.dp), onDraw = {
        drawCircle(color = chipColors.containerColor)
      })
    }
  }
}

@Composable
fun <T : Chip> CloseButton(
  state: ChipTextFieldState<T>,
  chip: T,
  modifier: Modifier = Modifier,
  backgroundColor: Color = Color.Transparent,
  strokeColor: Color = Color.White,
  startPadding: Dp = 0.dp,
  endPadding: Dp = 4.dp
) {
  Row(
    modifier = modifier
      .padding(start = startPadding, end = endPadding)
  ) {
    CloseButtonImpl(
      onClick = { state.removeChip(chip) },
      backgroundColor = backgroundColor,
      strokeColor = strokeColor
    )
  }
}

internal class ViewConfigurationOverride(
  base: ViewConfiguration,
  override val doubleTapMinTimeMillis: Long = base.doubleTapMinTimeMillis,
  override val doubleTapTimeoutMillis: Long = base.doubleTapTimeoutMillis,
  override val longPressTimeoutMillis: Long = base.longPressTimeoutMillis,
  override val touchSlop: Float = base.touchSlop,
  override val minimumTouchTargetSize: DpSize = base.minimumTouchTargetSize
) : ViewConfiguration

@Composable
private fun CloseButtonImpl(
  onClick: () -> Unit,
  backgroundColor: Color,
  strokeColor: Color,
  modifier: Modifier = Modifier,
) {
  val padding = with(LocalDensity.current) { 6.dp.toPx() }
  val strokeWidth = with(LocalDensity.current) { 1.2.dp.toPx() }
  val viewConfiguration = LocalViewConfiguration.current
  val viewConfigurationOverride = remember(viewConfiguration) {
    ViewConfigurationOverride(
      base = viewConfiguration,
      minimumTouchTargetSize = DpSize(24.dp, 24.dp)
    )
  }
  CompositionLocalProvider(LocalViewConfiguration provides viewConfigurationOverride) {
    Canvas(
      modifier = modifier
        .size(18.dp)
        .clip(CircleShape)
        .background(backgroundColor)
        .clickable(onClick = onClick)
    ) {
      drawLine(
        color = strokeColor,
        start = Offset(padding, padding),
        end = Offset(size.width - padding, size.height - padding),
        strokeWidth = strokeWidth
      )
      drawLine(
        color = strokeColor,
        start = Offset(padding, size.height - padding),
        end = Offset(size.width - padding, padding),
        strokeWidth = strokeWidth
      )
    }
  }
}

class LabelChip(label: SavedItemLabel) : Chip(label.name) {
  val label = label
}

@Composable
@OptIn(ExperimentalMaterialApi::class)
fun LabelsSelectionSheetContent(
//  viewModel: LibraryViewModel,
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

  val focusRequester = remember { FocusRequester() }


  val titleText = if (isLibraryMode) "Filter by Label" else "Set Labels"

  val findOrCreateLabel: (name: String) -> SavedItemLabel = { name ->
    val found = labels.find { it.name == name }
    found
        ?: SavedItemLabel(
          savedItemLabelId = "",
          name = name,
          color = "#FFFFFF",
          createdAt = "",
          labelDescription = "",
          serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue
        )
  }

  Surface(
    modifier = Modifier
      .fillMaxSize()
      .background(MaterialTheme.colorScheme.background),
  ) {
    var value by remember { mutableStateOf("Initial text") }
    val state = rememberChipTextFieldState<LabelChip>()


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
        //  .verticalScroll(rememberScrollState())
        .fillMaxSize()
        .padding(horizontal = 5.dp)
    ) {

      Row(
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
          .fillMaxWidth()
          .padding(vertical = 5.dp)
      ) {
        TextButton(onClick = onCancel) {
          Text(text = "Cancel")
        }

        Text(titleText, fontWeight = FontWeight.ExtraBold)

        TextButton(onClick = { onSave(selectedLabels.value) }) {
          Text(text = if (isLibraryMode) "Search" else "Save")
        }
      }

        ChipTextField(
          state = state,
          onSubmit = { LabelChip(findOrCreateLabel(it)) },
          chipLeadingIcon = { chip -> CircleIcon(colorHex = chip.label.color) },
          chipTrailingIcon = { chip -> CloseButton(state, chip) },
          chipStyle = ChipTextFieldDefaults.chipStyle(
            shape = androidx.compose.material.MaterialTheme.shapes.medium,
            unfocusedBorderWidth = 0.dp,
            focusedTextColor = Color(0xFFAEAEAF),
            focusedBorderColor = Color(0xFF2A2A2A),
            focusedBackgroundColor = Color(0xFF2A2A2A)
          ),
          colors = androidx.compose.material.TextFieldDefaults.textFieldColors(
            textColor = Color(0xFFAEAEAF),
            backgroundColor = Color(0xFF3D3D3D)
          ),
          contentPadding = PaddingValues(15.dp),
          modifier = Modifier
            .defaultMinSize(minHeight = 45.dp)
            .fillMaxWidth()
            .padding(horizontal = 10.dp)
            .focusRequester(focusRequester)
        )

        LazyColumn(
          state = listState,
          verticalArrangement = Arrangement.Top,
          horizontalAlignment = Alignment.CenterHorizontally,
          modifier = Modifier.fillMaxSize()
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
                    selectedLabels.value =
                      selectedLabels.value.filter { it.savedItemLabelId != label.savedItemLabelId }
                  } else {
                    selectedLabels.value = selectedLabels.value + listOf(label)
                    state.addChip(app.omnivore.omnivore.ui.components.LabelChip(label))
                  }
                }
                .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
              val chipColors = LabelChipColors.fromHex(label.color)

              LabelChip(
                name = label.name,
                colors = chipColors
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
      LaunchedEffect(Unit) {
        focusRequester.requestFocus()
      }
  }
}
