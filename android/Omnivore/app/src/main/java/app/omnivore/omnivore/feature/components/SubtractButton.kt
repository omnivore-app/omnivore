package app.omnivore.omnivore.feature.components

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonColors
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier

/**
 * A minus-shaped button that can be used to represent a "subtract" or "remove" action.
 * Just a simple wrapper over IconButton with the Remove icon.
 *
 * @param onClick Called when the button is clicked.
 * @param modifier The modifier to apply to the button.
 * @param enabled Whether the button is enabled.
 * @param colors The colors to use for the button.
 * @param interactionSource The [MutableInteractionSource] that backs this button.
 */
@Composable
fun SubtractButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    colors: IconButtonColors = IconButtonDefaults.iconButtonColors(),
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() },
) {
    IconButton(
        onClick,
        modifier,
        enabled,
        colors,
        interactionSource
    ) {
        Icon(
            imageVector = Icons.Default.Remove,
            contentDescription = "Subtract",
            tint = if (enabled) colors.disabledContentColor else colors.disabledContentColor
        )
    }
}
