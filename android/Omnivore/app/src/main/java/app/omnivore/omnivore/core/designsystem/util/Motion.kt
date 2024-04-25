package app.omnivore.omnivore.core.designsystem.util

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun rememberSlideDistance(
    slideDistance: Dp = MotionConstants.DefaultSlideDistance,
): Int {
    val density = LocalDensity.current
    return remember(density, slideDistance) {
        with(density) { slideDistance.roundToPx() }
    }
}

object MotionConstants {
    const val DEFAULT_MOTION_DURATION: Int = 300
    val DefaultSlideDistance: Dp = 30.dp
}

const val ProgressThreshold = 0.35f

val Int.ForOutgoing: Int
    get() = (this * ProgressThreshold).toInt()

val Int.ForIncoming: Int
    get() = this - this.ForOutgoing
