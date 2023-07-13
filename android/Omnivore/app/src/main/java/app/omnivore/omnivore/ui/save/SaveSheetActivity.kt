package app.omnivore.omnivore.ui.save

import android.content.ContentValues
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.TextView.SavedState
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.rounded.AddCircle
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.BottomAppBarDefaults
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment.Companion.TopCenter
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.library.SavedItemAction
import app.omnivore.omnivore.ui.reader.WebReaderLoadingContainerActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.seconds

// Not sure why we need this class, but directly opening SaveSheetActivity
// causes the app to crash.
class SaveSheetActivity : SaveSheetActivityBase() {}

@AndroidEntryPoint
@OptIn(ExperimentalMaterialApi::class)
abstract class SaveSheetActivityBase : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val viewModel: SaveViewModel by viewModels()
    var extractedText: String? = null

    when (intent?.action) {
      Intent.ACTION_SEND -> {
        if (intent.type?.startsWith("text/plain") == true) {
          intent.getStringExtra(Intent.EXTRA_TEXT)?.let {
            extractedText = it
            viewModel.saveURL(it)
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
      val saveState: SaveState by viewModel.saveState.observeAsState(SaveState.NONE)
      val scaffoldState: ScaffoldState = rememberScaffoldState()


      val message = when (saveState) {
        SaveState.NONE -> ""
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

  companion object {
    private val TAG = SaveSheetActivity::class.java.simpleName
  }
}
