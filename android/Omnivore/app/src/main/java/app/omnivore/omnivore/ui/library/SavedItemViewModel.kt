package app.omnivore.omnivore.ui.library

import androidx.lifecycle.MutableLiveData
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights

interface SavedItemViewModel {

    val actionsMenuItemLiveData: MutableLiveData<SavedItemWithLabelsAndHighlights?>
        get() = MutableLiveData<SavedItemWithLabelsAndHighlights?>(null)

    fun handleSavedItemAction(itemID: String, action: SavedItemAction)
}
