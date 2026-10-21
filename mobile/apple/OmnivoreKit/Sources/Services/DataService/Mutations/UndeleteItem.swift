import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func recoverItem(itemID: String) async -> Bool {
    var itemUpdatedLocal = false
    // If the item is still available locally, update its state
    backgroundContext.performAndWait {
      if let linkedItem = LibraryItem.lookup(byID: itemID, inContext: backgroundContext) {
        linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsUpdate.rawValue)

        do {
          try backgroundContext.save()
          itemUpdatedLocal = true
          logger.debug("LinkedItem updated succesfully")
        } catch {
          backgroundContext.rollback()
          logger.debug("Failed to update LinkedItem: \(error.localizedDescription)")
        }
      }
    }

    // If we recovered locally, but failed to sync the undelete, that is OK, because
    // the item shouldn't be deleted server side.
    return await syncServerRecoverItem(itemID: itemID) || itemUpdatedLocal
  }

  func syncServerRecoverItem(itemID: String) async -> Bool {
    enum MutationResult {
      case saved(title: String)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.UpdatePageResult> {
      try $0.on(
        updatePageError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        updatePageSuccess: .init {
          .saved(title: try $0.updatedPage(selection: Selection.Article { try $0.title() }))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.updatePage(
        input: .init(pageId: itemID,
                     state: OptionalArgument(Enums.ArticleSavingRequestStatus.succeeded)),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    try? await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { _ in
        continuation.resume()
      }
    }

    let result = try? await loadLinkedItem(username: "me", itemID: itemID)
    return result != nil
  }
}
