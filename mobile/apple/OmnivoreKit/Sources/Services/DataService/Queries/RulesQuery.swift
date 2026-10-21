import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func rules() async throws -> [Rule] {
    enum QueryResult {
      case success(result: [Rule])
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.RulesResult> {
      try $0.on(
        rulesError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        rulesSuccess: .init {
          QueryResult.success(result: try $0.rules(selection: ruleSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.rules(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network request failed"))
          return
        }

        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "Rules fetch error"))
        }
      }
    }
  }
}
