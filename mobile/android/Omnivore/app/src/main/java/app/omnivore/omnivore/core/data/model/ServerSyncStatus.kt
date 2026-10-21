package app.omnivore.omnivore.core.data.model

enum class ServerSyncStatus(val rawValue: Int) {
    IS_SYNCED(0),
    IS_SYNCING(1),
    NEEDS_DELETION(2),
    NEEDS_CREATION(3),
    NEEDS_UPDATE(4),
    NEEDS_MERGE(5)
}
