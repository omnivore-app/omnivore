import Foundation
import Services

class LibrarySyncManager {
  var syncCursor: String?

  func syncItems(dataService: DataService) async {
    let syncStart = Date.now
    let lastSyncDate = dataService.lastItemSyncTime

    if lastSyncDate.timeIntervalSinceNow > -4 {
      print("skipping sync as last sync was too recent: ", lastSyncDate)
      return
    }

    try? await dataService.syncOfflineItemsWithServerIfNeeded()

    let syncResult = try? await dataService.syncLinkedItems(since: lastSyncDate,
                                                            cursor: nil)

    syncCursor = syncResult?.cursor
    if let syncResult = syncResult, syncResult.hasMore {
      dataService.syncLinkedItemsInBackground(since: lastSyncDate) {
        // do nothing
      }
    } else {
      dataService.lastItemSyncTime = syncStart
    }

    // If possible start prefetching new pages in the background
    if
      let itemIDs = syncResult?.updatedItemIDs,
      !itemIDs.isEmpty
    {
      Task.detached(priority: .background) {
        await dataService.prefetchPages(itemIDs: itemIDs, username: "username")
      }
    }
  }
}
