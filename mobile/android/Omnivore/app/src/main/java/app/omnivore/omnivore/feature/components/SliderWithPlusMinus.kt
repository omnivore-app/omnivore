package app.omnivore.omnivore.feature.components

import androidx.annotation.IntRange
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderColors
import androidx.compose.material3.SliderDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview

/**
 * A slider wrapper that adds a plus and minus button to adjust the slider value
 * By default, moving the thumb on the slider will update the slider value immediately.
 * The plus and minus buttons will adjust the slider value by the step size.
 * The buttons are disabled when the slider value is at the minimum or maximum value.
 *
 * @param value The current value of the slider.
 * @param onValueChange Called when the value changes.
 * @param modifier The modifier to apply to the slider.
 * @param enabled Whether the slider is enabled.
 * @param valueRange The range of values the slider can take.
 * @param steps The number of steps the slider should have. If 0, the slider will be continuous.
 * @param onValueChangeFinished Called when the user stops interacting with the slider.
 * @param colors The colors to use for the slider.
 * @param interactionSource The [MutableInteractionSource] that backs this slider.
 */
@Composable
fun SliderWithPlusMinus(
    value: Float,
    onValueChange: (Float) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    valueRange: ClosedFloatingPointRange<Float> = 0f..1f,
    @IntRange(from = 0)
    steps: Int = 0,
    onValueChangeFinished: (() -> Unit)? = null,
    colors: SliderColors = SliderDefaults.colors(),
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
) {
    var sliderValue by remember { mutableFloatStateOf(value) }
    val sliderValueStepSize = if (steps == 0) 0f else
        (valueRange.endInclusive - valueRange.start) / steps

    return Row(
        modifier = modifier
            .fillMaxWidth()
    ) {
        SubtractButton(
            onClick = {
                sliderValue -= sliderValueStepSize
                onValueChange(sliderValue)
            },
            modifier = Modifier.weight(1F),
            enabled = sliderValue > valueRange.start
        )
        Slider(
          value = sliderValue,
          onValueChange = {
              sliderValue = it
              onValueChange(it)
          },
          modifier = modifier.weight(10F),
          enabled = enabled,
          valueRange = valueRange,
          steps = steps,
          onValueChangeFinished = onValueChangeFinished,
          colors = colors,
          interactionSource = interactionSource
        )
        AddButton(
            onClick = {
                sliderValue += sliderValueStepSize
                onValueChange(sliderValue)
            },
            modifier = Modifier.weight(1F),
            enabled = sliderValue < valueRange.endInclusive
        )
    }
}

@Preview
@Composable
fun SliderWithPlusMinusPreview() {
    SliderWithPlusMinus(
        value = 0.5f,
        onValueChange = {},
        valueRange = 0f..1f,
        steps = 10
    )
}
