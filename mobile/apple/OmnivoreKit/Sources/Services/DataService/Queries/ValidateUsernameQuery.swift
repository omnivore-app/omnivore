import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func validateUsernamePublisher(username: String) async throws {
    let query = Selection.Query {
      try $0.validateUsername(username: username)
    }

    let path = appEnvironment.graphqlPath

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path) { result in
        switch result {
        case let .success(payload):
          if payload.data {
            continuation.resume()
          } else {
            continuation.resume(throwing: UsernameAvailabilityError.nameUnavailable)
          }
        case let .failure(error):
          continuation.resume(throwing: UsernameAvailabilityError.make(from: error))
        }
      }
    }
  }
}

private extension UsernameAvailabilityError {
  static func make(from httpError: HttpError) -> UsernameAvailabilityError {
    switch httpError {
    case .badURL, .badpayload, .badstatus:
      return .internalServer
    case .timeout, .network:
      return .network
    case .cancelled:
      return .unknown
    }
  }
}
