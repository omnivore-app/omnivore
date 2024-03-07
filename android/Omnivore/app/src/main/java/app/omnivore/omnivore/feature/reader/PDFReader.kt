package app.omnivore.omnivore.feature.reader

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.PointF
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.*
import android.widget.ImageView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.DrawableCompat
import androidx.lifecycle.Observer
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.Highlight
import com.pspdfkit.annotations.Annotation
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
import com.pspdfkit.ui.PopupToolbar
import com.pspdfkit.ui.search.PdfSearchViewModular
import com.pspdfkit.ui.search.SimpleSearchResultListener
import com.pspdfkit.ui.special_mode.controller.TextSelectionController
import com.pspdfkit.ui.special_mode.manager.TextSelectionManager
import com.pspdfkit.ui.toolbar.popup.PdfTextSelectionPopupToolbar
import com.pspdfkit.ui.toolbar.popup.PopupToolbarMenuItem
import com.pspdfkit.utils.PdfUtils
import dagger.hilt.android.AndroidEntryPoint
import org.json.JSONObject


@AndroidEntryPoint
class PDFReaderActivity: AppCompatActivity(), DocumentListener, TextSelectionManager.OnTextSelectionChangeListener, TextSelectionManager.OnTextSelectionModeChangeListener, OnPreparePopupToolbarListener {
  private var hasLoadedHighlights = false
  private var pendingHighlightAnnotation: HighlightAnnotation? = null
  private var textSelectionController: TextSelectionController? = null
  private var clickedHighlight: Annotation? = null
  private var clickedHighlightPosition: PointF? = null

  private lateinit var fragment: PdfFragment
  private lateinit var thumbnailBar: PdfThumbnailBar
  private lateinit var configuration: PdfConfiguration
  private lateinit var modularSearchView: PdfSearchViewModular

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

