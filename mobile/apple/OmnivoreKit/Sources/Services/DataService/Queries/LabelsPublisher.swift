import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func labels() async throws -> [NSManagedObjectID] {
    enum QueryResult {
      case success(result: [InternalLinkedItemLabel])
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.LabelsResult> {
      try $0.on(
        labelsError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        labelsSuccess: .init {
          QueryResult.success(result: try $0.labels(selection: feedItemLabelSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.labels(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network request failed"))
          return
        }

        switch payload.data {
        case let .success(result: labels):
          if let labelObjectIDs = labels.persist(context: context) {
            continuation.resume(returning: labelObjectIDs)
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "CoreData error"))
          }
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "labels fetch error"))
        }
      }
    }
  }
}
