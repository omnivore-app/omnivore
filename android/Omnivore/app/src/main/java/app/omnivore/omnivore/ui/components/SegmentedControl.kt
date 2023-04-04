package app.omnivore.omnivore.ui.components

import androidx.annotation.ColorRes
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.OutlinedButton
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex

// https://gist.githubusercontent.com/manojbhadane/afe14d552a520bca83f80eef22dacade/raw/1427fc4d0e3ccbc30484976fc1c1424c2fa613f3/jc-sc-1.kt

/**
 * items : list of items to be render
 * defaultSelectedItemIndex : to highlight item by default (Optional)
 * useFixedWidth : set true if you want to set fix width to item (Optional)
 * itemWidth : Provide item width if useFixedWidth is set to true (Optional)
 * cornerRadius : To make control as rounded (Optional)
 * color : Set color to control (Optional)
 * onItemSelection : Get selected item index
 */

@Composable
fun SegmentedControl(
  items: List<String>,
  defaultSelectedItemIndex: Int = 0,
  useFixedWidth: Boolean = false,
  itemWidth: Dp = 120.dp,
  cornerRadius : Int = 10,
  @ColorRes color : Int = com.pspdfkit.R.color.material_deep_teal_200,
  onItemSelection: (selectedItemIndex: Int) -> Unit
) {
  val selectedIndex = remember { mutableStateOf(defaultSelectedItemIndex) }

  Row(
    modifier = Modifier
  ) {
    items.forEachIndexed { index, item ->
      OutlinedButton(
        modifier = when (index) {
          0 -> {
            if (useFixedWidth) {
              Modifier
                .width(itemWidth)
                .offset(0.dp, 0.dp)
                .zIndex(if (selectedIndex.value == index) 1f else 0f)
            } else {
              Modifier
                .wrapContentSize()
                .offset(0.dp, 0.dp)
                .zIndex(if (selectedIndex.value == index) 1f else 0f)
            }
          } else -> {
            if (useFixedWidth)
              Modifier
                .width(itemWidth)
                .offset((-1 * index).dp, 0.dp)
                .zIndex(if (selectedIndex.value == index) 1f else 0f)
            else Modifier
              .wrapContentSize()
              .offset((-1 * index).dp, 0.dp)
              .zIndex(if (selectedIndex.value == index) 1f else 0f)
          }
        },
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
            colorResource(id = color)
          } else {
            colorResource(id = color).copy(alpha = 0.75f)
          }
        ),
        colors = if (selectedIndex.value == index) {
          /**
           * selected colors
           */
          ButtonDefaults.outlinedButtonColors(
            backgroundColor = colorResource(
              id = color
            )
          )
        } else {
          /**
           * not selected colors
           */
          ButtonDefaults.outlinedButtonColors(backgroundColor = Color.Transparent)
        },
      ) {
        Text(
          text = item,
          fontWeight = FontWeight.Normal,
          color = if (selectedIndex.value == index) {
            Color.White
          } else {
            colorResource(id = color).copy(alpha = 0.9f)
          },
        )
      }
    }
  }
}
