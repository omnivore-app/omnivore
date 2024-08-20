package app.omnivore.omnivore.feature.reader

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.LocalOnBackPressedDispatcherOwner
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.ModalBottomSheetLayout
import androidx.compose.material.ModalBottomSheetValue
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.rememberModalBottomSheetState
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.omnivore.omnivore.MainActivity
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.feature.components.LabelsSelectionSheetContent
import app.omnivore.omnivore.feature.components.LabelsViewModel
import app.omnivore.omnivore.feature.editinfo.EditInfoSheetContent
import app.omnivore.omnivore.feature.editinfo.EditInfoViewModel
import app.omnivore.omnivore.feature.notebook.EditNoteModal
import app.omnivore.omnivore.feature.notebook.NotebookView
import app.omnivore.omnivore.feature.notebook.NotebookViewModel
import app.omnivore.omnivore.feature.savedItemViews.SavedItemContextMenu
import app.omnivore.omnivore.feature.theme.OmnivoreTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlin.math.roundToInt

@AndroidEntryPoint
class WebReaderLoadingContainerActivity : ComponentActivity() {
    val viewModel: WebReaderViewModel by viewModels()
    private val notebookViewModel: NotebookViewModel by viewModels()
    private val labelsViewModel: LabelsViewModel by viewModels()
    private val editInfoViewModel: EditInfoViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val requestID = intent.getStringExtra("SAVED_ITEM_REQUEST_ID")
        val slug = intent.getStringExtra("SAVED_ITEM_SLUG")

        viewModel.loadItem(slug = slug, requestID = requestID)

        enableEdgeToEdge()

        setContent {
            OmnivoreTheme {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(color = if (isSystemInDarkTheme()) Color.Black else Color.White)
                        .imePadding()
                ) {
                    val hasFetchError by viewModel.hasFetchError.collectAsStateWithLifecycle()
                    if (hasFetchError) {
                        Text(stringResource(R.string.web_reader_loading_container_error_msg))
                    } else {
                        WebReaderLoadingContainer(
                            onLibraryIconTap = if (requestID != null) {
                                { startMainActivity() }
                            } else null,
                            webReaderViewModel = viewModel,
                            notebookViewModel = notebookViewModel,
                            labelsViewModel = labelsViewModel,
                            editInfoViewModel = editInfoViewModel,
                        )
                    }
                }
            }
        }
    }

    private fun startMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        this.startActivity(intent)
    }
}

enum class BottomSheetState {
    NONE,
    PREFERENCES,
    NOTEBOOK,
    EDITNOTE,
    HIGHLIGHTNOTE,
    LABELS,
    LINK,
    EDIT_INFO,
}


