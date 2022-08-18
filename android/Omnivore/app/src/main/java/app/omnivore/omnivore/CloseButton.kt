package app.omnivore.omnivore

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R

typealias OnClickedClose = () -> Unit

@Composable
fun CloseButton(
    modifier: Modifier = Modifier,
    onClickedClose: OnClickedClose
) {
    Box(
        modifier.then(
            Modifier.padding(end = 13.dp, top = 13.dp)
        )
    ) {
        Button(
            onClick = { onClickedClose() },
            modifier = Modifier.size(26.dp),
            shape = CircleShape,
            elevation = ButtonDefaults.elevation(defaultElevation = 0.dp, pressedElevation = 0.dp),
            contentPadding = PaddingValues(0.dp),
            colors = ButtonDefaults.outlinedButtonColors(backgroundColor = colorResource(id = R.color.cloud))
        ) {
            Icon(
                modifier = Modifier.align(Alignment.CenterVertically),
                painter = painterResource(id = R.drawable.ic_x_2),
                contentDescription = "CLOSE_BUTTON_DESCRIPTION",
                tint = colorResource(id = R.color.gray_B7B7B7)
            )
        }
    }
}
