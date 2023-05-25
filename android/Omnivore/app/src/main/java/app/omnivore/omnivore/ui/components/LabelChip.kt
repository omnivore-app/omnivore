import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.ui.components.LabelChipColors

@Composable
fun LabelChip(
    name: String,
    colors: LabelChipColors,
    modifier: Modifier = Modifier.padding(0.dp),
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
