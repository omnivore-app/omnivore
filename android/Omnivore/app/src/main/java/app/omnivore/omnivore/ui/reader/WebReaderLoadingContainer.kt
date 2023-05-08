package app.omnivore.omnivore.ui.reader

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.LocalOnBackPressedDispatcherOwner
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.*
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import app.omnivore.omnivore.MainActivity
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.components.WebReaderLabelsSelectionSheet
import app.omnivore.omnivore.ui.notebook.NotebookActivity
import app.omnivore.omnivore.ui.savedItemViews.SavedItemContextMenu
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import kotlin.math.roundToInt


@AndroidEntryPoint
class WebReaderLoadingContainerActivity: ComponentActivity() {
  val viewModel: WebReaderViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val requestID = intent.getStringExtra("SAVED_ITEM_REQUEST_ID")
    val slug = intent.getStringExtra("SAVED_ITEM_SLUG")

    setContent {
      val systemUiController = rememberSystemUiController()
      val useDarkIcons = !isSystemInDarkTheme()

      DisposableEffect(systemUiController, useDarkIcons) {
        systemUiController.setSystemBarsColor(
          color = Color.Black,
          darkIcons = false
        )

        onDispose {}
      }

      OmnivoreTheme {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(color = Color.Black)
        ) {
          if (viewModel.hasFetchError.value == true) {
            Text("We were unable to fetch your content.")
          } else {
            WebReaderLoadingContainer(
              requestID = requestID,
              slug = slug,
              onLibraryIconTap = if (requestID != null) { { startMainActivity() } } else null,
              webReaderViewModel = viewModel,
            )
          }
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

  private fun startMainActivity() {
    val intent = Intent(this, MainActivity::class.java)
    this.startActivity(intent)
  }
}

@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class)
@Composable
fun WebReaderLoadingContainer(slug: String? = null, requestID: String? = null, onLibraryIconTap: (() -> Unit)? = null, webReaderViewModel: WebReaderViewModel) {
  val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher

  var isMenuExpanded by remember { mutableStateOf(false) }
  var showWebPreferencesDialog by remember { mutableStateOf(false ) }

  val currentThemeKey = webReaderViewModel.currentThemeKey.observeAsState()
  val currentTheme = Themes.values().find { it.themeKey == currentThemeKey.value }

  val webReaderParams: WebReaderParams? by webReaderViewModel.webReaderParamsLiveData.observeAsState(null)
  val annotation: String? by webReaderViewModel.annotationLiveData.observeAsState(null)
  val shouldPopView: Boolean by webReaderViewModel.shouldPopViewLiveData.observeAsState(false)
  val toolbarHeightPx: Float by webReaderViewModel.currentToolbarHeightLiveData.observeAsState(0.0f)

  val maxToolbarHeight = 48.dp
  webReaderViewModel.maxToolbarHeightPx = with(LocalDensity.current) { maxToolbarHeight.roundToPx().toFloat() }
  webReaderViewModel.loadItem(slug = slug, requestID = requestID)

  val context = LocalContext.current
  val coroutineScope = rememberCoroutineScope()

  val styledContent = webReaderParams?.let {
    val webReaderContent = WebReaderContent(
      preferences = webReaderViewModel.storedWebPreferences(isSystemInDarkTheme()),
      item = it.item,
      articleContent = it.articleContent,
    )
    webReaderContent.styledContent()
  } ?: null

  val modalBottomSheetState = rememberModalBottomSheetState(
    ModalBottomSheetValue.Hidden,
  )

  val themeTintColor = Color(currentTheme?.foregroundColor ?: 0xFFFFFFFF)

  ModalBottomSheetLayout(
    modifier = Modifier.statusBarsPadding(),
    sheetBackgroundColor = Color.Transparent,
    sheetState = modalBottomSheetState,
    sheetContent = {
      if (showWebPreferencesDialog) {
        BottomSheetUI("Reader Preferences") {
          ReaderPreferencesView(webReaderViewModel)
        }
      }
      Spacer(modifier = Modifier.weight(1.0F))
    }
  ) {
    Scaffold(
      topBar = {
         TopAppBar(
          modifier = Modifier
            .height(height = with(LocalDensity.current) {
              toolbarHeightPx.roundToInt().toDp()
            }),
          backgroundColor = Color(currentTheme?.backgroundColor ?: 0xFFFFFFFF),
           elevation = 0.dp,
          title = {},
          navigationIcon = {
            IconButton(onClick = {
              onBackPressedDispatcher?.onBackPressed()
            }) {
              Icon(
                imageVector = Icons.Filled.ArrowBack,
                modifier = Modifier,
                contentDescription = "Back",
                tint = themeTintColor
              )
            }
          },
          actions = {
            if (onLibraryIconTap != null) {
              IconButton(onClick = { onLibraryIconTap() }) {
                Icon(
                  imageVector = Icons.Default.Home,
                  contentDescription = null,
                  tint = themeTintColor,
                )
              }
            }
            webReaderParams?.let {
              IconButton(onClick = {
                val intent = Intent(context, NotebookActivity::class.java)
                intent.putExtra("SAVED_ITEM_ID", it.item.savedItemId)
                context.startActivity(intent)
              }) {
                Icon(
                  painter = painterResource(id = R.drawable.notebook),
                  contentDescription = null,
                  tint = themeTintColor
                )
              }
            }
            IconButton(onClick = {
              showWebPreferencesDialog = true
              coroutineScope.launch {
                modalBottomSheetState.show()
              }
            }) {
              Icon(
                painter = painterResource(id = R.drawable.format_letter_case),
                contentDescription = null,
                tint = themeTintColor
              )
            }
            IconButton(onClick = { isMenuExpanded = true }) {
              Icon(
                painter = painterResource(id = R.drawable.dots_horizontal),
                contentDescription = null,
                tint = themeTintColor
              )
              if (isMenuExpanded) {
                webReaderParams?.let { params ->
                  SavedItemContextMenu(
                    isExpanded = isMenuExpanded,
                    isArchived = webReaderParams!!.item.isArchived,
                    onDismiss = { isMenuExpanded = false },
                    actionHandler = {
                      webReaderViewModel.handleSavedItemAction(
                        params.item.savedItemId,
                        it
                      )
                    }
                  )
                }
              }
            }
          },
        )
      }
    ) { paddingValues ->
          if (styledContent != null) {
            WebReader(
              preferences = webReaderViewModel.storedWebPreferences(isSystemInDarkTheme()),
              styledContent = styledContent,
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

          WebReaderLabelsSelectionSheet(webReaderViewModel)
        }

      LaunchedEffect(shouldPopView) {
        if (shouldPopView) {
          onBackPressedDispatcher?.onBackPressed()
        }
      }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun BottomSheetUI(title: String?, content: @Composable () -> Unit) {
  val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher

  Box(
    modifier = Modifier
      .wrapContentHeight()
      .fillMaxWidth()
      .clip(RoundedCornerShape(topEnd = 20.dp, topStart = 20.dp))
      .background(Color.White)
      .statusBarsPadding()
  ) {
    Scaffold(
    ) { paddingValues ->
      Box(modifier = Modifier
        .padding(paddingValues)
        .fillMaxSize()) {
        content()
      }
    }
  }
}
