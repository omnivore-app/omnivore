package app.omnivore.omnivore.ui.reader

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.unit.dp
import androidx.fragment.app.Fragment
import app.omnivore.omnivore.ui.theme.OmnivoreTheme

class AnnotationEditFragment : Fragment() {
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
            initialAnnotation = "Initial Annotation",
            onSave = {},
            onCancel = {}
          )
        }
      }
    }
  }
}

// TODO: better layout and styling for this view
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnnotationEditView(
  initialAnnotation: String,
  onSave: (String) -> Unit,
  onCancel: () -> Unit,
) {
  val annotation = remember { mutableStateOf(initialAnnotation) }

  Column(
    modifier = Modifier
      .clip(RoundedCornerShape(4.dp))
      .background(MaterialTheme.colorScheme.background)
      .padding(8.dp),
  ) {
    Column(
      modifier = Modifier.padding(16.dp),
    ) {
      Text(text = "Note")

      Spacer(modifier = Modifier.height(8.dp))

      TextField(
        value = annotation.value,
        onValueChange = { annotation.value = it }
      )
    }

    Spacer(modifier = Modifier.height(8.dp))

    Row(
      modifier = Modifier.align(Alignment.End)
    ) {
      Button(
        onClick = {
          onCancel()
        }
      ) {
        Text("Cancel")
      }

      Spacer(modifier = Modifier.width(8.dp))

      Button(
        onClick = {
          onSave(annotation.value)
        }
      ) {
        Text("Save")
      }
    }
  }
}
