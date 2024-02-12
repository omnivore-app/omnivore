package app.omnivore.omnivore.core.data

import app.omnivore.omnivore.core.network.savedItemLabels

suspend fun DataService.syncLabels() {
  val fetchedLabels = networker.savedItemLabels()
  db.savedItemLabelDao().insertAll(fetchedLabels)
}
