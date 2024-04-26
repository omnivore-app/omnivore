package app.omnivore.omnivore.core.designsystem.motion

import androidx.compose.animation.ContentTransform
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.ExperimentalAnimationApi
import androidx.compose.animation.core.FastOutLinearInEasing
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp


/**
 * Returns the provided [Dp] as an [Int] value by the [LocalDensity].
 *
 * @param slideDistance Value to the slide distance dimension, 30dp by default.
 */
@Composable
fun rememberSlideDistance(
    slideDistance: Dp = MotionConstants.DefaultSlideDistance,
): Int {
    val density = LocalDensity.current
    return remember(density, slideDistance) {
        with(density) { slideDistance.roundToPx() }
    }
}

private const val ProgressThreshold = 0.35f

private val Int.ForOutgoing: Int
    get() = (this * ProgressThreshold).toInt()

private val Int.ForIncoming: Int
    get() = this - this.ForOutgoing

/**
 * [materialSharedAxisXIn] allows to switch a layout with shared X-axis enter transition.
 */
fun materialSharedAxisXIn(
    initialOffsetX: (fullWidth: Int) -> Int,
    durationMillis: Int = MotionConstants.DefaultMotionDuration,
): EnterTransition = slideInHorizontally(
        animationSpec = tween(
                durationMillis = durationMillis,
                easing = FastOutSlowInEasing
        ),
        initialOffsetX = initialOffsetX
) + fadeIn(
        animationSpec = tween(
                durationMillis = durationMillis.ForIncoming,
                delayMillis = durationMillis.ForOutgoing,
                easing = LinearOutSlowInEasing
        )
)

/**
 * [materialSharedAxisXOut] allows to switch a layout with shared X-axis exit transition.
 *
 */
fun materialSharedAxisXOut(
    targetOffsetX: (fullWidth: Int) -> Int,
    durationMillis: Int = MotionConstants.DefaultMotionDuration,
): ExitTransition = slideOutHorizontally(
        animationSpec = tween(
                durationMillis = durationMillis,
                easing = FastOutSlowInEasing
        ),
        targetOffsetX = targetOffsetX
) + fadeOut(
        animationSpec = tween(
                durationMillis = durationMillis.ForOutgoing,
                delayMillis = 0,
                easing = FastOutLinearInEasing
        )
)


/**
 * [materialSharedAxisY] allows to switch a layout with shared Y-axis transition.
 *
 */
@OptIn(ExperimentalAnimationApi::class)
public fun materialSharedAxisY(
    initialOffsetY: (fullWidth: Int) -> Int,
    targetOffsetY: (fullWidth: Int) -> Int,
    durationMillis: Int = MotionConstants.DefaultMotionDuration,
): ContentTransform = ContentTransform(
    materialSharedAxisYIn(
        initialOffsetY = initialOffsetY,
        durationMillis = durationMillis
), materialSharedAxisYOut(
        targetOffsetY = targetOffsetY,
        durationMillis = durationMillis
)
)

/**
 * [materialSharedAxisYIn] allows to switch a layout with shared Y-axis enter transition.
 */
public fun materialSharedAxisYIn(
    initialOffsetY: (fullWidth: Int) -> Int,
    durationMillis: Int = MotionConstants.DefaultMotionDuration,
): EnterTransition = slideInVertically(
        animationSpec = tween(
                durationMillis = durationMillis,
                easing = FastOutSlowInEasing
        ),
        initialOffsetY = initialOffsetY
) + fadeIn(
        animationSpec = tween(
                durationMillis = durationMillis.ForIncoming,
                delayMillis = durationMillis.ForOutgoing,
                easing = LinearOutSlowInEasing
        )
)

/**
 * [materialSharedAxisYOut] allows to switch a layout with shared X-axis exit transition.
 *
 */
public fun materialSharedAxisYOut(
    targetOffsetY: (fullWidth: Int) -> Int,
    durationMillis: Int = MotionConstants.DefaultMotionDuration,
): ExitTransition = slideOutVertically (
        animationSpec = tween(
                durationMillis = durationMillis,
                easing = FastOutSlowInEasing
        ),
        targetOffsetY = targetOffsetY
) + fadeOut(
        animationSpec = tween(
                durationMillis = durationMillis.ForOutgoing,
                delayMillis = 0,
                easing = FastOutLinearInEasing
        )
)
