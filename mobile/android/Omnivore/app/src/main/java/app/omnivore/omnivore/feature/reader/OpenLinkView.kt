package app.omnivore.omnivore.feature.reader

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.omnivore.omnivore.R

@Composable
fun OpenLinkView(webReaderViewModel: WebReaderViewModel) {
    val context = LocalContext.current
    val isDarkMode = isSystemInDarkTheme()

    Column(modifier = Modifier
        .padding(top = 25.dp)
        .padding(horizontal = 50.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        Row {
            Text(webReaderViewModel.currentLink.toString(),
                fontWeight = FontWeight.Light,
                color = if (isDarkMode) Color.White else Color.DarkGray,
                fontSize = 13.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                )
        }
        Row(modifier = Modifier.padding(top = 25.dp)) {
            Button(onClick = { webReaderViewModel.openCurrentLink(context) }, modifier = Modifier.fillMaxWidth()) {
                Text(text = stringResource(R.string.open_link_view_action_open_in_browser))
            }
        }
        Row {
            Button(onClick = { webReaderViewModel.saveCurrentLink(context) }, modifier = Modifier.fillMaxWidth()) {
                Text(text = stringResource(R.string.open_link_view_action_save_to_omnivore))

            }
        }
        Row {
            Button(onClick = {webReaderViewModel.copyCurrentLink(context) }, modifier = Modifier.fillMaxWidth()) {
                Text(text = stringResource(R.string.open_link_view_action_copy_link))
            }
        }
        Row {
            Button(onClick = {webReaderViewModel.resetBottomSheet() }, modifier = Modifier.fillMaxWidth()) {
                Text(text = stringResource(R.string.open_link_view_action_cancel))
            }
        }
    }
}
