package app.omnivore.omnivore.feature.save

import android.content.ContentValues
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment.Companion.TopCenter
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.OutOfQuotaPolicy
import androidx.work.WorkInfo
import androidx.work.WorkManager
import androidx.work.workDataOf
import app.omnivore.omnivore.feature.library.LibrarySyncWorker
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.seconds
import kotlin.time.toJavaDuration

@AndroidEntryPoint
@OptIn(ExperimentalMaterialApi::class)
class SaveSheetActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        var extractedText: String? = null
        var saveState: SaveState by mutableStateOf(SaveState.DEFAULT)
        val workManager = WorkManager.getInstance(applicationContext)

        when (intent?.action) {
            Intent.ACTION_SEND -> {
                if (intent.type?.startsWith("text/plain") == true) {
                    intent.getStringExtra(Intent.EXTRA_TEXT)?.let {
                        extractedText = it
                        workManager.enqueueSaveWorker(it)
                        Log.d(ContentValues.TAG, "Extracted text: $extractedText")
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
            LaunchedEffect(extractedText) {
                extractedText?.let { url ->
                    workManager.getWorkInfosByTagFlow(url).map {
                        saveState = when (it.firstOrNull()?.state) {
                            WorkInfo.State.RUNNING -> SaveState.SAVING
                            WorkInfo.State.SUCCEEDED -> SaveState.SAVED
                            WorkInfo.State.FAILED -> SaveState.ERROR
                            else -> SaveState.SAVING
                        }
                    }.collect()
                }
            }

            val scaffoldState: ScaffoldState = rememberScaffoldState()


            val message = when (saveState) {
                SaveState.DEFAULT -> ""
                SaveState.SAVING -> "Saved to Omnivore"
                SaveState.ERROR -> "Error Saving Article"
                SaveState.SAVED -> "Saved to Omnivore"
            }

            Scaffold(
                modifier = Modifier.clickable {
                    Log.d("debug", "DISMISS SCAFFOLD")
                    exit()
                },
                scaffoldState = scaffoldState,
                backgroundColor = Color.Transparent,

                // TODO: In future versions we can present Label, Note, Highlight options here
                bottomBar = {

                    androidx.compose.material3.BottomAppBar(

                        modifier = Modifier
                            .height(55.dp)
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(topEnd = 5.dp, topStart = 5.dp)),
                        containerColor = MaterialTheme.colors.background,
                        actions = {
                            Spacer(modifier = Modifier.width(25.dp))
                            Text(
                                message,
                                style = androidx.compose.material3.MaterialTheme.typography.titleMedium
                            )
                        },
                    )
                },
            ) {

            }

            LaunchedEffect(saveState) {
                if (saveState == SaveState.SAVED) {
                    delay(1.5.seconds)
                    exit()
                }
            }
        }
    }

    private fun WorkManager.enqueueSaveWorker(url: String) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val saveWorkerRequest = OneTimeWorkRequestBuilder<SaveURLWorker>()
            .setConstraints(constraints)
            .setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
            .setInputData(workDataOf("url" to url))
            .addTag(url)
            // Can add other configs like setBackoffCriteria to retry sync if failed
            .build()
        val syncWorkerRequest = OneTimeWorkRequestBuilder<LibrarySyncWorker>()
            .setConstraints(constraints)
            .addTag(url)
            .setInitialDelay(5.seconds.toJavaDuration())
            .build()

        beginWith(saveWorkerRequest)
            .then(syncWorkerRequest)
            .enqueue()
    }

    @Composable
    private fun BottomSheetUI(content: @Composable () -> Unit) {
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
            result?.let { intent = it }
            modalBottomSheetState.hide() // will trigger the LaunchedEffect
        }
    }

    @Composable
    fun ScreenContent(
        viewModel: SaveViewModel,
        modalBottomSheetState: ModalBottomSheetState
    ) {
        Box(
            modifier = Modifier
                .height(300.dp)
                .background(Color.White)
        ) {
            SaveContent(viewModel, modalBottomSheetState, modifier = Modifier.fillMaxSize())
        }
    }

    override fun onPause() {
        super.onPause()
        overridePendingTransition(0, 0)
    }
}
