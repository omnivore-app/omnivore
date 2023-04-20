package app.omnivore.omnivore.ui.library

import androidx.lifecycle.MutableLiveData
import app.omnivore.omnivore.persistence.entities.SavedItemCardData

interface SavedItemViewModel {

    val actionsMenuItemLiveData: MutableLiveData<SavedItemCardData?>
        get() = MutableLiveData<SavedItemCardData?>(null)

}
