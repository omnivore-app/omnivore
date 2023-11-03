package app.omnivore.omnivore.ui.components

import android.widget.Toast
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Link
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.ClipboardManager
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.lifecycle.MutableLiveData
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.save.SaveState
import app.omnivore.omnivore.ui.save.SaveViewModel

@Composable
fun AddLinkSheetContent(
    saveViewModel: SaveViewModel,
    onCancel: () -> Unit,
    onLinkAdded: () -> Unit
) {

    val context = LocalContext.current
    val focusRequester = remember { FocusRequester() }

    val clipboardManager: ClipboardManager = LocalClipboardManager.current
    val clipboardText = clipboardManager.getText()?.text

    var textFieldValue by remember { mutableStateOf(TextFieldValue("")) }

    fun showToast(msg: String) {
        Toast.makeText(
            context,
            msg,
            Toast.LENGTH_SHORT
        ).show()
    }

    val saveState: SaveState by saveViewModel.saveState.observeAsState(SaveState.NONE)
    val isSaving = MutableLiveData(false)

    when (saveState) {
        SaveState.NONE -> {
            isSaving.value = false
        }
        SaveState.SAVING -> {
            isSaving.value = true
        }
        SaveState.ERROR -> {
            isSaving.value = false
            showToast(context.getString(R.string.add_link_sheet_save_url_error))
        }
        SaveState.SAVED -> {
            isSaving.value = false
            showToast(context.getString(R.string.add_link_sheet_save_url_success))

            onLinkAdded()
        }
    }

    fun addLink(url: String) {
        if (!saveViewModel.validateUrl(url)) {
            showToast(context.getString(R.string.add_link_sheet_invalid_url_error))
            return
        }

        saveViewModel.saveURL(url)
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
                    Text(text = stringResource(R.string.add_link_sheet_action_cancel))
                }

                Text(stringResource(R.string.add_link_sheet_title), fontWeight = FontWeight.ExtraBold)

                TextButton(onClick = { addLink(textFieldValue.text) }) {
                    Text(stringResource(R.string.add_link_sheet_action_add_link))
                }
            }

            if (isSaving.value == true) {
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
                value = textFieldValue,
                placeholder = { Text(stringResource(R.string.add_link_sheet_text_field_placeholder)) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
                leadingIcon = { Icon(imageVector = Icons.Default.Link, contentDescription = "linkIcon") },
                onValueChange = { textFieldValue = it },
                modifier = Modifier.focusRequester(focusRequester).padding(top = 24.dp).fillMaxWidth()
            )

            if (clipboardText != null) {
                Button(
                    modifier = Modifier.padding(top = 10.dp),
                    onClick = {
                        textFieldValue = TextFieldValue(
                            text = clipboardText,
                            selection = TextRange(clipboardText.length))
                    }
                ) {
                    Text(stringResource(R.string.add_link_sheet_action_paste_from_clipboard))
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }
}
