import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func validateUsernamePublisher(username: String) -> AnyPublisher<Void, UsernameAvailabilityError> {
    let query = Selection.Query {
      try $0.validateUsername(username: username)
    }

    let path = appEnvironment.graphqlPath

    return Deferred {
      Future { promise in
        send(query, to: path) { result in
          switch result {
          case let .success(payload):
            promise(payload.data ? .success(()) : .failure(.nameUnavailable))
          case let .failure(error):
            promise(.failure(UsernameAvailabilityError.make(from: error)))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
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
