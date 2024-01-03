package app.omnivore.omnivore.models

enum class ServerSyncStatus(val rawValue: Int) {
  IS_SYNCED(0),
  IS_SYNCING(1),
  NEEDS_DELETION(2),
  NEEDS_CREATION(3),
  NEEDS_UPDATE(4)
}
