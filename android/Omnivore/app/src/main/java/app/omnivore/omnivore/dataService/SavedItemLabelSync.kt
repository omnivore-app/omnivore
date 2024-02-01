package app.omnivore.omnivore.dataService

import app.omnivore.omnivore.network.savedItemLabels

suspend fun DataService.syncLabels() {
  val fetchedLabels = networker.savedItemLabels()
  db.savedItemLabelDao().insertAll(fetchedLabels)
}
