import Combine
import Foundation
import Models

public extension Authenticator {
  func submitAppleToken(token: String) -> AnyPublisher<Void, LoginError> {
    networker
      .submitAppleToken(token: token)
      .tryMap { [weak self] in
        try ValetKey.authCookieString.setValue($0.commentedAuthCookieString)
        try ValetKey.authToken.setValue($0.authToken)
        self?.isLoggedIn = true
      }
      .mapError { error in
        let serverError = (error as? ServerError) ?? ServerError.unknown
        return LoginError.make(serverError: serverError)
      }
      .eraseToAnyPublisher()
  }
}
