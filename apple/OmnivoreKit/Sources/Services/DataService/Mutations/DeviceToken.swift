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
  func syncDeviceToken(deviceTokenOperation: DeviceTokenOperation) {
    enum MutationResult {
      case saved(id: String)
      case error(errorCode: Enums.SetDeviceTokenErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SetDeviceTokenResult> {
      try $0.on(
        setDeviceTokenError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        setDeviceTokenSuccess: .init {
          .saved(id: try $0.deviceToken(selection: Selection.DeviceToken { try $0.id() }))
        }
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

    send(mutation, to: path, headers: headers) { _ in }
  }
}
