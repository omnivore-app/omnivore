package app.omnivore.omnivore.core.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp

@Composable
fun LinkIcon(
    label: String,
    icon: ImageVector,
    url: String,
    modifier: Modifier = Modifier,
) {
    val uriHandler = LocalUriHandler.current
    IconButton(
        modifier = modifier.padding(4.dp),
        onClick = { uriHandler.openUri(url) },
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.onSurface
        )
    }
}
