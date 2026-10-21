package app.omnivore.omnivore.utils

import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.AutofillNode
import androidx.compose.ui.autofill.AutofillType
import androidx.compose.ui.composed
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalAutofill
import androidx.compose.ui.platform.LocalAutofillTree


object AuthUtils {
    @OptIn(ExperimentalComposeUiApi::class)
    fun Modifier.autofill(
        autofillTypes: List<AutofillType>,
        onFill: ((String) -> Unit),
    ) = composed {
        val autofill = LocalAutofill.current
        val autofillNode = AutofillNode(onFill = onFill, autofillTypes = autofillTypes)
        LocalAutofillTree.current += autofillNode

        this
            .onGloballyPositioned {
                autofillNode.boundingBox = it.boundsInWindow()
            }
            .onFocusChanged { focusState ->
                autofill?.run {
                    if (focusState.isFocused) {
                        requestAutofillForNode(autofillNode)
                    } else {
                        cancelAutofillForNode(autofillNode)
                    }
                }
            }
    }
}
