package app.omnivore.omnivore.ui.reader

import android.net.Uri
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.pspdfkit.configuration.activity.PdfActivityConfiguration
import com.pspdfkit.configuration.activity.UserInterfaceViewMode
import com.pspdfkit.jetpack.compose.DocumentView
import com.pspdfkit.jetpack.compose.ExperimentalPSPDFKitApi
import com.pspdfkit.jetpack.compose.rememberDocumentState

@OptIn(ExperimentalPSPDFKitApi::class)
@Composable
fun PDFDocumentView(urlString: String) {
  val context = LocalContext.current

  val pdfActivityConfiguration = remember {
    PdfActivityConfiguration
      .Builder(context)
      .setUserInterfaceViewMode(UserInterfaceViewMode.USER_INTERFACE_VIEW_MODE_HIDDEN)
      .build()
  }

  val pdfDocumentState = rememberDocumentState(
    documentUri = Uri.parse(urlString),
    configuration = pdfActivityConfiguration
  )

  DocumentView(
    documentState = pdfDocumentState,
    modifier = Modifier.fillMaxSize()
  )
}
