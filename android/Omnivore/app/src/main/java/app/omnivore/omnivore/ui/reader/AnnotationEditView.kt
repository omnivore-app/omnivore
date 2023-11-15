package app.omnivore.omnivore.ui.reader

import android.R
import android.content.DialogInterface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.fragment.app.DialogFragment
import app.omnivore.omnivore.ui.notebook.EditNoteModal
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_EXPANDED
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment


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

      (dialog as? BottomSheetDialog)?.let {
        it.behavior.skipCollapsed = true
        it.behavior.state = STATE_EXPANDED
      }

        dialog?.window?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN)



        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
      setContent {
          val annotation = remember { mutableStateOf(initialAnnotation ?: "") }

          OmnivoreTheme {
              EditNoteModal(initialValue = initialAnnotation, onDismiss = { save, text ->
                  if (save) {
                      onSave(text ?: "")
                  } else {
                      onCancel()
                  }
                  dismissNow()
              })
          }
      }
    }
  }

  override fun onDismiss(dialog: DialogInterface) {
    onCancel()
    super.onDismiss(dialog)
  }
}
