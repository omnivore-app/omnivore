import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func moveItem(itemID: String, folder: String) async throws {
    backgroundContext.performAndWait {
      if let linkedItem = Models.LibraryItem.lookup(byID: itemID, inContext: backgroundContext) {
        linkedItem.folder = folder
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

    try await syncMoveToFolder(itemID: itemID, folder: folder)
  }

  func syncMoveToFolder(itemID: String, folder: String) async throws {
    enum MutationResult {
      case result(itemID: String)
      case error(errorMessage: String)
    }

    let articleSavingRequestSelection = Selection.ArticleSavingRequest {
      try $0.id()
    }

    let selection = Selection<MutationResult, Unions.MoveToFolderResult> {
      try $0.on(
        moveToFolderError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        moveToFolderSuccess: .init {
          .result(itemID: try $0.articleSavingRequest(selection: articleSavingRequestSelection))
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

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case let .result(itemID: _):
          continuation.resume()
        case let .error(errorMessage: errorMessage):
          continuation.resume(throwing: BasicError.message(messageText: errorMessage))
        }
      }
    }
  }
}
