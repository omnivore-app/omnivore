import Foundation
import Models

struct CreatePendingAccountParams: Encodable {
  let token: String
  let provider: AuthProvider
  let name: String?

  init(token: String, provider: AuthProvider, fullName: PersonNameComponents?) {
    self.token = token
    self.provider = provider
    self.name = fullName?.formattedMediumLengthName
  }
}

struct SignInParams: Encodable {
  let token: String
  let provider: AuthProvider
}

struct EmailSignInParams: Encodable {
  let email: String
  let password: String
}

struct EmailSignUpParams: Encodable {
  let email: String
  let password: String
  let username: String
  let name: String
}

enum AuthProvider: String, Encodable {
  case apple = "APPLE"
  case google = "GOOGLE"
}

struct AuthPayload: Decodable {
  let authCookieString: String
  let authToken: String
}

struct EmailAuthPayload: Decodable {
  let authCookieString: String?
  let authToken: String?
  let pendingEmailVerification: Bool?
}

struct CreateAccountParams: Encodable {
  let pendingUserToken: String
  let userProfile: NewUserProfile
}

struct PendingUserAuthPayload: Decodable {
  let pendingUserToken: String
  let pendingUserProfile: NewUserProfile
}

struct PendingEmailVerificationAuthPayload: Decodable {
  let pendingEmailVerificationToken: String
}

extension AuthPayload {
  var commentedAuthCookieString: String {
    authCookieString.replacingOccurrences(of: "HttpOnly", with: "comment=ios-webview-cookie; HttpOnly")
  }
}

extension LoginError {
  static func make(serverError: ServerError) -> LoginError {
    switch serverError {
    case .noConnection, .timeout:
      return .network
    case .unauthenticated:
      return .unauthorized
    case .unknown:
      return .unknown
    case .pendingEmailVerification, .stillProcessing:
      return .pendingEmailVerification
    }
  }
}

private extension PersonNameComponents {
  var formattedMediumLengthName: String {
    let formatter = PersonNameComponentsFormatter()
    formatter.style = .medium
    return formatter.string(from: self)
  }
}
