package app.omnivore.omnivore.ui.reader

import android.net.Uri
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.pspdfkit.configuration.activity.PdfActivityConfiguration
import com.pspdfkit.configuration.activity.UserInterfaceViewMode
import com.pspdfkit.jetpack.compose.DocumentView
import com.pspdfkit.jetpack.compose.ExperimentalPSPDFKitApi
import com.pspdfkit.jetpack.compose.rememberDocumentState
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class PDFReaderActivity: AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    val viewModel: PDFReaderViewModel by viewModels()

    super.onCreate(savedInstanceState)

    val slug = intent.getStringExtra("LINKED_ITEM_SLUG") ?: ""

    setContent {
      PDFReaderLoadingContainer(slug = slug, pdfReaderViewModel = viewModel)
    }
  }
}

@Composable
fun PDFReaderLoadingContainer(slug: String, pdfReaderViewModel: PDFReaderViewModel) {
  val pdfReaderParams: PDFReaderParams? by pdfReaderViewModel.pdfReaderParamsLiveData.observeAsState(null)

  if (pdfReaderParams == null) {
    pdfReaderViewModel.loadItem(slug = slug)
  }

  if (pdfReaderParams != null) {
    PDFDocumentView(urlString = pdfReaderParams!!.item.pageURLString)
  } else {
    // TODO: add a proper loading view
    Text("Loading...")
  }
}

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
    documentUri = Uri.parse("file:///android_asset/test.pdf"),
//  documentUri = Uri.parse(urlString),
    configuration = pdfActivityConfiguration
  )

  DocumentView(
    documentState = pdfDocumentState,
    modifier = Modifier.fillMaxSize()
  )
}
