import CoreData
import Foundation
import Models
import SwiftGraphQL

public struct Rule {
  public let id: String
  public let name: String
  public let actions: [RuleAction]
}

public enum RuleActionType {
  case addLabel
  case archive
  case delete
  case markAsRead
  case sendNotification
  case export
  case webhook

  static func from(_ other: Enums.RuleActionType) -> RuleActionType {
    switch other {
    case Enums.RuleActionType.addLabel:
      return .addLabel
    case Enums.RuleActionType.archive:
      return .archive
    case Enums.RuleActionType.markAsRead:
      return .markAsRead
    case Enums.RuleActionType.sendNotification:
      return .sendNotification
    case .delete:
      return .delete
    case Enums.RuleActionType.export:
      return .export
    case Enums.RuleActionType.webhook:
      return .webhook
    }
  }
}

public struct RuleAction {
  public let params: [String]
  public let type: RuleActionType
}

let actionSelection = Selection.RuleAction {
  RuleAction(params: try $0.params(), type: RuleActionType.from(try $0.type()))
}

let ruleSelection = Selection.Rule {
  Rule(id: try $0.id(), name: try $0.name(), actions: try $0.actions(selection: actionSelection.list))
}

public extension DataService {
  func createOrUpdateAddLabelsRule(existingID: String?, name: String, filter: String, labelIDs: [String]) async throws -> Rule {
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
          filter: filter,
          id: OptionalArgument(existingID),
          name: name
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

  func createNotificationRule(name: String, filter: String) async throws -> Rule {
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
          actions: [InputObjects.RuleActionInput(params: [], type: .sendNotification)],
          enabled: true,
          eventTypes: [.pageCreated],
          filter: filter,
          id: OptionalArgument(nil),
          name: name
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
