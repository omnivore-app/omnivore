import Foundation
import Models
import SwiftGraphQL

public enum ReminderItemId {
  case clientRequest(id: String)
  case link(id: String)

  var linkId: String? {
    switch self {
    case .clientRequest:
      return nil
    case let .link(id):
      return id
    }
  }

  var clientRequestId: String? {
    switch self {
    case .link:
      return nil
    case let .clientRequest(id):
      return id
    }
  }
}

public extension DataService {
  func createReminder(
    reminderItemId: ReminderItemId,
    remindAt: Date
  ) async throws {
    enum MutationResult {
      case complete(id: String)
      case error(errorCode: Enums.CreateReminderErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateReminderResult> {
      try $0.on(
        createReminderError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        createReminderSuccess: .init {
          .complete(id: try $0.reminder(selection: Selection.Reminder { try $0.id() }))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createReminder(
        input: InputObjects.CreateReminderInput(
          archiveUntil: true,
          clientRequestId: OptionalArgument(reminderItemId.clientRequestId),
          linkId: OptionalArgument(reminderItemId.linkId),
          remindAt: DateTime(from: remindAt),
          sendNotification: true
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
        case .complete:
          continuation.resume()
        case let .error(errorCode: errorCode):
          continuation.resume(throwing: BasicError.message(messageText: errorCode.rawValue))
        }
      }
    }
  }
}
