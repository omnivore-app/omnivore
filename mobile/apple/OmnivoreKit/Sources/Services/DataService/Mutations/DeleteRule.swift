import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func deleteRule(ruleID: String) async throws -> Rule {
    enum MutationResult {
      case result(rule: Rule)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.DeleteRuleResult> {
      try $0.on(
        deleteRuleError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        deleteRuleSuccess: .init { .result(rule: try $0.rule(selection: ruleSelection)) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.deleteRule(
        id: ruleID,
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
        case let .result(rule: rule):
          continuation.resume(returning: rule)
        case let .error(errorMessage: errorMessage):
          continuation.resume(throwing: BasicError.message(messageText: errorMessage))
        }
      }
    }
  }
}
