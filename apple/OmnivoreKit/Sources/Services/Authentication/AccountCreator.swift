import Combine
import Foundation
import Models

public extension Authenticator {
  func createPendingAccountUsingApple(
    token: String,
    name: PersonNameComponents?
  ) -> AnyPublisher<UserProfile, LoginError> {
    let params = CreatePendingAccountParams(token: token, provider: .apple, fullName: name)
    return createPendingAccount(params: params)
  }

  func createAccount(userProfile: UserProfile) -> AnyPublisher<Void, LoginError> {
    let params = CreateAccountParams(
      pendingUserToken: pendingUserToken ?? "",
      userProfile: userProfile
    )

    let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()

    return networker
      .createAccount(params: encodedParams)
      .tryMap { [weak self] in
        try ValetKey.authCookieString.setValue($0.commentedAuthCookieString)
        try ValetKey.authToken.setValue($0.authToken)
        self?.pendingUserToken = nil
        self?.isLoggedIn = true
      }
      .mapError { error in
        let serverError = (error as? ServerError) ?? ServerError.unknown
        return LoginError.make(serverError: serverError)
      }
      .eraseToAnyPublisher()
  }
}

extension Authenticator {
  func createPendingAccount(params: CreatePendingAccountParams) -> AnyPublisher<UserProfile, LoginError> {
    let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()

    return networker
      .createPendingUser(params: encodedParams)
      .tryMap { [weak self] in
        self?.pendingUserToken = $0.pendingUserToken
        return $0.pendingUserProfile
      }
      .mapError { error in
        let serverError = (error as? ServerError) ?? ServerError.unknown
        return LoginError.make(serverError: serverError)
      }
      .eraseToAnyPublisher()
  }
}
