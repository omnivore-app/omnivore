import Foundation
import Models

public extension Authenticator {
  func createPendingAccountUsingApple(
    token: String,
    name: PersonNameComponents?
  ) async throws -> NewUserProfile {
    let params = CreatePendingAccountParams(token: token, provider: .apple, fullName: name)
    return try await createPendingAccount(params: params)
  }

  func createAccount(userProfile: NewUserProfile) async throws {
    let params = CreateAccountParams(
      pendingUserToken: pendingUserToken ?? "",
      userProfile: userProfile
    )

    let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()

    do {
      let authPayload = try await networker.createAccount(params: encodedParams)
      try ValetKey.authCookieString.setValue(authPayload.commentedAuthCookieString)
      try ValetKey.authToken.setValue(authPayload.authToken)
      DispatchQueue.main.async {
        self.pendingUserToken = nil
        self.isLoggedIn = true
      }
    } catch {
      let serverError = (error as? ServerError) ?? ServerError.unknown
      throw LoginError.make(serverError: serverError)
    }
  }
}

extension Authenticator {
  func createPendingAccount(params: CreatePendingAccountParams) async throws -> NewUserProfile {
    do {
      let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()
      let pendingUserAuthPayload = try await networker.createPendingUser(params: encodedParams)
      pendingUserToken = pendingUserAuthPayload.pendingUserToken
      return pendingUserAuthPayload.pendingUserProfile
    } catch {
      throw LoginError.make(serverError: (error as? ServerError) ?? .unknown)
    }
  }
}

// email auth
public extension Authenticator {
  func submitEmailLogin(
    email: String,
    password: String
  ) async throws {
    do {
      let params = EmailSignInParams(email: email, password: password)
      let emailAuthPayload = try await networker.submitEmailLogin(params: params)

      if let authCookieString = emailAuthPayload.authCookieString, let authToken = emailAuthPayload.authToken {
        let authPayload = AuthPayload(authCookieString: authCookieString, authToken: authToken)
        try ValetKey.authCookieString.setValue(authPayload.commentedAuthCookieString)
        try ValetKey.authToken.setValue(authPayload.authToken)
        DispatchQueue.main.async {
          self.isLoggedIn = true
        }
      } else if emailAuthPayload.pendingEmailVerification == true {
        throw ServerError.pendingEmailVerification
      } else {
        throw ServerError.unknown
      }
    } catch {
      let serverError = (error as? ServerError) ?? ServerError.unknown
      throw LoginError.make(serverError: serverError)
    }
  }

  func submitUserSignUp(
    email: String,
    password: String,
    username: String,
    name: String
  ) async throws {
    do {
      let params = EmailSignUpParams(email: email, password: password, username: username, name: name)
      try await networker.submitEmailSignUp(params: params)
    } catch {
      let serverError = (error as? ServerError) ?? ServerError.unknown
      throw LoginError.make(serverError: serverError)
    }
  }
}
