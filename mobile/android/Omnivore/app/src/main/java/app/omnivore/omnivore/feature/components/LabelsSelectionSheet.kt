package app.omnivore.omnivore.feature.components

import android.widget.Toast
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Scaffold
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalViewConfiguration
import androidx.compose.ui.platform.ViewConfiguration
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.intl.Locale
import androidx.compose.ui.text.toLowerCase
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import com.dokar.chiptextfield.Chip
import com.dokar.chiptextfield.ChipTextFieldState
import com.dokar.chiptextfield.m3.ChipTextField
import com.dokar.chiptextfield.m3.ChipTextFieldDefaults
import com.dokar.chiptextfield.rememberChipTextFieldState
import com.google.accompanist.flowlayout.FlowRow

@Composable
fun CircleIcon(colorHex: String) {
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

fun findOrCreateLabel(
    labelsViewModel: LabelsViewModel,
    labels: List<SavedItemLabel>,
    name: String
): SavedItemLabel {
    val found = labels.find { it.name == name }
    if (found != null) {
        return found
    }
    return labelsViewModel.createNewSavedItemLabelWithTemp(name, LabelSwatchHelper.random())
}

@Composable
@OptIn(ExperimentalMaterial3Api::class)
fun LabelsSelectionSheetContent(
    isLibraryMode: Boolean,
    labels: List<SavedItemLabel>,
    initialSelectedLabels: List<SavedItemLabel>,
    labelsViewModel: LabelsViewModel,
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

    val titleText = if (isLibraryMode)
        stringResource(R.string.label_selection_sheet_title) else
        stringResource(R.string.label_selection_sheet_title_alt)

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.primaryContainer),
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(titleText)
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
                navigationIcon = {
                    TextButton(onClick = onCancel) {
                        Text(text = stringResource(R.string.label_selection_sheet_action_cancel))
                    }
                },
                actions = {
                    TextButton(onClick = { onSave(state.chips.map { it.label }) }) {
                        Text(
                            text = if (isLibraryMode)
                                stringResource(R.string.label_selection_sheet_action_search) else
                                stringResource(R.string.label_selection_sheet_action_save)
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(horizontal = 10.dp)
        ) {
            ChipTextField(
                state = state,
                value = filterTextValue,
                onValueChange = onFilterTextValueChange,
                onSubmit = {
                    if (isLibraryMode) {
                        currentLabel?.let {
                            LabelChipView(it)
                        }
                    } else {
                        LabelChipView(
                            findOrCreateLabel(
                                labelsViewModel = labelsViewModel,
                                labels = labels,
                                name = it.text
                            )
                        )
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
/*                colors = androidx.compose.material3.TextFieldDefaults.colors(
                    textColor = MaterialTheme.colorScheme.onBackground,
                    backgroundColor = MaterialTheme.colorScheme.surface
                ),*/
                contentPadding = PaddingValues(10.dp),
                modifier = Modifier
                    .defaultMinSize(minHeight = 45.dp)
                    .fillMaxWidth()
                    .padding(top = 24.dp)
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
                val context = LocalContext.current
                Row(
                    horizontalArrangement = Arrangement.Start,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            val labelName = filterTextValue.text.trim()
                            when (labelsViewModel.validateLabelName(labelName)) {
                                LabelsViewModel.Error.LabelNameTooLong -> {
                                    Toast
                                        .makeText(
                                            context,
                                            context.getString(
                                                R.string.label_selection_sheet_label_too_long_error_msg,
                                                labelsViewModel.labelNameMaxLength
                                            ),
                                            Toast.LENGTH_SHORT
                                        )
                                        .show()
                                }

                                null -> {
                                    val label = findOrCreateLabel(
                                        labelsViewModel = labelsViewModel,
                                        labels = labels,
                                        name = labelName
                                    )

                                    state.addChip(LabelChipView(label))
                                    filterTextValue = TextFieldValue()
                                }
                            }
                        }
                        .padding(horizontal = 10.dp)
                        .padding(top = 24.dp, bottom = 5.dp)
                )
                {
                    Icon(
                        imageVector = Icons.Filled.AddCircle,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp),
                        tint =  MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = stringResource(
                            R.string.label_selection_sheet_text_create,
                            filterTextValue.text.trim()
                        ),
                        style = TextStyle(
                            color = MaterialTheme.colorScheme.onSurface
                        ),
                    )
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
                                .padding(end = 10.dp, bottom = 10.dp)
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
        state.focusTextField()
    }
}