@OptIn(ExperimentalMaterialApi::class)
@Composable
fun WebReaderLoadingContainer(
    onLibraryIconTap: (() -> Unit)? = null,
    webReaderViewModel: WebReaderViewModel,
    notebookViewModel: NotebookViewModel,
    labelsViewModel: LabelsViewModel,
    editInfoViewModel: EditInfoViewModel
) {
    val currentThemeKey = webReaderViewModel.currentThemeKey.collectAsStateWithLifecycle(
        "System"
    )
    val currentTheme by remember {
        derivedStateOf {
            Themes.entries.find { it.themeKey == currentThemeKey.value }
        }
    }
    val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher
    val bottomSheetState: BottomSheetState? by webReaderViewModel.bottomSheetStateFlow.collectAsState(
        BottomSheetState.NONE
    )

    val webReaderParams: WebReaderParams? by webReaderViewModel.webReaderParamsFlow.collectAsStateWithLifecycle(
        null
    )
    val shouldPopView: Boolean by webReaderViewModel.shouldPopViewFlow.collectAsStateWithLifecycle(false)

    val labels: List<SavedItemLabel> by webReaderViewModel.savedItemLabelsFlow.collectAsStateWithLifecycle(
        listOf()
    )

    val maxToolbarHeight = 48.dp
    webReaderViewModel.maxToolbarHeightPx =
        with(LocalDensity.current) { maxToolbarHeight.roundToPx().toFloat() }

    val darkTheme = isSystemInDarkTheme()

    val rtlTextState by webReaderViewModel.rtlTextState.collectAsStateWithLifecycle()

    val styledContent by remember {
        derivedStateOf {
            webReaderParams?.let {
                val webReaderContent = WebReaderContent(
                    preferences = webReaderViewModel.storedWebPreferences(darkTheme),
                    rtlText = rtlTextState,
                    item = it.item,
                    articleContent = it.articleContent
                )
                webReaderContent.styledContent()
            }
        }
    }

    val modalBottomSheetState = rememberModalBottomSheetState(
        initialValue = ModalBottomSheetValue.Hidden,
        skipHalfExpanded = bottomSheetState == BottomSheetState.EDITNOTE || bottomSheetState == BottomSheetState.HIGHLIGHTNOTE,
        confirmValueChange = {
            if (it == ModalBottomSheetValue.Hidden) {
                webReaderViewModel.resetBottomSheet()
            }
            true
        }
    )

    LaunchedEffect(bottomSheetState) {
        when (bottomSheetState) {
            BottomSheetState.PREFERENCES -> {
                if (!modalBottomSheetState.isVisible) {
                    modalBottomSheetState.show()
                }
            }

            BottomSheetState.NOTEBOOK, BottomSheetState.EDITNOTE,
            BottomSheetState.HIGHLIGHTNOTE, BottomSheetState.LABELS, BottomSheetState.EDIT_INFO,
            BottomSheetState.LINK,
            -> {
                modalBottomSheetState.show()
            }

            else -> {
                modalBottomSheetState.hide()
            }
        }
    }


    ModalBottomSheetLayout(
        modifier = Modifier
            .statusBarsPadding(),
        sheetBackgroundColor = Color.Transparent,
        sheetState = modalBottomSheetState,
        sheetContent = {
            when (bottomSheetState) {
                BottomSheetState.PREFERENCES -> {
                    BottomSheetUI {
                        ReaderPreferencesSheet(webReaderViewModel)
                    }
                }

                BottomSheetState.NOTEBOOK -> {
                    webReaderParams?.let { params ->
                        BottomSheetUI {
                            NotebookView(
                                savedItemId = params.item.savedItemId,
                                viewModel = notebookViewModel,
                                onEditNote = {
                                    notebookViewModel.highlightUnderEdit = it
                                    webReaderViewModel.setBottomSheet(BottomSheetState.EDITNOTE)
                                })
                        }
                    }
                }

                BottomSheetState.EDITNOTE -> {
                    webReaderParams?.let { params ->
                        EditNoteModal(
                            initialValue = notebookViewModel.highlightUnderEdit?.annotation,
                            onDismiss = { save, note ->
                                if (save) {
                                    notebookViewModel.highlightUnderEdit?.let { highlight ->
                                        notebookViewModel.updateHighlightNote(
                                            highlight.highlightId,
                                            note
                                        )
                                    } ?: run {
                                        if (note != null) {
                                            notebookViewModel.addArticleNote(
                                                savedItemId = params.item.savedItemId,
                                                note = note
                                            )
                                        }
                                    }
                                }
                                notebookViewModel.highlightUnderEdit = null
                                webReaderViewModel.setBottomSheet(BottomSheetState.NOTEBOOK)
                            })
                    }
                }

                BottomSheetState.HIGHLIGHTNOTE -> {
                    EditNoteModal(
                        initialValue = webReaderViewModel.annotation,
                        onDismiss = { save, note ->
                            if (save) {
                                webReaderViewModel.saveAnnotation(note ?: "")
                            } else {
                                webReaderViewModel.cancelAnnotation()
                            }
                            webReaderViewModel.annotation = null
                            webReaderViewModel.resetBottomSheet()
                        }
                    )
                }

                BottomSheetState.LABELS -> {
                    BottomSheetUI {
                        LabelsSelectionSheetContent(
                            labels = labels,
                            labelsViewModel = labelsViewModel,
                            initialSelectedLabels = webReaderParams?.labels ?: listOf(),
                            onCancel = {
                                webReaderViewModel.resetBottomSheet()
                            },
                            isLibraryMode = false,
                            onSave = {
                                if (it != labels) {
                                    webReaderViewModel.updateSavedItemLabels(
                                        savedItemID = webReaderParams?.item?.savedItemId
                                            ?: "",
                                        labels = it
                                    )
                                }
                                webReaderViewModel.resetBottomSheet()
                            },
                            onCreateLabel = { newLabelName, labelHexValue ->
                                webReaderViewModel.createNewSavedItemLabel(
                                    newLabelName,
                                    labelHexValue
                                )
                            }
                        )
                    }
                }

                BottomSheetState.EDIT_INFO -> {
                    BottomSheetUI {
                        EditInfoSheetContent(
                            savedItemId = webReaderParams?.item?.savedItemId,
                            title = webReaderParams?.item?.title,
                            author = webReaderParams?.item?.author,
                            description = webReaderParams?.item?.descriptionText,
                            viewModel = editInfoViewModel,
                            onCancel = {
                                webReaderViewModel.resetBottomSheet()
                            },
                            onUpdated = {
                                webReaderViewModel.updateItemTitle()
                                webReaderViewModel.resetBottomSheet()
                            }
                        )
                    }
                }

                BottomSheetState.LINK -> {
                    BottomSheetUI {
                        OpenLinkView(webReaderViewModel)
                    }
                }

                BottomSheetState.NONE -> {

                }

                else -> {

                }
            }
        }
    ) {
        Scaffold(
            topBar = {
                ReaderTopAppBar(webReaderViewModel, onLibraryIconTap)
            },
            modifier = Modifier.statusBarsPadding()
        ) { paddingValues ->
            styledContent?.let {
                WebReader(
                    styledContent = it,
                    webReaderViewModel = webReaderViewModel,
                    currentTheme = currentTheme,
                    modifier = Modifier.consumeWindowInsets(paddingValues)
                )
            }

            LaunchedEffect(shouldPopView) {
                if (shouldPopView) {
                    onBackPressedDispatcher?.onBackPressed()
                }
            }
        }
    }
}

