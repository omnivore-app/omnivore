import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func updateLinkReadingProgress(itemID: String, readingProgress: Double, anchorIndex: Int) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let linkedItem = LinkedItem.lookup(byID: itemID, inContext: self.backgroundContext) else { return }

      linkedItem.update(
        inContext: self.backgroundContext,
        newReadingProgress: readingProgress,
        newAnchorIndex: anchorIndex
      )

      // Send update to server
      self.syncLinkReadingProgress(
        itemID: linkedItem.unwrappedID,
        objectID: linkedItem.objectID,
        readingProgress: readingProgress,
        anchorIndex: anchorIndex
      )
    }
  }

  func syncLinkReadingProgress(itemID: String, objectID: NSManagedObjectID, readingProgress: Double, anchorIndex: Int) {
    enum MutationResult {
      case saved(readingProgress: Double)
      case error(errorCode: Enums.SaveArticleReadingProgressErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SaveArticleReadingProgressResult> {
      try $0.on(
        saveArticleReadingProgressSuccess: .init {
          .saved(
            readingProgress: try $0.updatedArticle(selection: Selection.Article { try $0.readingProgressPercent() })
          )
        },
        saveArticleReadingProgressError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.saveArticleReadingProgress(
        input: InputObjects.SaveArticleReadingProgressInput(
          id: itemID,
          readingProgressPercent: readingProgress,
          readingProgressAnchorIndex: anchorIndex
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { result in
      let data = try? result.get()
      let syncStatus: ServerSyncStatus = data == nil ? .needsUpdate : .isNSync

      context.perform {
        guard let linkedItem = context.object(with: objectID) as? LinkedItem else { return }
        linkedItem.serverSyncStatus = Int64(syncStatus.rawValue)

        do {
          try context.save()
          logger.debug("LinkedItem updated succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to update LinkedItem: \(error.localizedDescription)")
        }
      }
    }
  }
}
