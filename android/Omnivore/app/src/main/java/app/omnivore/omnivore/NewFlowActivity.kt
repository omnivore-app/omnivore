package app.omnivore.omnivore

import androidx.compose.material.ExperimentalMaterialApi

// Not sure why we need this class, but directly opening SaveSheetActivity
// causes the app to crash.

@OptIn(ExperimentalMaterialApi::class)
class NewFlowActivity : SaveSheetActivity() {

}
