package app.omnivore.omnivore.feature.editinfo

import android.widget.Toast
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.lifecycle.MutableLiveData
import app.omnivore.omnivore.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditInfoSheetContent(
    savedItemId: String?,
    title: String?,
    author: String?,
    description: String?,
    viewModel: EditInfoViewModel,
    onCancel: () -> Unit,
    onUpdated: () -> Unit
) {

    val context = LocalContext.current

    var titleTextFieldValue by remember { mutableStateOf(TextFieldValue(title ?: "")) }
    var authorTextFieldValue by remember { mutableStateOf(TextFieldValue(author ?: "")) }
    var descriptionTextFieldValue by remember { mutableStateOf(TextFieldValue(description ?: "")) }

    fun showToast(msg: String) {
        Toast.makeText(
            context,
            msg,
            Toast.LENGTH_SHORT
        ).show()
    }

    val state: EditInfoState by viewModel.state.observeAsState(EditInfoState.DEFAULT)
    val isUpdating = MutableLiveData(false)

    when (state) {
        EditInfoState.DEFAULT -> {
            isUpdating.value = false
        }
        EditInfoState.UPDATING -> {
            isUpdating.value = true
        }
        EditInfoState.ERROR -> {
            isUpdating.value = false
            showToast(viewModel.message ?: context.getString(R.string.edit_info_sheet_error))

            viewModel.resetState()
        }
        EditInfoState.UPDATED -> {
            isUpdating.value = false
            showToast(viewModel.message ?: context.getString(R.string.edit_info_sheet_success))

            onUpdated()
            viewModel.resetState()
        }
    }

    androidx.compose.material.Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.primaryContainer),
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(stringResource(R.string.edit_info_sheet_title))
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
                navigationIcon = {
                    TextButton(onClick = onCancel) {
                        Text(text = stringResource(R.string.edit_info_sheet_action_cancel))
                    }
                },
                actions = {
                    TextButton(onClick = {
                        val newTitle = titleTextFieldValue.text
                        val newAuthor = authorTextFieldValue.text.ifEmpty { null }
                        val newDescription = descriptionTextFieldValue.text.ifEmpty { null }

                        savedItemId?.let {
                            viewModel.editInfo(it, newTitle, newAuthor, newDescription)
                        }
                    }) {
                        Text(stringResource(R.string.edit_info_sheet_action_save))
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
            if (isUpdating.value == true) {
                Spacer(modifier = Modifier.width(16.dp))
                CircularProgressIndicator(
                    modifier = Modifier
                        .height(16.dp)
                        .width(16.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            OutlinedTextField(
                value = titleTextFieldValue,
                label = { Text(stringResource(R.string.edit_info_sheet_text_field_label_title)) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                onValueChange = { titleTextFieldValue = it },
                modifier = Modifier.padding(top = 24.dp).fillMaxWidth()
            )

            OutlinedTextField(
                value = authorTextFieldValue,
                label = { Text(stringResource(R.string.edit_info_sheet_text_field_label_author)) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                onValueChange = { authorTextFieldValue = it },
                modifier = Modifier.padding(top = 24.dp).fillMaxWidth()
            )

            OutlinedTextField(
                value = descriptionTextFieldValue,
                label = { Text(stringResource(R.string.edit_info_sheet_text_field_label_description)) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                singleLine = false, minLines = 1, maxLines = 5,
                onValueChange = { descriptionTextFieldValue = it },
                modifier = Modifier.padding(top = 24.dp).fillMaxWidth()
            )
        }
    }
}
