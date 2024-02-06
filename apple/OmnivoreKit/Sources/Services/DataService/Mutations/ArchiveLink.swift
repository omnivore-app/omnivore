import CoreData
import Foundation
import Models
import SwiftGraphQL
import Utils

extension DataService {
  public func archiveLink(objectID: NSManagedObjectID, archived: Bool) {
    // Update CoreData
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let linkedItem = self.backgroundContext.object(with: objectID) as? LibraryItem else { return }
      linkedItem.update(inContext: self.backgroundContext, newIsArchivedValue: archived)

      // Send update to server
      self.syncLinkArchiveStatus(itemID: linkedItem.unwrappedID, archived: archived)
    }
  }

  func syncLinkArchiveStatus(itemID: String, archived: Bool) {
    enum MutationResult {
      case success(linkId: String)
      case error(errorCode: Enums.ArchiveLinkErrorCode)
    }

    let selection = Selection<MutationResult, Unions.ArchiveLinkResult> {
      try $0.on(
        archiveLinkError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        archiveLinkSuccess: .init { .success(linkId: try $0.linkId()) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setLinkArchived(
        input: InputObjects.ArchiveLinkInput(
          archived: archived,
          linkId: itemID
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
