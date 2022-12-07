package app.omnivore.omnivore.ui.reader

import android.content.DialogInterface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.unit.dp
import androidx.fragment.app.DialogFragment
import app.omnivore.omnivore.ui.theme.OmnivoreTheme

class AnnotationEditFragment : DialogFragment() {
  private var onSave: (String) -> Unit = {}
  private var onCancel: () -> Unit = {}
  private var initialAnnotation: String = ""

  fun configure(
    initialAnnotation: String,
    onSave: (String) -> Unit,
    onCancel: () -> Unit,
  ) {
    this.initialAnnotation = initialAnnotation
    this.onSave = onSave
    this.onCancel = onCancel
  }

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    return ComposeView(requireContext()).apply {
      // Dispose of the Composition when the view's LifecycleOwner
      // is destroyed
      setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
      setContent {
        OmnivoreTheme {
          AnnotationEditView(
            initialAnnotation,
            onSave,
            onCancel,
            dismissAction = { dismiss() }
          )
        }
      }
    }
  }

  override fun onDismiss(dialog: DialogInterface) {
    onCancel()
    super.onDismiss(dialog)
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnnotationEditView(
  initialAnnotation: String,
  onSave: (String) -> Unit,
  onCancel: () -> Unit,
  dismissAction: () -> Unit = {}
) {
  val annotation = remember { mutableStateOf(initialAnnotation) }
  val focusRequester = FocusRequester()

  Column(
    modifier = Modifier
      .clip(RoundedCornerShape(4.dp))
      .background(MaterialTheme.colorScheme.background)
      .padding(8.dp),
  ) {
    Column(
      modifier = Modifier.padding(16.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
    ) {
      Row {
        TextButton(
          onClick = {
            onCancel()
            dismissAction()
          }
        ) {
          Text("Cancel")
        }

        Spacer(modifier = Modifier.weight(1.0F))

        Text(text = "Note")

        Spacer(modifier = Modifier.weight(1.0F))

        TextButton(
          onClick = {
            onSave(annotation.value)
            dismissAction()
          }
        ) {
          Text("Save")
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      TextField(
        value = annotation.value,
        onValueChange = { annotation.value = it },
        modifier = Modifier
          .width(IntrinsicSize.Max)
          .height(IntrinsicSize.Max)
          .weight(1.0F)
          .focusRequester(focusRequester)
      )

      LaunchedEffect(Unit) {
        focusRequester.requestFocus()
      }

//      Row {
//        Spacer(modifier = Modifier.weight(0.1F))
//        TextField(
//          value = annotation.value,
//          onValueChange = { annotation.value = it },
//          modifier = Modifier
//            .width(IntrinsicSize.Max)
//            .height(IntrinsicSize.Max)
//            .weight(1.0F)
//        )
//        Spacer(modifier = Modifier.weight(0.1F))
//      }
    }

    Spacer(modifier = Modifier.height(16.dp))
  }
}
