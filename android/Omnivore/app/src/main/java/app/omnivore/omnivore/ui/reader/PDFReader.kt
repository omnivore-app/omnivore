package app.omnivore.omnivore.ui.reader

import android.graphics.RectF
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.activity.viewModels
import androidx.annotation.UiThread
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import app.omnivore.omnivore.R
import com.google.gson.Gson
import com.pspdfkit.annotations.HighlightAnnotation
import com.pspdfkit.configuration.PdfConfiguration
import com.pspdfkit.configuration.page.PageScrollDirection
import com.pspdfkit.document.PdfDocument
import com.pspdfkit.listeners.DocumentListener
import com.pspdfkit.ui.PdfFragment
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class PDFReaderActivity: AppCompatActivity(), DocumentListener {
  private var hasLoadedHighlights = false
  private lateinit var fragment: PdfFragment
  val viewModel: PDFReaderViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.pdf_reader_fragment)

    // Create the observer which updates the UI.
    val pdfParamsObserver = Observer<PDFReaderParams?> { params ->
      if (params != null) {
        load(params)
      }
    }

    // Observe the LiveData, passing in this activity as the LifecycleOwner and the observer.
    viewModel.pdfReaderParamsLiveData.observe(this, pdfParamsObserver)

    val slug = intent.getStringExtra("LINKED_ITEM_SLUG") ?: ""
    viewModel.loadItem(slug, this)
  }

  private fun load(params: PDFReaderParams) {
    val configuration = PdfConfiguration.Builder()
      .scrollDirection(PageScrollDirection.HORIZONTAL)
      .build()

    // First, try to restore a previously created fragment.
    // If no fragment exists, create a new one.
    fragment = supportFragmentManager.findFragmentById(R.id.fragmentContainer) as PdfFragment?
      ?: createFragment(params.localFileUri, configuration)

    fragment.apply {
      addDocumentListener(this@PDFReaderActivity)
    }
  }

  override fun onDocumentLoaded(document: PdfDocument) {
    if (hasLoadedHighlights) return
    hasLoadedHighlights = true

    val params = viewModel.pdfReaderParamsLiveData.value

    params?.let {
      for (highlight in it.articleContent.highlights) {
        val highlightAnnotation = fragment
          .document
          ?.annotationProvider
          ?.createAnnotationFromInstantJson(highlight.patch)

        highlightAnnotation?.let {
          fragment.addAnnotationToPage(highlightAnnotation, true)
        }
      }

      fragment.scrollTo(
        RectF(0f, 0f, 0f, 0f),
        params.item.readingProgressAnchor,
        0,
        true
      )
    }
  }

  private fun createFragment(documentUri: Uri, configuration: PdfConfiguration): PdfFragment {
    val fragment = PdfFragment.newInstance(documentUri, configuration)
    supportFragmentManager.beginTransaction()
      .replace(R.id.fragmentContainer, fragment)
      .commit()
    return fragment
  }
}
