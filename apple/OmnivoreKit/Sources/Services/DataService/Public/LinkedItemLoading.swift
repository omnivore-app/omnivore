import CoreData
import Foundation
import Models

public extension DataService {
  /// Requests `LinkedItem`s updates from the server since a certain datae
  /// and stores it in CoreData while deleting all the items with ids the server says
  /// have been deleted.
  func syncLinkedItems(
    since: Date,
    cursor: String?,
    descending: Bool = true
  ) async throws -> LinkedItemSyncResult {
    let fetchResult = try await linkedItemUpdates(since: since, limit: 20, cursor: cursor, descending: descending)

    LibraryItem.deleteItems(ids: fetchResult.deletedItemIDs, context: backgroundContext)

    if !fetchResult.newItems.isEmpty {
      if fetchResult.newItems.persist(context: backgroundContext) == nil {
        throw BasicError.message(messageText: "CoreData error")
      }
    }

    if !fetchResult.updatedItems.isEmpty {
      if fetchResult.updatedItems.persist(context: backgroundContext) == nil {
        throw BasicError.message(messageText: "CoreData error")
      }
    }

    let newestChange = fetchResult.updatedItems.max { $0.updatedAt < $1.updatedAt }
    let oldestChange = fetchResult.updatedItems.min { $0.updatedAt < $1.updatedAt }

    let result = LinkedItemSyncResult(
      updatedItemIDs: fetchResult.updatedItems.map(\.id),
      cursor: fetchResult.cursor,
      hasMore: fetchResult.hasMoreItems,
      mostRecentUpdatedAt: newestChange?.updatedAt,
      oldestUpdatedAt: oldestChange?.updatedAt,
      isEmpty: fetchResult.deletedItemIDs.isEmpty && fetchResult.updatedItems.isEmpty
    )

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
    let fetchResult = try await fetchLinkedItems(limit: limit, searchQuery: searchQuery, cursor: cursor)
    guard let itemIDs = fetchResult.items.persist(context: backgroundContext) else {
      throw BasicError.message(messageText: "CoreData error")
    }

    return LinkedItemQueryResult(itemIDs: itemIDs, cursor: fetchResult.cursor, totalCount: fetchResult.totalCount)
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

  // This will iterate through a paginated list of sync updates, and upon completing each one,
  // update the lastItemSyncTime to the pages most recent change. This allows us to paginate
  // very large sets of changes that could fail due to rate limiting or network failures.
  // Eventually we should be able to work through the list of changes and catch up.
  func syncLinkedItemsInBackground(
    since: Date,
    onComplete: @escaping () -> Void
  ) {
    Task.detached(priority: .background) {
      var count = 0
      for try await result in BackgroundSync(dataService: self, since: since, cursor: nil) {
        count += result.updatedItemIDs.count
        if count > 180 {
          break
        }
      }
      DispatchQueue.main.sync {
        self.lastItemSyncTime = Date.now
        onComplete()
      }
    }
  }
}

struct BackgroundSync: AsyncSequence {
  public typealias Element = LinkedItemSyncResult
  public let dataService: DataService
  public let since: Date
  public let cursor: String?

  public struct AsyncIterator: AsyncIteratorProtocol {
    let dataService: DataService
    public var since: Date
    public var cursor: String?

    public mutating func next() async throws -> LinkedItemSyncResult? {
      let result = try await dataService.syncLinkedItems(since: since,
                                                         cursor: cursor,
                                                         descending: true)
      cursor = result.cursor
      return result.isEmpty ? nil : result
    }
  }

  public func makeAsyncIterator() -> AsyncIterator {
    AsyncIterator(dataService: dataService, since: since, cursor: cursor)
  }
}
