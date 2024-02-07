package app.omnivore.omnivore.feature.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.SavedItemLabel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LabelsSelectionSheetContent2(
    isLibraryMode: Boolean,
    labels: List<SavedItemLabel>,
    initialSelectedLabels: List<SavedItemLabel>,
    labelsViewModel: LabelsViewModel,
    onCancel: () -> Unit,
    onSave: (List<SavedItemLabel>) -> Unit,
    onCreateLabel: (String, String) -> Unit
) {
    // Use mutableStateMapOf for more idiomatic management of collection state
    val selectedLabels = remember {
        mutableStateMapOf<SavedItemLabel, Boolean>().apply {
            initialSelectedLabels.forEach {
                put(
                    it,
                    true
                )
            }
        }
    }
    var newLabelName by remember { mutableStateOf("") }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (isLibraryMode) stringResource(R.string.label_selection_sheet_title) else
                            stringResource(R.string.label_selection_sheet_title_alt)
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onCancel) {
                        Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { onSave(selectedLabels.filter { it.value }.keys.toList()) }) {
                        Text(
                            text = if (isLibraryMode)
                                stringResource(R.string.label_selection_sheet_action_search) else
                                stringResource(R.string.label_selection_sheet_action_save)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = paddingValues.calculateTopPadding())
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.Start
        ) {
            OutlinedTextField(
                value = newLabelName,
                onValueChange = { newLabelName = it },
                label = { Text("New Label Name") },
                singleLine = true,
                trailingIcon = {
                    IconButton(onClick = {
                        val labelHexValue = "#FFFFFF"
                        onCreateLabel(newLabelName, labelHexValue)
                        newLabelName = ""
                    }) {
                        Icon(Icons.Filled.Add, contentDescription = "Create Label")
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            )
            Row {
                labels.forEach { label ->
                    FilterChip(
                        selected = selectedLabels[label] ?: false,
                        onClick = {
                            selectedLabels[label] = !(selectedLabels[label] ?: false)
                        },
                        label = { Text(label.name) },
                        leadingIcon = if (selectedLabels[label] == true) {
                            {
                                Icon(
                                    imageVector = Icons.Filled.Check,
                                    contentDescription = "Selected",
                                    modifier = Modifier.size(FilterChipDefaults.IconSize)
                                )
                            }
                        } else null,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }
        }
    }
}
