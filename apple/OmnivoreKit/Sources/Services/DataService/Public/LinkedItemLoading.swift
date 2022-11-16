import CoreData
import Foundation
import Models

public extension DataService {
  /// Requests `LinkedItem`s updates from the server since a certain datae
  /// and stores it in CoreData while deleting all the items with ids the server says
  /// have been deleted.
  /// - Parameters:
  ///   - limit: max count of items
  ///   - searchQuery: search terms and filters
  ///   - cursor: cursor when loading batch for infinite list
  /// - Returns: `LinkedItemQueryResult` (managed object IDs and an optional cursor)
  func syncLinkedItems(
    since date: Date,
    cursor: String?,
    previousQueryResult: LinkedItemSyncResult? = nil
  ) async throws -> LinkedItemSyncResult? {
    if previousQueryResult == nil {
      // Send offline changes to server before fetching items
      // only on the first call of this function
      try? await syncOfflineItemsWithServerIfNeeded()
    }

    let fetchResult = try await linkedItemUpdates(since: date, limit: 20, cursor: cursor)

    LinkedItem.deleteItems(ids: fetchResult.deletedItemIDs, context: backgroundContext)

    if fetchResult.items.persist(context: backgroundContext) == nil {
      throw BasicError.message(messageText: "CoreData error")
    }

    
    let prev = previousQueryResult?.updatedItemIDs ?? []
    let result = LinkedItemSyncResult(
      updatedItemIDs: prev + fetchResult.items.map { $0.id },
      cursor: fetchResult.cursor
    )

    if fetchResult.hasMoreItems, (previousQueryResult?.updatedItemIDs.count ?? 0) < 200 {
      return try await syncLinkedItems(
        since: date,
        cursor: fetchResult.cursor,
        previousQueryResult: result
      )
    }

    return result
  }

  /// Requests `LinkedItem`s from the server and stores it in CoreData.
  /// - Parameters:
  ///   - limit: max count of items
  ///   - searchQuery: search terms and filters
  ///   - cursor: cursor when loading batch for infinite list
  /// - Returns: `LinkedItemQueryResult` (managed object IDs and an optional cursor)
  func loadLinkedItems(
    limit: Int,
    searchQuery: String?,
    cursor: String?
  ) async throws -> LinkedItemQueryResult {
    // Send offline changes to server before fetching items
    // try? await syncOfflineItemsWithServerIfNeeded()

    let fetchResult = try await fetchLinkedItems(limit: limit, searchQuery: searchQuery, cursor: cursor)

    guard let itemIDs = fetchResult.items.persist(context: backgroundContext) else {
      throw BasicError.message(messageText: "CoreData error")
    }

    return LinkedItemQueryResult(itemIDs: itemIDs, cursor: fetchResult.cursor)
  }

  /// Requests a single `LinkedItem` from the server and stores it in CoreData
  /// - Parameters:
  ///   - username: the Viewer's username
  ///   - itemID: id of item being requested
  /// - Returns: The `NSManagedObjectID` of the `LinkedItem`
  func loadLinkedItem(username: String, itemID: String) async throws -> NSManagedObjectID {
    let item = try await fetchLinkedItem(username: username, itemID: itemID)

    guard let persistedItemID = [item].persist(context: backgroundContext)?.first else {
      throw BasicError.message(messageText: "CoreData error")
    }

    return persistedItemID
  }

  func loadItemContentUsingRequestID(username: String, requestID: String) async throws -> NSManagedObjectID? {
    await syncUnsyncedArticleContent(itemID: requestID)

    let articleContent = try await loadArticleContentWithRetries(itemID: requestID, username: username, requestCount: 0)
    return articleContent.objectID
  }
}
