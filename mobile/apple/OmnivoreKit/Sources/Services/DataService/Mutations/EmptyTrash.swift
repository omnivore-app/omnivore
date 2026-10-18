import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func emptyTrash() async -> Bool {
    enum MutationResult {
      case result(success: Bool)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.EmptyTrashResult> {
      try $0.on(
        emptyTrashError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        emptyTrashSuccess: .init {
          .result(success: try $0.success() ?? false)
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.emptyTrash(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    return await withCheckedContinuation { continuation in
      send(mutation, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          print("network error emptying trash")
          continuation.resume(returning: false)
          return
        }

        switch (payload.data) {
        case let .result(success):
          if !success {
            print("server did not return success for emptying trash")
            continuation.resume(returning: false)
            return
          }
        default:
          print("server did not return success for emptying trash")
          continuation.resume(returning: false)
          return
        }

        do {
          try context.performAndWait {
            let fetchRequest = LibraryItem.fetchRequest()
            fetchRequest.predicate = NSPredicate(
              format: "%K == %i OR %K == \"DELETED\"",
              #keyPath(Models.LibraryItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue),
              #keyPath(Models.LibraryItem.state)
            )
            for object in try context.fetch(fetchRequest) {
              context.delete(object)
            }
            do {
              try context.save()
              logger.debug("Empty trash completed")
              continuation.resume(returning: true)
            } catch {
              context.rollback()
              logger.debug("Failed to sync library item move: \(error.localizedDescription)")
              continuation.resume(returning: false)
            }
          }
        } catch {
          print("error emptying trash", error)
          continuation.resume(returning: false)
        }
      }
    }
  }
}
