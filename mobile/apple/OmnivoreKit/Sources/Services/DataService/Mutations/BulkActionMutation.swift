//
//  BulkActionMutation.swift
//
//
//  Created by Jackson Harper on 11/17/23.
//

import CoreData
import Foundation
import Models
import SwiftGraphQL

public enum BulkAction {
  case delete
  case archive

  var GQLType: Enums.BulkActionType {
    switch self {
    case BulkAction.archive:
      return Enums.BulkActionType.archive
    case BulkAction.delete:
      return Enums.BulkActionType.delete
    }
  }
}

public extension DataService {
  func bulkAction(action: BulkAction, items: [String]) async throws {
    // If the item is still available locally, update its state
    backgroundContext.performAndWait {
      items.forEach { itemID in
        if let linkedItem = Models.LibraryItem.lookup(byID: itemID, inContext: backgroundContext) {
          if action == .delete {
            linkedItem.state = "DELETED"
            linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)
          } else {
            linkedItem.update(inContext: self.backgroundContext, newIsArchivedValue: true)
            linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsUpdate.rawValue)
          }
        }
      }
      do {
        try backgroundContext.save()
        logger.debug("LinkedItem updated succesfully")
      } catch {
        backgroundContext.rollback()
        logger.debug("Failed to update LinkedItem: \(error.localizedDescription)")
      }
    }

    // If we recovered locally, but failed to sync the undelete, that is OK, because
    // the item shouldn't be deleted server side.
    try await syncBulkAction(action: action, items: items)
  }

  func syncBulkAction(action: BulkAction, items: [String]) async throws {
    enum MutationResult {
      case result(success: Bool)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.BulkActionResult> {
      try $0.on(
        bulkActionError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        bulkActionSuccess: .init { .result(success: try $0.success()) }
      )
    }

    let query = "includes:\"\(items.joined(separator: ","))\""
    let mutation = Selection.Mutation {
      try $0.bulkAction(
        action: action.GQLType,
        query: query,
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
        case let .result(success: success):
          if success {
            continuation.resume()
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "Operation failed"))
          }
        case let .error(errorMessage: errorMessage):
          continuation.resume(throwing: BasicError.message(messageText: errorMessage))
        }
      }
    }
  }
}
