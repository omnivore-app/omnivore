import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func moveItem(itemID: String, folder: String) async throws {
    backgroundContext.performAndWait {
      if let linkedItem = Models.LibraryItem.lookup(byID: itemID, inContext: backgroundContext) {
        linkedItem.folder = folder
        linkedItem.savedAt = Date()
        linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsUpdate.rawValue)
      }
      do {
        try backgroundContext.save()
        logger.debug("LinkedItem updated succesfully")
      } catch {
        backgroundContext.rollback()
        logger.debug("Failed to update LinkedItem: \(error.localizedDescription)")
      }
    }

    syncMoveToFolder(itemID: itemID, folder: folder)
  }

  func syncMoveToFolder(itemID: String, folder: String) {
    enum MutationResult {
      case result(success: Bool)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.MoveToFolderResult> {
      try $0.on(
        moveToFolderError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        moveToFolderSuccess: .init {
          .result(success: try $0.success())
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.moveToFolder(
        folder: folder,
        id: itemID,
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { queryResult in
      let data = try? queryResult.get()
      let syncStatus: ServerSyncStatus = data == nil ? .needsUpdate : .isNSync

      context.perform {
        guard let linkedItem = LibraryItem.lookup(byID: itemID, inContext: context) else { return }
        linkedItem.serverSyncStatus = Int64(syncStatus.rawValue)

        do {
          try context.save()
          logger.debug("LinkedItem updated succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to sync library item move: \(error.localizedDescription)")
        }
      }
    }
  }
}
