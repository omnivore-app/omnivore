import Foundation
import Models
import SwiftGraphQL
import Utils

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
  func syncDeviceToken(deviceTokenOperation: DeviceTokenOperation) async throws -> String? {
    enum MutationResult {
      case saved(id: String, token: String?)
      case error(errorCode: Enums.SetDeviceTokenErrorCode)
    }

    let success = Selection.DeviceToken { (id: try $0.id(), token: try $0.token()) }

    let selection = Selection<MutationResult, Unions.SetDeviceTokenResult> {
      try $0.on(
        setDeviceTokenError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        setDeviceTokenSuccess: .init {
          .saved(
            id: try $0.deviceToken(selection: success).id,
            token: try $0.deviceToken(selection: success).token
          )
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

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { result in
        guard let payload = try? result.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case let .saved(id: id, token: token):
          switch deviceTokenOperation {
          case .deleteToken(tokenID: _):
            // When we delete we don't remove the saved token, as we might need to re-use it
            // in the future
            UserDefaults.standard.removeObject(forKey: UserDefaultKey.deviceTokenID.rawValue)
          case .addToken(token: _):
            UserDefaults.standard.set(id, forKey: UserDefaultKey.deviceTokenID.rawValue)
            UserDefaults.standard.set(token, forKey: UserDefaultKey.firebasePushToken.rawValue)
          }

          continuation.resume(returning: id)
        case let .error(errorCode: errorCode):
          continuation.resume(throwing: BasicError.message(messageText: errorCode.rawValue))
        }
      }
    }
  }
}
