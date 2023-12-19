import CoreData
import Foundation
import Models
import SwiftGraphQL

public struct Rule {
  public let id: String
  public let name: String
}

let ruleSelection = Selection.Rule {
  Rule(id: try $0.id(), name: try $0.name())
}

public extension DataService {
  func createAddLabelsRule(name: String, filter: String, labelIDs: [String]) async throws -> Rule {
    enum MutationResult {
      case result(rule: Rule)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.SetRuleResult> {
      try $0.on(
        setRuleError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        setRuleSuccess: .init { .result(rule: try $0.rule(selection: ruleSelection)) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setRule(
        input: InputObjects.SetRuleInput(
          actions: [InputObjects.RuleActionInput(params: labelIDs, type: .addLabel)],
          enabled: true,
          eventTypes: [.pageCreated],
          filter: filter, name: name
        ),
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
