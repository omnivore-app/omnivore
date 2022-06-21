import Foundation
import Models

public extension Authenticator {
  func createPendingAccountUsingApple(
    token: String,
    name: PersonNameComponents?
  ) async throws -> UserProfile {
    let params = CreatePendingAccountParams(token: token, provider: .apple, fullName: name)
    return try await createPendingAccount(params: params)
  }

  func createAccount(userProfile: UserProfile) async throws {
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
  func createPendingAccount(params: CreatePendingAccountParams) async throws -> UserProfile {
    do {
      let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()
      let pendingUserAuthPayload = try await networker.createPendingUser(params: encodedParams)
      return pendingUserAuthPayload.pendingUserProfile
    } catch {
      throw LoginError.make(serverError: (error as? ServerError) ?? .unknown)
    }
  }
}
