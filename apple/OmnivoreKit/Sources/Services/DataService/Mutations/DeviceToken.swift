import Combine
import Foundation
import Models
import SwiftGraphQL

public enum DeviceTokenOperation {
  case addToken(token: String)
  case deleteToken(tokenID: String)

  var token: String? {
    switch self {
    case let .addToken(token):
      return token
    case .deleteToken:
      return nil
    }
  }

  var tokenID: String? {
    switch self {
    case .addToken:
      return nil
    case let .deleteToken(tokenID):
      return tokenID
    }
  }
}

public extension DataService {
  func deviceTokenPublisher(
    deviceTokenOperation: DeviceTokenOperation
  ) -> AnyPublisher<String, BasicError> {
    enum MutationResultNew {
      case saved(id: String)
      case error(errorCode: Enums.SetDeviceTokenErrorCode)
    }

    let selection = Selection<MutationResultNew, Unions.SetDeviceTokenResult> {
      try $0.on(
        setDeviceTokenSuccess: .init {
          .saved(id: try $0.deviceToken(selection: Selection.DeviceToken { try $0.id() }))
        },
        setDeviceTokenError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setDeviceToken(
        input: InputObjects.SetDeviceTokenInput(
          id: OptionalArgument(deviceTokenOperation.tokenID),
          token: OptionalArgument(deviceTokenOperation.token)
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
            case let .saved(id: id):
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
