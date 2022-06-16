import CoreData
import Foundation
import Models

public extension DataService {
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
    try? await syncOfflineItemsWithServerIfNeeded()

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
}
