import Foundation
import Models

public extension Authenticator {
  func submitAppleToken(token: String) async throws {
    do {
      let authPayload = try await networker.submitAppleToken(token: token)
      try ValetKey.authCookieString.setValue(authPayload.commentedAuthCookieString)
      try ValetKey.authToken.setValue(authPayload.authToken)
      DispatchQueue.main.async {
        self.isLoggedIn = true
      }
    } catch {
      let serverError = (error as? ServerError) ?? ServerError.unknown
      throw LoginError.make(serverError: serverError)
    }
  }
}