@Composable
fun ReaderTopAppBar(
    webReaderViewModel: WebReaderViewModel,
    onLibraryIconTap: (() -> Unit)? = null
) {
    val context = LocalContext.current
    val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher

    val isDarkMode = isSystemInDarkTheme()
    val currentThemeKey = webReaderViewModel.currentThemeKey.collectAsStateWithLifecycle("System")
    val currentTheme by remember {
        derivedStateOf {
            Themes.entries.find { it.themeKey == currentThemeKey.value }
        }
    }
    val toolbarHeightPx: Float by webReaderViewModel.currentToolbarHeightFlow.collectAsStateWithLifecycle(
        0.0f
    )
    val webReaderParams: WebReaderParams? by webReaderViewModel.webReaderParamsFlow.collectAsStateWithLifecycle(
        null
    )
    var isMenuExpanded by remember { mutableStateOf(false) }

    val themeBackgroundColor = currentTheme?.let {
        if (it.themeKey == "System" && isDarkMode) {
            Color.Black
        } else if (it.themeKey == "System") {
            Color.White
        } else {
            Color(it.backgroundColor)
        }
    } ?: Color.White

    val themeTintColor = currentTheme?.let {
        if (it.themeKey == "System" && isDarkMode) {
            Color(0xFFFFFFFF)
        } else if (it.themeKey == "System") {
            Color(0xFF000000)
        } else {
            Color(it.foregroundColor)
        }
    } ?: Color(0xFF000000)


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
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
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
                    webReaderViewModel.setBottomSheet(BottomSheetState.NOTEBOOK)
                }) {
                    Icon(
                        painter = painterResource(id = R.drawable.notebook),
                        contentDescription = null,
                        tint = themeTintColor
                    )
                }
            }
            IconButton(onClick = {
                webReaderViewModel.setBottomSheet(BottomSheetState.PREFERENCES)
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
                            context = context,
                            isExpanded = true,
                            isArchived = params.item.isArchived,
                            onDismiss = { isMenuExpanded = false },
                            webReaderViewModel = webReaderViewModel,
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

@Composable
fun BottomSheetUI(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .wrapContentHeight()
            .fillMaxWidth()
            .clip(RoundedCornerShape(topEnd = 20.dp, topStart = 20.dp))
            .background(Color.White)
            .statusBarsPadding()
    ) {
        Scaffold { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                content()
            }
        }
    }
}
