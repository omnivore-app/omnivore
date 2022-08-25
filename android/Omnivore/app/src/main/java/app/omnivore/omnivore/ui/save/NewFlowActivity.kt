package app.omnivore.omnivore.ui.save

import androidx.compose.material.ExperimentalMaterialApi
import app.omnivore.omnivore.ui.save.SaveSheetActivity

// Not sure why we need this class, but directly opening SaveSheetActivity
// causes the app to crash.

@OptIn(ExperimentalMaterialApi::class)
class NewFlowActivity : SaveSheetActivity() {

}
