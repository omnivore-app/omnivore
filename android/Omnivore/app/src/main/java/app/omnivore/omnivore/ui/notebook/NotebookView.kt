package app.omnivore.omnivore.ui.notebook

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.ContextMenu
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.LocalOnBackPressedDispatcherOwner
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.scrollable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.LocalContentColor
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.MainActivity
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.components.WebReaderLabelsSelectionSheet
import app.omnivore.omnivore.ui.savedItemViews.SavedItemContextMenu
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import dagger.hilt.android.AndroidEntryPoint
import kotlin.math.roundToInt
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.components.LabelChipColors
import app.omnivore.omnivore.ui.library.SavedItemFilter
import app.omnivore.omnivore.ui.library.SearchField
import app.omnivore.omnivore.ui.library.SearchViewContent
import app.omnivore.omnivore.ui.library.TypeaheadSearchViewContent
import app.omnivore.omnivore.ui.reader.WebReaderViewModel
import app.omnivore.omnivore.ui.theme.md_theme_dark_outline
import dev.jeziellago.compose.markdowntext.MarkdownText


@AndroidEntryPoint
class NotebookActivity: ComponentActivity() {
    val viewModel: NotebookViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val savedItemId = intent.getStringExtra("SAVED_ITEM_ID")

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
                        // .background(color = Color.Black)
                ) {
                    savedItemId?.let {
                        NotebookView(
                            savedItemId = savedItemId,
                            viewModel = viewModel
                        )
                    }
                }
                }
            }
        }

//        // animate the view up when keyboard appears
//        WindowCompat.setDecorFitsSystemWindows(window, false)
//        val rootView = findViewById<View>(android.R.id.content).rootView
//        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
//            val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
//            rootView.setPadding(0, 0, 0, imeHeight)
//            insets
//        }
//    }

    private fun startMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        this.startActivity(intent)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotebookView(savedItemId: String, viewModel: NotebookViewModel) {
    val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher
    val savedItem = viewModel.getLibraryItemById(savedItemId).observeAsState()
    val scrollState = rememberScrollState()

    OmnivoreTheme() {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("") },
                    modifier = Modifier.statusBarsPadding(),
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background
                    ),
                    navigationIcon = {
                        IconButton(onClick = {
                            onBackPressedDispatcher?.onBackPressed()
                        }) {
                            Icon(
                                imageVector = androidx.compose.material.icons.Icons.Filled.ArrowBack,
                                modifier = Modifier,
                                contentDescription = "Back"
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = null
                            )
                        }
                    }
                )
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .padding(paddingValues)
                    .verticalScroll(scrollState)
                    .fillMaxSize()
            ) {
                savedItem.value?.let {
                    ArticleNotes(it)
                    HighlightsList(it)
                }
                Spacer(Modifier.weight(1f))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleNotes(item: SavedItemWithLabelsAndHighlights) {
    val notes = item.highlights?.filter { it.type == "NOTE" } ?: listOf()
    val listState = rememberLazyListState()

    Column(modifier = Modifier
        .fillMaxWidth()
        .padding(start = 15.dp)
//        .padding(top = 40.dp)
    ) {
        Text("Article Notes")
        Divider(modifier = Modifier.padding(bottom= 15.dp))
    notes.forEach { note ->
        MarkdownText(
            // modifier = Modifier.padding(paddingValues),
            markdown = note.annotation ?: "",
            fontSize = 12.sp,
            style = TextStyle(lineHeight = 18.sp),
            color = MaterialTheme.colorScheme.onPrimaryContainer,
        )
    }
    if (notes.isEmpty()) {
        Surface(
            modifier = Modifier
                .padding(0.dp, end = 15.dp)
                .fillMaxWidth(),
            shape = androidx.compose.material.MaterialTheme.shapes.medium,
            color = MaterialTheme.colorScheme.surfaceVariant
        ) {
            Text(
                text = "Add Notes...",
                style = androidx.compose.material.MaterialTheme.typography.subtitle2,
                modifier = Modifier.padding(vertical = 10.dp, horizontal = 10.dp)
            )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HighlightsList(item: SavedItemWithLabelsAndHighlights) {
    val highlights = item.highlights?.filter { it.type == "HIGHLIGHT" } ?: listOf()
    val yellowColor = colorResource(R.color.cta_yellow)

    Column(modifier = Modifier
        .fillMaxWidth()
        .padding(start = 15.dp)
        .padding(top = 40.dp, bottom = 100.dp)
    ) {
        Text("Highlights")
        Divider(modifier = Modifier.padding(bottom= 10.dp))
        highlights.forEach { highlight ->
                var isMenuOpen by remember { mutableStateOf(false) }

                Row(modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.End)
                    .padding(0.dp)
                ) {
                    Spacer(Modifier.weight(1f))
                    IconButton(onClick = { isMenuOpen = true }) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = null
                        )
                    }
//                    DropdownMenu(
//                        expanded = isMenuOpen,
//                        onDismissRequest = { isMenuOpen = false }
//                    ) {
//                        DropdownMenuItem(
//                            text = { Text("Copy") },
//                            onClick = {
//                                // actionHandler(it)
//                                // onDismiss()
//                            }
//                        )
//                    }
                }

                highlight.quote?.let {
                    Row(modifier = Modifier
                        .padding(start = 2.dp, end = 15.dp)
                        .fillMaxWidth()
                        .drawWithCache {
                            onDrawWithContent {
                                // draw behind the content the vertical line on the left
                                drawLine(
                                    color = yellowColor,
                                    start = Offset.Zero,
                                    end = Offset(0f, this.size.height),
                                    strokeWidth = 10f
                                )

                                // draw the content
                                drawContent()
                            }
                        }) {

                        MarkdownText(
                            modifier = Modifier
                                .padding(start = 15.dp, end = 15.dp),
                            markdown = it,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,

                        )
                    }
                }
                highlight.annotation?.let {
                    MarkdownText(
                        // modifier = Modifier.padding(paddingValues),
                        markdown = it,
                        fontSize = 14.sp,
                        style = TextStyle(lineHeight = 18.sp),
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        )
                } ?: run {
                    Surface(
                        modifier = Modifier
                            .padding(0.dp, end = 15.dp, top = 15.dp, bottom = 30.dp)
                            .fillMaxWidth(),
                        shape = androidx.compose.material.MaterialTheme.shapes.medium,
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Row {
                            Text(
                                text = "Add Notes...",
                                style = androidx.compose.material.MaterialTheme.typography.subtitle2,
                                modifier = Modifier.padding(vertical = 10.dp, horizontal = 10.dp)
                            )
                        }
                    }
                }
        }
        if (highlights.isEmpty()) {
            Text(
                text = "You have not added any highlights to this page.",
                style = androidx.compose.material.MaterialTheme.typography.subtitle2,
                modifier = Modifier.padding(vertical = 10.dp, horizontal = 10.dp)
            )
        }
    }
}
