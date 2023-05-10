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
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import app.omnivore.omnivore.MainActivity
import app.omnivore.omnivore.R
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.components.LabelsSelectionSheetContent
import app.omnivore.omnivore.ui.notebook.NotebookView
import app.omnivore.omnivore.ui.notebook.NotebookViewModel
import app.omnivore.omnivore.ui.savedItemViews.SavedItemContextMenu
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import kotlin.math.roundToInt


@AndroidEntryPoint
class WebReaderLoadingContainerActivity: ComponentActivity() {
  val viewModel: WebReaderViewModel by viewModels()
  val notebookViewModel: NotebookViewModel by viewModels()

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
              notebookViewModel = notebookViewModel,
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

enum class BottomSheetState(
) {
  NONE(),
  PREFERENCES(),
  NOTEBOOK(),
  HIGHLIGHTNOTE(),
  LABELS(),
}


@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class)
@Composable
fun WebReaderLoadingContainer(slug: String? = null, requestID: String? = null,
                              onLibraryIconTap: (() -> Unit)? = null,
                              webReaderViewModel: WebReaderViewModel,
                              notebookViewModel: NotebookViewModel) {
  val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher

  var isMenuExpanded by remember { mutableStateOf(false) }
  val bottomSheetState: BottomSheetState? by webReaderViewModel.bottomSheetStateLiveData.observeAsState(BottomSheetState.NONE)

  val isDarkMode = isSystemInDarkTheme()
  val currentThemeKey = webReaderViewModel.currentThemeKey.observeAsState()
  val currentTheme = Themes.values().find { it.themeKey == currentThemeKey.value }

  val webReaderParams: WebReaderParams? by webReaderViewModel.webReaderParamsLiveData.observeAsState(null)
  val annotation: String? by webReaderViewModel.annotationLiveData.observeAsState(null)
  val shouldPopView: Boolean by webReaderViewModel.shouldPopViewLiveData.observeAsState(false)
  val toolbarHeightPx: Float by webReaderViewModel.currentToolbarHeightLiveData.observeAsState(0.0f)

  val labels: List<SavedItemLabel> by webReaderViewModel.savedItemLabelsLiveData.observeAsState(listOf())

  val maxToolbarHeight = 48.dp
  webReaderViewModel.maxToolbarHeightPx = with(LocalDensity.current) { maxToolbarHeight.roundToPx().toFloat() }
  webReaderViewModel.loadItem(slug = slug, requestID = requestID)

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
    initialValue = ModalBottomSheetValue.Hidden,
  )

  val themeBackgroundColor = currentTheme?.let {
    if (it.themeKey == "System" && isDarkMode) {
      Color(0xFF000000)
    } else if (it.themeKey == "System" ) {
      Color(0xFFFFFFFF)
    } else {
      Color(it.backgroundColor ?: 0xFFFFFFFF)
    }
  } ?: Color(0xFFFFFFFF)
  val themeTintColor = currentTheme?.let {
    if (it.themeKey == "System" && isDarkMode) {
      Color(0xFFFFFFFF)
    } else if (it.themeKey == "System" ) {
      Color(0xFF000000)
    } else {
      Color(it.foregroundColor ?: 0xFF000000)
    }
  } ?: Color(0xFF000000)

  ModalBottomSheetLayout(
    modifier = Modifier
      .statusBarsPadding(),
    sheetBackgroundColor = Color.Transparent,
    sheetState = modalBottomSheetState,
    sheetContent = {
      when (bottomSheetState) {
        BottomSheetState.PREFERENCES -> {
          BottomSheetUI("Reader Preferences") {
            ReaderPreferencesView(webReaderViewModel)
          }
        }
        BottomSheetState.NOTEBOOK -> {
          webReaderParams?.let { params ->
            BottomSheetUI(title = "Notebook") {
              NotebookView(savedItemId = params.item.savedItemId, viewModel = notebookViewModel)
            }
          }
        }
        BottomSheetState.HIGHLIGHTNOTE -> {
          annotation?.let { annotation ->
            BottomSheetUI(title = "Note") {
              AnnotationEditView(
                initialAnnotation = annotation,
                onSave = {
                  webReaderViewModel.saveAnnotation(it)
                  coroutineScope.launch {
                    modalBottomSheetState.hide()
                    webReaderViewModel.resetBottomSheet()
                  }
                },
                onCancel = {
                  webReaderViewModel.cancelAnnotationEdit()
                  coroutineScope.launch {
                    modalBottomSheetState.hide()
                    webReaderViewModel.resetBottomSheet()
                  }
                }
              )
            }
          }
        }
        app.omnivore.omnivore.ui.reader.BottomSheetState.LABELS -> {
          BottomSheetUI(title = "Notebook") {
            LabelsSelectionSheetContent(
              labels = labels,
              initialSelectedLabels = webReaderParams?.labels ?: listOf(),
              onCancel = {
                coroutineScope.launch {
                  modalBottomSheetState.hide()
                  webReaderViewModel.resetBottomSheet()
                }
              },
              isLibraryMode = false,
              onSave = {
                if (it != labels) {
                  webReaderViewModel.updateSavedItemLabels(
                    savedItemID = webReaderParams?.item?.savedItemId ?: "", labels = it
                  )
                }
                coroutineScope.launch {
                  modalBottomSheetState.hide()
                  webReaderViewModel.resetBottomSheet()
                }
              },
              onCreateLabel = { newLabelName, labelHexValue ->
                webReaderViewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
              }
            )
          }
        }
        BottomSheetState.NONE -> {

        }
        else -> {

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
          backgroundColor = themeBackgroundColor,
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
                coroutineScope.launch {
                  webReaderViewModel.setBottomSheet(BottomSheetState.NOTEBOOK)
                  modalBottomSheetState.animateTo(ModalBottomSheetValue.Expanded)
                }
              }) {
                Icon(
                  painter = painterResource(id = R.drawable.notebook),
                  contentDescription = null,
                  tint = themeTintColor
                )
              }
            }
            IconButton(onClick = {
              coroutineScope.launch {
                webReaderViewModel.setBottomSheet(BottomSheetState.PREFERENCES)
                modalBottomSheetState.animateTo(ModalBottomSheetValue.HalfExpanded)
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
                      isArchived = params.item.isArchived,
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
              styledContent = styledContent,
              webReaderViewModel = webReaderViewModel
            )
          }
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
        .fillMaxSize()) {
        content()
      }
    }
  }
}
