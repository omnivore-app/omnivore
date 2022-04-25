import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func archiveLink(itemID: String, archived: Bool) {
    // Update CoreData
    if let linkedItem = LinkedItem.lookup(byID: itemID, inContext: backgroundContext) {
      linkedItem.update(inContext: backgroundContext, newIsArchivedValue: archived)
    }

    // Send update to server
    syncLinkArchiveStatus(itemID: itemID, archived: archived)
  }

  func syncLinkArchiveStatus(itemID: String, archived: Bool) {
    enum MutationResult {
      case success(linkId: String)
      case error(errorCode: Enums.ArchiveLinkErrorCode)
    }

    let selection = Selection<MutationResult, Unions.ArchiveLinkResult> {
      try $0.on(
        archiveLinkSuccess: .init { .success(linkId: try $0.linkId()) },
        archiveLinkError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setLinkArchived(
        input: InputObjects.ArchiveLinkInput(
          linkId: itemID,
          archived: archived
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
        guard let linkedItem = LinkedItem.lookup(byID: itemID, inContext: context) else { return }
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
