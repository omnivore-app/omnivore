package app.omnivore.omnivore.ui.reader

import android.graphics.PointF
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.compose.LocalOnBackPressedDispatcherOwner
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.root.RootView
import app.omnivore.omnivore.ui.savedItemViews.SavedItemContextMenu
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import com.pspdfkit.annotations.Annotation
import com.pspdfkit.annotations.HighlightAnnotation
import com.pspdfkit.configuration.PdfConfiguration
import com.pspdfkit.configuration.page.PageScrollDirection
import com.pspdfkit.listeners.DocumentListener
import com.pspdfkit.listeners.OnPreparePopupToolbarListener
import com.pspdfkit.ui.PdfFragment
import com.pspdfkit.ui.PdfThumbnailBar
import com.pspdfkit.ui.search.PdfSearchViewModular
import com.pspdfkit.ui.special_mode.controller.TextSelectionController
import com.pspdfkit.ui.special_mode.manager.TextSelectionManager
import dagger.hilt.android.AndroidEntryPoint
import kotlin.math.roundToInt


@AndroidEntryPoint
class WebReaderLoadingContainerActivity: AppCompatActivity() {
  val viewModel: WebReaderViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val requestID = intent.getStringExtra("SAVED_ITEM_REQUEST_ID") ?: ""

    setContent {
      OmnivoreTheme {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(color = Color.Black)
        ) {
          WebReaderLoadingContainer(requestID = requestID, webReaderViewModel = viewModel)
        }
      }
    }

    // animate the view up when keyboard appears
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val rootView = findViewById<View>(android.R.id.content).rootView
    ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
      val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
      rootView.setPadding(0, 0, 0, imeHeight)
      insets
    }
  }
}

@Composable
fun WebReaderLoadingContainer(slug: String? = null, requestID: String? = null, webReaderViewModel: WebReaderViewModel) {
  val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher

  var isMenuExpanded by remember { mutableStateOf(false) }
  var showWebPreferencesDialog by remember { mutableStateOf(false ) }

  val webReaderParams: WebReaderParams? by webReaderViewModel.webReaderParamsLiveData.observeAsState(null)
  val annotation: String? by webReaderViewModel.annotationLiveData.observeAsState(null)
  val shouldPopView: Boolean by webReaderViewModel.shouldPopViewLiveData.observeAsState(false)

  val maxToolbarHeight = 48.dp
  val maxToolbarHeightPx = with(LocalDensity.current) { maxToolbarHeight.roundToPx().toFloat() }
  val toolbarHeightPx = remember { mutableStateOf(maxToolbarHeightPx) }

  // Create a connection to the nested scroll system and listen to the scroll happening inside child Column
  val nestedScrollConnection = remember {
    object : NestedScrollConnection {
      override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
        val delta = available.y
        val newHeight = toolbarHeightPx.value + delta
        toolbarHeightPx.value = newHeight.coerceIn(0f, maxToolbarHeightPx)
        return Offset.Zero
      }
    }
  }

  if (webReaderParams == null) {
    webReaderViewModel.loadItem(slug = slug, requestID = requestID)
  }

  if (webReaderParams != null) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .nestedScroll(nestedScrollConnection)
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .verticalScroll(webReaderViewModel.scrollState)

      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .requiredHeight(height = maxToolbarHeight)
        ) {
        }
        WebReader(webReaderParams!!, webReaderViewModel.storedWebPreferences(isSystemInDarkTheme()), webReaderViewModel)
      }

      TopAppBar(
        modifier = Modifier
          .height(height = with(LocalDensity.current) {
            webReaderViewModel.currentToolbarHeight = toolbarHeightPx.value.toInt()
            toolbarHeightPx.value.roundToInt().toDp()
          } ),
        backgroundColor = MaterialTheme.colorScheme.surfaceVariant,
        title = {},
        actions = {
          // Disabling menu until we implement local persistence
          IconButton(onClick = { isMenuExpanded = true }) {
            Icon(
              imageVector = Icons.Filled.Menu,
              contentDescription = null
            )
          }
          IconButton(onClick = { showWebPreferencesDialog = true }) {
            Icon(
              imageVector = Icons.Filled.Settings, // TODO: set a better icon
              contentDescription = null
            )
          }
          SavedItemContextMenu(
            isExpanded = isMenuExpanded,
            isArchived = webReaderParams!!.item.isArchived,
            onDismiss = { isMenuExpanded = false },
            actionHandler = { webReaderViewModel.handleSavedItemAction(webReaderParams!!.item.savedItemId, it) }
          )
        }
      )

      if (showWebPreferencesDialog) {
        WebPreferencesDialog(
          onDismiss = {
            showWebPreferencesDialog = false
          },
          webReaderViewModel = webReaderViewModel
        )
      }

      if (annotation != null) {
        AnnotationEditView(
          initialAnnotation = annotation!!,
          onSave = {
            webReaderViewModel.saveAnnotation(it)
          },
          onCancel = {
            webReaderViewModel.cancelAnnotationEdit()
          }
        )
      }
    }

    LaunchedEffect(shouldPopView) {
      if (shouldPopView) {
        onBackPressedDispatcher?.onBackPressed()
      }
    }
  } else {
    // TODO: add a proper loading view
    Text("Loading...")
  }
}
