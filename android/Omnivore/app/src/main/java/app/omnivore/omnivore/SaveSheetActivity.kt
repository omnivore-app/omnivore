package app.omnivore.omnivore

import android.content.ContentValues
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment.Companion.TopCenter
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch


@AndroidEntryPoint
@OptIn(ExperimentalMaterialApi::class)
abstract class SaveSheetActivity: AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val viewModel: SaveViewModel by viewModels()
        var extractedText: String? = null
        val authToken = viewModel.getAuthToken()

        when (intent?.action) {
            Intent.ACTION_SEND -> {
                if (intent.type?.startsWith("text/plain") == true) {
                    intent.getStringExtra(Intent.EXTRA_TEXT)?.let {
                        Log.d(ContentValues.TAG, "Extracted text: $extractedText")
                        extractedText = it
                        viewModel.saveURL(it)
                    }
                }

                if (intent.type?.startsWith("text/html") == true) {
                    intent.getStringExtra(Intent.EXTRA_HTML_TEXT)?.let {
                        extractedText = it
                    }
                }
            }
            else -> {
                // Handle other intents, such as being started from the home screen
            }
        }

        setContent {
            val coroutineScope = rememberCoroutineScope()
            val modalBottomSheetState = rememberModalBottomSheetState(ModalBottomSheetValue.Hidden)
            val isSheetOpened = remember { mutableStateOf(false) }

            ModalBottomSheetLayout(
                sheetBackgroundColor = Color.Transparent,
                sheetState = modalBottomSheetState,
                sheetContent = {
                    BottomSheetUI(coroutineScope, modalBottomSheetState) {
                        ScreenContent(extractedText, coroutineScope, modalBottomSheetState) {
                            onFinish(coroutineScope, modalBottomSheetState)
                        }
                    }
                }
            ) {}

            BackHandler {
                onFinish(coroutineScope, modalBottomSheetState)
            }

            // Take action based on hidden state
            LaunchedEffect(modalBottomSheetState.currentValue) {
                when (modalBottomSheetState.currentValue) {
                    ModalBottomSheetValue.Hidden -> {
                        handleBottomSheetAtHiddenState(
                            isSheetOpened,
                            modalBottomSheetState
                        )
                    }
                    else -> {
                        Log.i(TAG, "Bottom sheet ${modalBottomSheetState.currentValue} state")
                    }
                }
            }
        }
    }

    @Composable
    private fun BottomSheetUI(
        coroutineScope: CoroutineScope,
        modalBottomSheetState: ModalBottomSheetState,
        content: @Composable () -> Unit
    ) {
        Box(
            modifier = Modifier
                .wrapContentHeight()
                .fillMaxWidth()
                .clip(RoundedCornerShape(topEnd = 20.dp, topStart = 20.dp))
                .background(Color.White)
                .statusBarsPadding()
        ) {
            content()

            Divider(
                color = Color.Gray,
                thickness = 5.dp,
                modifier = Modifier
                    .padding(top = 15.dp)
                    .align(TopCenter)
                    .width(80.dp)
                    .clip(RoundedCornerShape(50.dp))
            )
        }
    }

    // Helper methods
    private suspend fun handleBottomSheetAtHiddenState(
        isSheetOpened: MutableState<Boolean>,
        modalBottomSheetState: ModalBottomSheetState
    ) {
        when {
            !isSheetOpened.value -> initializeModalLayout(isSheetOpened, modalBottomSheetState)
            else -> exit()
        }
    }

    private suspend fun initializeModalLayout(
        isSheetOpened: MutableState<Boolean>,
        modalBottomSheetState: ModalBottomSheetState
    ) {
        isSheetOpened.value = true
        modalBottomSheetState.show()
    }

    open fun exit() = finish()

    private fun onFinish(
        coroutineScope: CoroutineScope,
        modalBottomSheetState: ModalBottomSheetState,
        withResults: Boolean = false,
        result: Intent? = null
    ) {
        coroutineScope.launch {
            if (withResults) setResult(RESULT_OK)
            result?.let { intent = it}
            modalBottomSheetState.hide() // will trigger the LaunchedEffect
        }
    }

    @Composable
    fun ScreenContent(
        extractedText: String?,
        coroutineScope: CoroutineScope,
        modalBottomSheetState: ModalBottomSheetState,
        onExit: () -> Unit?
    ) {
        Box(modifier = Modifier.height(300.dp).background(Color.White)) {
            SaveContent(extractedText, modalBottomSheetState, modifier = Modifier.fillMaxSize())
        }
    }

    override fun onPause() {
        super.onPause()
        overridePendingTransition(0, 0)
    }

    companion object {
        private val TAG = SaveSheetActivity::class.java.simpleName
    }
}
