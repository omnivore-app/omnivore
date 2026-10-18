package app.omnivore.omnivore.feature.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LabelChip(
    modifier: Modifier = Modifier,
    name: String,
    colors: LabelChipColors,
) {
    Surface(
        modifier = modifier.padding(2.dp),
        shape = MaterialTheme.shapes.medium,
        color = colors.containerColor
    ) {
        Row(modifier = Modifier
        ) {
            Text(
                text = name,
                color = colors.textColor,
                style = MaterialTheme.typography.subtitle2,
                modifier = Modifier.padding(vertical = 3.dp, horizontal = 5.dp)
            )
        }
    }
}