    val slug = intent.getStringExtra("SAVED_ITEM_SLUG") ?: ""
    viewModel.loadItem(slug, this)
  }

  override fun onDestroy() {
    actionMode?.finish()
    resetHighlightTap()
    // TODO: remove listeners?
    super.onDestroy()
  }

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
    }
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
      val patch = highlight.patch
      if (patch != null) {
        val highlightAnnotation = fragment
          .document
          ?.annotationProvider
          ?.createAnnotationFromInstantJson(patch)

        highlightAnnotation?.let {
          fragment.addAnnotationToPage(highlightAnnotation, true)
        }
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
    // The search view is hidden by default (see layout). Set up a click listener that will show the view once pressed.
    val openSearchButton = findViewById<ImageView>(R.id.openSearchButton)
      ?: throw IllegalStateException(
        "Error while loading CustomFragmentActivity. The example layout " +
          "was missing the open search button with id `R.id.openSearchButton`."
      )

    val closeSearchButton = findViewById<ImageView>(R.id.closeSearchButton)
      ?: throw IllegalStateException(
        "Error while loading CustomFragmentActivity. The example layout " +
          "was missing the close search button with id `R.id.closeSearchButton`."
      )

    modularSearchView = findViewById(R.id.modularSearchView)
      ?: throw IllegalStateException("Error while loading CustomFragmentActivity. The example layout was missing the search view.")

    modularSearchView.setSearchViewListener(object : SimpleSearchResultListener() {
      override fun onSearchResultSelected(result: SearchResult?) {
        // Pass on the search result to the highlighter. If 'null' the highlighter will clear any selection.
        if (result != null) {
          closeSearchButton.visibility = View.INVISIBLE
          fragment.scrollTo(PdfUtils.createPdfRectUnion(result.textBlock.pageRects), result.pageIndex, 250, false)
        }
      }
    })

    openSearchButton.apply {
      setImageDrawable(
        tintDrawable(
          drawable,
          ContextCompat.getColor(this@PDFReaderActivity, R.color.black)
        )
      )

      setOnClickListener {
        closeSearchButton.visibility = View.VISIBLE
        modularSearchView.show()
      }
    }

    closeSearchButton.apply {
      setImageDrawable(
        tintDrawable(
          drawable,
          ContextCompat.getColor(this@PDFReaderActivity, R.color.white)
        )
      )

      setOnClickListener {
        closeSearchButton.visibility = View.INVISIBLE
        modularSearchView.hide()
      }
    }
  }

  @Deprecated("Deprecated in Java")
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
      clickedHighlight = clickedAnnotation
      clickedHighlightPosition = pagePosition
      startActionMode(null, ActionMode.TYPE_FLOATING)
    }

    return super.onPageClick(document, pageIndex, event, pagePosition, clickedAnnotation)
  }

  override fun onPageChanged(document: PdfDocument, pageIndex: Int) {
    viewModel.syncPageChange(pageIndex, document.pageCount)
    super.onPageChanged(document, pageIndex)
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
  }

  override fun onEnterTextSelectionMode(p0: TextSelectionController) {
    val textRects = p0.textSelection?.textBlocks ?: return
    val pageIndex = p0.textSelection?.pageIndex ?: return
    pendingHighlightAnnotation = HighlightAnnotation(pageIndex, textRects)
    textSelectionController = p0
  }

  override fun onExitTextSelectionMode(p0: TextSelectionController) {
    textSelectionController = null
    pendingHighlightAnnotation = null
  }

  @SuppressLint("ResourceType")
  override fun onPrepareTextSelectionPopupToolbar(p0: PdfTextSelectionPopupToolbar) {
    val onClickListener = PopupToolbar.OnPopupToolbarItemClickedListener { it ->
      when (it.id) {
        1 -> {
          pendingHighlightAnnotation?.let { annotation ->
            val quote = textSelectionController?.textSelection?.text ?: ""
            val existingAnnotations = fragment.document?.annotationProvider?.getAnnotations(fragment.pageIndex) ?: listOf()
            val overlappingAnnotations = viewModel.overlappingAnnotations(annotation, existingAnnotations)
            val overlapIDs = overlappingAnnotations.mapNotNull { viewModel.pluckHighlightID(it) }

            for (overlappingAnnotation in overlappingAnnotations) {
              fragment.document?.annotationProvider?.removeAnnotationFromPage(overlappingAnnotation)
            }

            fragment.addAnnotationToPage(annotation, false) {
              viewModel.syncHighlightUpdates(annotation, quote, overlapIDs)
            }
          }

          textSelectionController?.textSelection = null
          p0.dismiss()
          return@OnPopupToolbarItemClickedListener true
        }
        2 -> {
          Log.d("pdf", "user selected annotate action")
          showAnnotationView("")
//          textSelectionController?.textSelection = null
          p0.dismiss()
          return@OnPopupToolbarItemClickedListener true
        }
        3 -> {
          val text = textSelectionController?.textSelection?.text ?: ""
          val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
          val clip = ClipData.newPlainText(text, text)
          clipboard.setPrimaryClip(clip)
          textSelectionController?.textSelection = null
          p0.dismiss()
          return@OnPopupToolbarItemClickedListener true
        }
        else -> {
          p0.dismiss()
          textSelectionController?.textSelection = null
          return@OnPopupToolbarItemClickedListener false
        }
      }
    }

    p0.setOnPopupToolbarItemClickedListener(onClickListener)

    p0.menuItems = listOf(
      PopupToolbarMenuItem(1, R.string.pdf_highlight_menu_action),
      PopupToolbarMenuItem(2, R.string.annotate_menu_action),
      PopupToolbarMenuItem(3, R.string.pdf_highlight_copy),
    )
  }

  var actionMode: ActionMode? = null

  private val actionModeCallback = object : ActionMode.Callback2() {
    // Called when the action mode is created; startActionMode() was called
    override fun onCreateActionMode(mode: ActionMode, menu: Menu): Boolean {
      actionMode = mode
      mode.menuInflater.inflate(R.menu.pdf_highlight_selection_menu, menu)
      return true
    }

    // Called each time the action mode is shown. Always called after onCreateActionMode, but
    // may be called multiple times if the mode is invalidated.
    override fun onPrepareActionMode(mode: ActionMode, menu: Menu): Boolean {
      return false // Return false if nothing is done
    }

    // Called when the user selects a contextual menu item
    override fun onActionItemClicked(mode: ActionMode, item: MenuItem): Boolean {
      return when (item.itemId) {
        R.id.annotate -> {
          Log.d("pdf", "annotate button tapped")
          clickedHighlight?.let {
            viewModel.annotationUnderNoteEdit = it
            showAnnotationView(viewModel.pluckExistingNote(it) ?: "")
          }
          true
        }
        R.id.delete -> {
          Log.d("pdf", "remove button tapped")
          clickedHighlight?.let {
            viewModel.deleteHighlight(it)
            fragment.document?.annotationProvider?.removeAnnotationFromPage(it)
          }
          resetHighlightTap()
          true
        }
        R.id.copyPdfHighlight -> {
          Log.d("pdf", "copy button tapped")

          val omnivoreHighlight = clickedHighlight?.customData?.get("omnivoreHighlight") as? JSONObject
          val quote = omnivoreHighlight?.get("quote") as? String
          quote?.let {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText(it, it)
            clipboard.setPrimaryClip(clip)
          }
          resetHighlightTap()
          true
        }
        else -> {
          Log.d("pdf", "unrecognized action")
          resetHighlightTap()
          false
        }
      }
    }

    // Called when the user exits the action mode
    override fun onDestroyActionMode(mode: ActionMode) {
      clickedHighlight = null
      clickedHighlightPosition = null
    }

    override fun onGetContentRect(mode: ActionMode?, view: View?, outRect: Rect?) {
      clickedHighlightPosition?.let {
        val xValue = it.x.toInt()
        val yValue = it.y.toInt()
        val rect = Rect(xValue, yValue, xValue, yValue)
        outRect?.set(rect)
      }
    }
  }

  private fun resetHighlightTap() {
    actionMode?.finish()
    actionMode = null
    clickedHighlight = null
    clickedHighlightPosition = null
    textSelectionController?.textSelection = null
    viewModel.annotationUnderNoteEdit = null
  }

  override fun startActionMode(callback: ActionMode.Callback?, type: Int): ActionMode? {
    return super.startActionMode(actionModeCallback, type)
  }

  private fun showAnnotationView(initialText: String) {
    val annotationEditFragment = AnnotationEditFragment()
    annotationEditFragment.configure(
      onSave = { newNote ->
        if (clickedHighlight != null) {
          viewModel.updateHighlightNote(clickedHighlight!!, newNote)
        } else {
          pendingHighlightAnnotation?.let { annotation ->
            val quote = textSelectionController?.textSelection?.text ?: ""
            fragment.addAnnotationToPage(annotation, false) {
              viewModel.syncHighlightUpdates(annotation, quote, listOf(), newNote)
            }
          }
        }
        resetHighlightTap()
      },
      onCancel = {
        resetHighlightTap()
      },
      initialAnnotation = initialText
    )
    annotationEditFragment.show(fragment.childFragmentManager, null)
  }
}
