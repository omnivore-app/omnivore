import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func updateLinkReadingProgress(itemID: String, readingProgress: Double, anchorIndex: Int, force: Bool?) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let linkedItem = LibraryItem.lookup(byID: itemID, inContext: self.backgroundContext) else { return }

      print("updating reading progress: ", readingProgress, anchorIndex)
      linkedItem.update(
        inContext: self.backgroundContext,
        newReadingProgress: readingProgress,
        newAnchorIndex: anchorIndex,
        readAt: Date()
      )

      // Send update to server
      self.syncLinkReadingProgress(
        itemID: linkedItem.unwrappedID,
        readingProgress: readingProgress,
        anchorIndex: anchorIndex,
        force: force
      )
    }
  }

  func syncLinkReadingProgress(itemID: String, readingProgress: Double, anchorIndex: Int, force: Bool?) {
    enum MutationResult {
      case saved(readAt: Date?)
      case error(errorCode: Enums.SaveArticleReadingProgressErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SaveArticleReadingProgressResult> {
      try $0.on(
        saveArticleReadingProgressError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) },
        saveArticleReadingProgressSuccess: .init {
          .saved(
            readAt: try $0.updatedArticle(selection: Selection.Article { try $0.readAt()?.value })
          )
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.saveArticleReadingProgress(
        input: InputObjects.SaveArticleReadingProgressInput(
          force: OptionalArgument(force),
          id: itemID,
          readingProgressAnchorIndex: OptionalArgument(anchorIndex),
          readingProgressPercent: readingProgress
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
        guard let linkedItem = LibraryItem.lookup(byID: itemID, inContext: context) else { return }
        linkedItem.serverSyncStatus = Int64(syncStatus.rawValue)
        if let mutationResult = data?.data, case let MutationResult.saved(readAt) = mutationResult {
          linkedItem.readAt = readAt
        }

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
