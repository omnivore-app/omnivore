import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func removeLink(objectID: NSManagedObjectID) {
    // Update CoreData
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let linkedItem = self.backgroundContext.object(with: objectID) as? LinkedItem else { return }
      linkedItem.remove(inContext: self.backgroundContext)

      // Send update to server
      self.syncLinkDeletion(itemID: linkedItem.unwrappedID, objectID: objectID)
    }
  }

  // TODO: this doesn't really work since we usually delete from core data first
  // and then sync the deletion with the server. So we have no way to recored a failed
  // delete call to the server as it is now...
  func syncLinkDeletion(itemID: String, objectID: NSManagedObjectID?) {
    enum MutationResult {
      case success(linkId: String)
      case error(errorCode: Enums.SetBookmarkArticleErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SetBookmarkArticleResult> {
      try $0.on(
        setBookmarkArticleError: .init { .error(errorCode: try $0.errorCodes().first ?? .notFound) },
        setBookmarkArticleSuccess: .init {
          .success(
            linkId: try $0.bookmarkedArticle(selection: Selection.Article {
              try $0.id()
            })
          )
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setBookmarkArticle(
        input: InputObjects.SetBookmarkArticleInput(
          articleId: itemID,
          bookmark: false
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { result in
      let data = try? result.get()
      let isSyncSuccess = data != nil

      if let objectID = objectID {
        context.perform {
          guard let linkedItem = context.object(with: objectID) as? LinkedItem else { return }

          if isSyncSuccess {
            linkedItem.remove(inContext: context)
          } else {
            linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)
          }

          do {
            try context.save()
            logger.debug("LinkedItem deleted succesfully")
          } catch {
            context.rollback()
            logger.debug("Failed to delete LinkedItem: \(error.localizedDescription)")
          }
        }
      }
    }
  }
}
