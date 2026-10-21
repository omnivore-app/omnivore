import Foundation

public enum ServerSyncStatus: Int {
  case isNSync
  case isSyncing
  case needsDeletion
  case needsCreation
  case needsUpdate
}
