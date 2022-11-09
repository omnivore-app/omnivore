package app.omnivore.omnivore.ui.reader

import android.graphics.PointF
import android.graphics.RectF
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.widget.ImageView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.DrawableCompat
import androidx.lifecycle.Observer
import app.omnivore.omnivore.R
import app.omnivore.omnivore.models.Highlight
import com.pspdfkit.annotations.Annotation
import com.pspdfkit.annotations.AnnotationProvider
import com.pspdfkit.annotations.HighlightAnnotation
import com.pspdfkit.configuration.PdfConfiguration
import com.pspdfkit.configuration.activity.ThumbnailBarMode
import com.pspdfkit.configuration.page.PageScrollDirection
import com.pspdfkit.datastructures.TextSelection
import com.pspdfkit.document.PdfDocument
import com.pspdfkit.document.search.SearchResult
import com.pspdfkit.listeners.DocumentListener
import com.pspdfkit.listeners.OnPreparePopupToolbarListener
import com.pspdfkit.ui.PdfFragment
import com.pspdfkit.ui.PdfThumbnailBar
import com.pspdfkit.ui.search.PdfSearchViewModular
import com.pspdfkit.ui.search.SearchResultHighlighter
import com.pspdfkit.ui.search.SimpleSearchResultListener
import com.pspdfkit.ui.special_mode.controller.TextSelectionController
import com.pspdfkit.ui.special_mode.manager.TextSelectionManager
import com.pspdfkit.ui.toolbar.popup.PdfTextSelectionPopupToolbar
import com.pspdfkit.utils.PdfUtils
import dagger.hilt.android.AndroidEntryPoint
import java.util.*

@AndroidEntryPoint
class PDFReaderActivity: AppCompatActivity(), DocumentListener, TextSelectionManager.OnTextSelectionChangeListener, TextSelectionManager.OnTextSelectionModeChangeListener, OnPreparePopupToolbarListener {
  private var hasLoadedHighlights = false
  private var pendingHighlightAnnotation: HighlightAnnotation? = null

  private lateinit var fragment: PdfFragment
  private lateinit var thumbnailBar: PdfThumbnailBar
  private lateinit var configuration: PdfConfiguration
  private lateinit var modularSearchView: PdfSearchViewModular
  private lateinit var highlighter: SearchResultHighlighter

  val viewModel: PDFReaderViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    configuration = PdfConfiguration.Builder()
      .scrollDirection(PageScrollDirection.HORIZONTAL)
      .build()

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

  // TODO: implement onDestroy to remove listeners?

  private fun load(params: PDFReaderParams) {
    // First, try to restore a previously created fragment.
    // If no fragment exists, create a new one.
    fragment = supportFragmentManager.findFragmentById(R.id.fragmentContainer) as PdfFragment?
      ?: createFragment(params.localFileUri, configuration)

    // Initialize all PSPDFKit UI components.
    initModularSearchViewAndButton()
    initThumbnailBar()

    fragment.apply {
      setOnPreparePopupToolbarListener(this@PDFReaderActivity)
      addOnTextSelectionModeChangeListener(this@PDFReaderActivity)
      addOnTextSelectionChangeListener(this@PDFReaderActivity)
      addDocumentListener(this@PDFReaderActivity)
      addDocumentListener(modularSearchView)
      addDocumentListener(thumbnailBar.documentListener)
      isImmersive = true

      addOnAnnotationUpdatedListener(object: AnnotationProvider.OnAnnotationUpdatedListener {
        override fun onAnnotationCreated(annotation: Annotation) {
          if (isNewAnnotation(annotation)) {
            viewModel.createHighlight(annotation, params.item.id)
          }
        }

        override fun onAnnotationUpdated(annotation: Annotation) {
          if (!isNewAnnotation(annotation)) { return }
          val highlightAnnotation = annotation as? HighlightAnnotation ?: return
          viewModel.syncUpdatedAnnotationHighlight(highlightAnnotation, articleID = params.item.id)
        }

        override fun onAnnotationRemoved(annotation: Annotation) {
          viewModel.deleteHighlight(annotation)
        }

        override fun onAnnotationZOrderChanged(
          p0: Int,
          p1: MutableList<Annotation>,
          p2: MutableList<Annotation>
        ) {
          // Unimplemented
        }
      })
    }
  }

  // If created time is less than 2 seconds then we consider it a newly created annotation
  private fun isNewAnnotation(annotation: Annotation): Boolean {
    val currentTime = Calendar.getInstance().time.time
    val createdTime = annotation.createdDate?.time ?: 0
    val duration = currentTime - createdTime
    return duration < 2000
  }

  override fun onDocumentLoaded(document: PdfDocument) {
    if (hasLoadedHighlights) return
    hasLoadedHighlights = true

    thumbnailBar.setDocument(document, configuration)
    fragment.addDocumentListener(modularSearchView)
    modularSearchView.setDocument(document, configuration)

    val params = viewModel.pdfReaderParamsLiveData.value

    params?.let {
      loadHighlights(it.articleContent.highlights)

      fragment.scrollTo(
        RectF(0f, 0f, 0f, 0f),
        params.item.readingProgressAnchor,
        0,
        true
      )
    }
  }

  private fun loadHighlights(highlights: List<Highlight>) {
    for (highlight in highlights) {
      val highlightAnnotation = fragment
        .document
        ?.annotationProvider
        ?.createAnnotationFromInstantJson(highlight.patch)

      highlightAnnotation?.let {
        fragment.addAnnotationToPage(highlightAnnotation, true)
      }
    }
  }

