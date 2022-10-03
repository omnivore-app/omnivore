package app.omnivore.omnivore.ui.reader

import android.net.Uri
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import app.omnivore.omnivore.R
import com.pspdfkit.configuration.PdfConfiguration
import com.pspdfkit.configuration.page.PageScrollDirection
import com.pspdfkit.ui.PdfFragment
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class PDFReaderActivity: AppCompatActivity() {
  private lateinit var fragment: PdfFragment
  val viewModel: PDFReaderViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.pdf_reader_fragment)

    val slug = intent.getStringExtra("LINKED_ITEM_SLUG") ?: ""
    viewModel.loadItem(slug, this)

    // Create the observer which updates the UI.
    val pdfParamsObserver = Observer<PDFReaderParams?> { params ->
      if (params != null) {
        val configuration = PdfConfiguration.Builder()
          .scrollDirection(PageScrollDirection.HORIZONTAL)
          .build()

        // First, try to restore a previously created fragment.
        // If no fragment exists, create a new one.
        fragment = supportFragmentManager.findFragmentById(R.id.fragmentContainer) as PdfFragment?
          ?: createFragment(params.localFileUri, configuration)
      }
    }

    // Observe the LiveData, passing in this activity as the LifecycleOwner and the observer.
    viewModel.pdfReaderParamsLiveData.observe(this, pdfParamsObserver)
  }

  private fun createFragment(documentUri: Uri, configuration: PdfConfiguration): PdfFragment {
    val fragment = PdfFragment.newInstance(documentUri, configuration)
    supportFragmentManager.beginTransaction()
      .replace(R.id.fragmentContainer, fragment)
      .commit()
    return fragment
  }
}
