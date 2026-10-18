import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func removeLibraryItem(objectID: NSManagedObjectID, sync: Bool = true) {
    // First try to get the item synchronously, this is used later to delete files
    // Then we can async update core data and make the API call to sync the deletion

    var linkedItemID: String?
    viewContext.performAndWait {
      guard let linkedItem = self.viewContext.object(with: objectID) as? LibraryItem else { return }
      linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)
      linkedItemID = linkedItem.id
    }

    viewContext.perform {
      guard let linkedItem = self.viewContext.object(with: objectID) as? LibraryItem else { return }
      linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)
      linkedItemID = linkedItem.id

      do {
        try self.viewContext.save()
        logger.debug("LinkedItem succesfully marked for deletion")
      } catch {
        self.viewContext.rollback()
        logger.debug("Failed to mark LinkedItem for deletion: \(error.localizedDescription)")
      }

      if sync {
        self.syncLinkDeletion(itemID: linkedItem.unwrappedID)
      }
    }

    if let linkedItemID = linkedItemID {
      Task {
        await AudioController.removeAudioFiles(itemID: linkedItemID)
      }
    }
  }

  func syncLinkDeletion(itemID: String) {
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

      context.perform {
        guard let linkedItem = LibraryItem.lookup(byID: itemID, inContext: context) else { return }

        if isSyncSuccess {
          linkedItem.remove(inContext: context)
        } else {
          linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)

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
