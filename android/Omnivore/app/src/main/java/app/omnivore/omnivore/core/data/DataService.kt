package app.omnivore.omnivore.core.data

import app.omnivore.omnivore.core.database.OmnivoreDatabase
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.network.Networker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.launch
import javax.inject.Inject

class DataService @Inject constructor(
    val networker: Networker,
    omnivoreDatabase: OmnivoreDatabase
) {
    val savedItemSyncChannel = Channel<SavedItem>(capacity = Channel.UNLIMITED)

    val db = omnivoreDatabase

    init {
        CoroutineScope(Dispatchers.IO).launch {
            startSyncChannels()
        }
    }

    fun clearDatabase() {
        CoroutineScope(Dispatchers.IO).launch {
            db.clearAllTables()
        }
    }
}
