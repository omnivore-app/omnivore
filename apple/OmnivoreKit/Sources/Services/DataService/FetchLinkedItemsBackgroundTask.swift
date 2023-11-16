import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func fetchLinkedItemsBackgroundTask() async throws -> Int {
    var fetchedItemCount = 0

    // Query the server for item IDs and compare against CoreData
    // to see what we're missing
    let missingItemIds = try await fetchMissingItemIDs()
    guard !missingItemIds.isEmpty else { return 0 }

    let username: String? = await backgroundContext.perform(schedule: .immediate) {
      let fetchRequest: NSFetchRequest<Models.Viewer> = Viewer.fetchRequest()
      fetchRequest.fetchLimit = 1 // we should only have one viewer saved
      return try? self.backgroundContext.fetch(fetchRequest).first?.username
    }

    guard let username = username else {
      throw BasicError.message(messageText: "could not retrieve username from core data")
    }

    // Fetch the items
    for itemID in missingItemIds { // TOOD: run these in parallel
      logger.debug("fetching item with ID: \(itemID)")
      _ = try await loadArticleContent(username: username, itemID: itemID, useCache: false)
      fetchedItemCount += 1
      logger.debug("done fetching item with ID: \(itemID)")
    }

    return fetchedItemCount
  }

  func fetchMissingItemIDs(previouslyFetchedIDs: [String] = [], cursor: String? = nil) async throws -> [String] {
    logger.debug("fetching more IDS: \(cursor ?? "no cursor")")
    let maxItemCount = 30
    let fetchResult = try await fetchLinkedItemIDs(limit: 10, cursor: cursor)
    let newItemsToFetch = await itemsNotInStore(from: fetchResult.itemIDs)
    let itemsToFetch = previouslyFetchedIDs + newItemsToFetch

    if newItemsToFetch.isEmpty || itemsToFetch.count > maxItemCount || fetchResult.cursor == nil {
      return itemsToFetch
    } else {
      return try await fetchMissingItemIDs(previouslyFetchedIDs: itemsToFetch, cursor: fetchResult.cursor)
    }
  }

  func itemsNotInStore(from itemIDs: [String]) async -> [String] {
    let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
    fetchRequest.predicate = NSPredicate(format: "id IN %@", itemIDs)

    return await backgroundContext.perform(schedule: .immediate) {
      if let foundIDs = (try? self.backgroundContext.fetch(fetchRequest).map(\.unwrappedID)) {
        return itemIDs.filter { !foundIDs.contains($0) }
      } else {
        return []
      }
    }
  }
}
