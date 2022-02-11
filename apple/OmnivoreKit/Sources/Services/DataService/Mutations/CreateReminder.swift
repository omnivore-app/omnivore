import Combine
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
  func createReminderPublisher(
    reminderItemId: ReminderItemId,
    remindAt: Date
  ) -> AnyPublisher<String, BasicError> {
    enum MutationResult {
      case complete(id: String)
      case error(errorCode: Enums.CreateReminderErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateReminderResult> {
      try $0.on(
        createReminderSuccess: .init {
          .complete(id: try $0.reminder(selection: Selection.Reminder { try $0.id() }))
        },
        createReminderError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createReminder(
        input: InputObjects.CreateReminderInput(
          linkId: OptionalArgument(reminderItemId.linkId),
          clientRequestId: OptionalArgument(reminderItemId.clientRequestId),
          archiveUntil: true,
          sendNotification: true,
          remindAt: DateTime(from: remindAt)
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return Deferred {
      Future { promise in
        send(mutation, to: path, headers: headers) { result in
          switch result {
          case let .success(payload):
            if let graphqlError = payload.errors {
              promise(.failure(.message(messageText: "graphql error: \(graphqlError)")))
            }

            switch payload.data {
            case let .complete(id: id):
              promise(.success(id))
            case let .error(errorCode: errorCode):
              promise(.failure(.message(messageText: errorCode.rawValue)))
            }
          case .failure:
            promise(.failure(.message(messageText: "graphql error")))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
