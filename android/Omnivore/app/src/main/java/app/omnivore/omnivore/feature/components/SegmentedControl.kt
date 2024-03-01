package app.omnivore.omnivore.feature.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedButton
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex

// https://gist.githubusercontent.com/manojbhadane/afe14d552a520bca83f80eef22dacade/raw/1427fc4d0e3ccbc30484976fc1c1424c2fa613f3/jc-sc-1.kt

@Composable
fun SegmentedControl(
  items: List<String>,
  initialSelectedItemIndex: Int,
  cornerRadius : Int = 10,
  onItemSelection: (selectedItemIndex: Int) -> Unit
) {
  val selectedIndex = remember { mutableStateOf(initialSelectedItemIndex) }

  Row(
    modifier = Modifier
  ) {
    items.forEachIndexed { index, item ->
      OutlinedButton(
        modifier = Modifier
          .wrapContentSize()
          .offset((-1 * index).dp, 0.dp)
          .zIndex(if (selectedIndex.value == index) 1f else 0f),
        onClick = {
          selectedIndex.value = index
          onItemSelection(selectedIndex.value)
        },
        shape = when (index) {
          /**
           * left outer button
           */
          0 -> RoundedCornerShape(
            topStartPercent = cornerRadius,
            topEndPercent = 0,
            bottomStartPercent = cornerRadius,
            bottomEndPercent = 0
          )
          /**
           * right outer button
           */
          items.size - 1 -> RoundedCornerShape(
            topStartPercent = 0,
            topEndPercent = cornerRadius,
            bottomStartPercent = 0,
            bottomEndPercent = cornerRadius
          )
          /**
           * middle button
           */
          else -> RoundedCornerShape(
            topStartPercent = 0,
            topEndPercent = 0,
            bottomStartPercent = 0,
            bottomEndPercent = 0
          )
        },
        border = BorderStroke(
          1.dp, if (selectedIndex.value == index) {
            MaterialTheme.colors.secondary.copy(alpha = 0.75f)
          } else {
            MaterialTheme.colors.secondary
          }
        ),
        colors = if (selectedIndex.value == index) {
          ButtonDefaults.outlinedButtonColors(
            backgroundColor = MaterialTheme.colors.secondary
          )
        } else {
          ButtonDefaults.outlinedButtonColors(backgroundColor = MaterialTheme.colors.background)
        },
      ) {
        Text(
          text = item,
          fontWeight = FontWeight.Normal,
          color = if (selectedIndex.value == index) {
            MaterialTheme.colors.onSecondary
          } else {
            MaterialTheme.colors.onBackground
          },
        )
      }
    }
  }
}