  private fun createFragment(documentUri: Uri, configuration: PdfConfiguration): PdfFragment {
    val fragment = PdfFragment.newInstance(documentUri, configuration)
    supportFragmentManager.beginTransaction()
      .replace(R.id.fragmentContainer, fragment)
      .commit()
    return fragment
  }

  private fun initThumbnailBar() {
    thumbnailBar = findViewById(R.id.thumbnailBar)
      ?: throw IllegalStateException("Error while loading CustomFragmentActivity. The example layout was missing thumbnail bar view.")

    thumbnailBar.setOnPageChangedListener { _, pageIndex: Int -> fragment.pageIndex = pageIndex }
    thumbnailBar.setThumbnailBarMode(ThumbnailBarMode.THUMBNAIL_BAR_MODE_FLOATING)

    val toggleThumbnailButton = findViewById<ImageView>(R.id.toggleThumbnailButton)
      ?: throw IllegalStateException(
        "Error while loading CustomFragmentActivity. The example layout " +
          "was missing the open search button with id `R.id.openThumbnailGridButton`."
      )

    toggleThumbnailButton.apply {
      setImageDrawable(
        tintDrawable(
          drawable,
          ContextCompat.getColor(this@PDFReaderActivity, R.color.black)
        )
      )
      setOnClickListener {
        if (thumbnailBar.visibility == View.VISIBLE) {
          thumbnailBar.visibility = View.INVISIBLE
        } else {
          thumbnailBar.visibility = View.VISIBLE
        }
      }
    }
  }

  private fun initModularSearchViewAndButton() {
    // The search result highlighter will highlight any selected result.
    highlighter = SearchResultHighlighter(this).also {
      fragment.addDrawableProvider(it)
    }

    modularSearchView = findViewById(R.id.modularSearchView)
      ?: throw IllegalStateException("Error while loading CustomFragmentActivity. The example layout was missing the search view.")

    modularSearchView.setSearchViewListener(object : SimpleSearchResultListener() {
      override fun onMoreSearchResults(results: List<SearchResult>) {
        highlighter.addSearchResults(results)
      }

      override fun onSearchCleared() {
        highlighter.clearSearchResults()
      }

      override fun onSearchResultSelected(result: SearchResult?) {
        // Pass on the search result to the highlighter. If 'null' the highlighter will clear any selection.
        highlighter.setSelectedSearchResult(result)
        if (result != null) {
          fragment.scrollTo(PdfUtils.createPdfRectUnion(result.textBlock.pageRects), result.pageIndex, 250, false)
        }
      }
    })

    // The search view is hidden by default (see layout). Set up a click listener that will show the view once pressed.
    val openSearchButton = findViewById<ImageView>(R.id.openSearchButton)
      ?: throw IllegalStateException(
        "Error while loading CustomFragmentActivity. The example layout " +
          "was missing the open search button with id `R.id.openSearchButton`."
      )

    openSearchButton.apply {
      setImageDrawable(
        tintDrawable(
          drawable,
          ContextCompat.getColor(this@PDFReaderActivity, R.color.black)
        )
      )
      setOnClickListener {
        if (modularSearchView.isShown) modularSearchView.hide() else modularSearchView.show()
      }
    }
  }

  override fun onBackPressed() {
    when {
      modularSearchView.isDisplayed -> {
        modularSearchView.hide()
        return
      }
      else -> super.onBackPressed()
    }
  }

  override fun onPageClick(
    document: PdfDocument,
    pageIndex: Int,
    event: MotionEvent?,
    pagePosition: PointF?,
    clickedAnnotation: Annotation?
  ): Boolean {
    if (clickedAnnotation != null) {
      // TODO: show menu with delete and add note buttons
      Log.d("pdf", "clicked annotation: $clickedAnnotation")
    }

    return super.onPageClick(document, pageIndex, event, pagePosition, clickedAnnotation)
  }

  private fun tintDrawable(drawable: Drawable, tint: Int): Drawable {
    val tintedDrawable = DrawableCompat.wrap(drawable)
    DrawableCompat.setTint(tintedDrawable, tint)
    return tintedDrawable
  }

  override fun onBeforeTextSelectionChange(p0: TextSelection?, p1: TextSelection?): Boolean {
    return true
  }

  override fun onAfterTextSelectionChange(p0: TextSelection?, p1: TextSelection?) {
    val textRects = p0?.textBlocks ?: return
    val pageIndex = p0.pageIndex
    pendingHighlightAnnotation = HighlightAnnotation(pageIndex, textRects)
    Log.d("pdf", "created annotation: $pendingHighlightAnnotation")
//    fragment.addAnnotationToPage(highlightAnnotation, false)
  }

  override fun onEnterTextSelectionMode(p0: TextSelectionController) {
    val textRects = p0?.textSelection?.textBlocks ?: return
    val pageIndex = p0.textSelection?.pageIndex ?: return
    pendingHighlightAnnotation = HighlightAnnotation(pageIndex, textRects)
    Log.d("pdf", "updated annotation via mode listener: $pendingHighlightAnnotation")
  }

  override fun onExitTextSelectionMode(p0: TextSelectionController) {
    pendingHighlightAnnotation = null
    Log.d("pdf", "destroyed pending highlight")
  }

  override fun onPrepareTextSelectionPopupToolbar(p0: PdfTextSelectionPopupToolbar) {
    Log.d("pdf", "popup toolbar action")
  }
}
