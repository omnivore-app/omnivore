@file:OptIn(ExperimentalMaterialApi::class)

package app.omnivore.omnivore.ui.components

import LabelChip
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.FocusInteraction
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.PressInteraction
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
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.focus.onFocusEvent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.*
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.intl.Locale
import androidx.compose.ui.text.toLowerCase
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.library.LibraryViewModel
import com.dokar.chiptextfield.*
import com.google.accompanist.flowlayout.FlowRow
import kotlinx.coroutines.delay
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.*


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
        .padding(vertical = 7.dp)
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

class LabelChipView(label: SavedItemLabel) : Chip(label.name) {
  val label = label
}

@Composable
@OptIn(ExperimentalMaterialApi::class, ExperimentalComposeUiApi::class,
  ExperimentalMaterial3Api::class
)
fun LabelsSelectionSheetContent(
  isLibraryMode: Boolean,
  labels: List<SavedItemLabel>,
  initialSelectedLabels: List<SavedItemLabel>,
  onCancel: () -> Unit,
  onSave: (List<SavedItemLabel>) -> Unit,
  onCreateLabel: (String, String) -> Unit
) {
  val interactionSource = remember { MutableInteractionSource() }

  val state = rememberChipTextFieldState(initialSelectedLabels.map {
    LabelChipView(it)
  })

  val focusRequester = remember { FocusRequester() }
  var filterTextValue by remember { mutableStateOf(TextFieldValue()) }
  val onFilterTextValueChange: (TextFieldValue) -> Unit = { filterTextValue = it }

  val filteredLabels = labels.filter { label ->
    val text = filterTextValue.text.toLowerCase(Locale.current)
    val result = (text.isEmpty() || label.name.toLowerCase(Locale.current).startsWith(text))
    val alreadySelected = state.chips.map { it.label.name }.contains(label.name)
    result && !alreadySelected
  }

  val currentLabel = labels.find {
    val text = filterTextValue.text.toLowerCase(Locale.current)
    it.name.toLowerCase(Locale.current) == text
  }

  val titleText = if (isLibraryMode) "Filter by Label" else "Set Labels"

  val findOrCreateLabel: (name: TextFieldValue) -> SavedItemLabel = { name ->
    val found = labels.find { it.name == name.text }
    found
        ?: SavedItemLabel(
          savedItemLabelId = "",
          name = name.text,
          labelDescription = "",
          color = LabelSwatchHelper.random(),
          createdAt = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC).format(
            DateTimeFormatter.ISO_DATE_TIME),
          serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue
        )
  }

  Surface(
    modifier = Modifier
      .fillMaxSize()
      .background(MaterialTheme.colorScheme.background),
  ) {
    Column(
      verticalArrangement = Arrangement.Top,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 5.dp)
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

        TextButton(onClick = { onSave(state.chips.map { it.label }) }) {
          Text(text = if (isLibraryMode) "Search" else "Save")
        }
      }

      ChipTextField(
        state = state,
        value = filterTextValue,
        onValueChange = onFilterTextValueChange,
        onSubmit = {
          if (isLibraryMode) {
            currentLabel?.let {
              LabelChipView(it)
            } ?: null
          } else {
            LabelChipView(findOrCreateLabel(it))
          }
        },
        chipLeadingIcon = { chip -> CircleIcon(colorHex = chip.label.color) },
        chipTrailingIcon = { chip -> CloseButton(state, chip) },
        interactionSource = interactionSource,
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
        contentPadding = PaddingValues(10.dp),
        modifier = Modifier
          .defaultMinSize(minHeight = 45.dp)
          .fillMaxWidth()
          .padding(horizontal = 10.dp)
          .focusRequester(focusRequester)
//          .onFocusEvent {
//            val text = filterTextValue.text
//            if (it.hasFocus) {
//              val selection = filterTextValue.text.length
//              onFilterTextValueChange(filterTextValue.copy(selection = TextRange(selection)))
//            }
//          }
      )

      if (!isLibraryMode && filterTextValue.text.isNotEmpty() && currentLabel == null) {
        Row(
          horizontalArrangement = Arrangement.Start,
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier
            .fillMaxWidth()
            .clickable {
              val label = findOrCreateLabel(filterTextValue)
              state.addChip(LabelChipView(label))
              filterTextValue = TextFieldValue()
            }
            .padding(horizontal = 10.dp)
            .padding(top = 10.dp, bottom = 5.dp)
        )
        {
          Icon(
            imageVector = Icons.Filled.AddCircle,
            contentDescription = null,
            modifier = Modifier.padding(end = 8.dp)
          )
          Text(text = "Create a new label named \"${filterTextValue.text}\"")
        }
      }

      if (filteredLabels.isNotEmpty()) {
        FlowRow(
          modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(10.dp)
            .padding(bottom = 55.dp)
        ) {
          filteredLabels.forEach { label ->
            val chipColors = LabelChipColors.fromHex(label.color)

            LabelChip(
              name = label.name,
              colors = chipColors,
              modifier = Modifier
                .clickable {
                  state.addChip(LabelChipView(label))
                  filterTextValue = TextFieldValue()
                }
            )
          }
        }
      }
    }
  }
  LaunchedEffect(Unit) {

  }
}
