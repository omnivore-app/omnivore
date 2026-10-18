package app.omnivore.omnivore.feature.library

import androidx.lifecycle.MutableLiveData
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights

interface SavedItemViewModel {

    val actionsMenuItemLiveData: MutableLiveData<SavedItemWithLabelsAndHighlights?>
        get() = MutableLiveData<SavedItemWithLabelsAndHighlights?>(null)

    fun handleSavedItemAction(itemId: String, action: SavedItemAction)
}
