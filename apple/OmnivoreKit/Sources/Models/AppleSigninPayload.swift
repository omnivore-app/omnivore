import AuthenticationServices
import Foundation

public struct AppleSigninPayload {
  public let token: String
  public let email: String?
  public let appleUserId: String
  public let fullName: PersonNameComponents?

  static func make(from authValue: ASAuthorization) -> AppleSigninPayload? {
    let credential = authValue.credential as? ASAuthorizationAppleIDCredential
    let jwt = credential?.identityToken.flatMap { String(data: $0, encoding: .utf8) }
    guard let jwt = jwt, let userId = credential?.user else { return nil }

    return AppleSigninPayload(
      token: jwt,
      email: credential?.email,
      appleUserId: userId,
      fullName: credential?.fullName
    )
  }

  public static func parse(authResult: Result<ASAuthorization, Error>) -> Result<AppleSigninPayload, LoginError> {
    switch authResult {
    case let .success(authValue):
      if let payload = AppleSigninPayload.make(from: authValue) {
        return Result.success(payload)
      } else {
        return Result.failure(.unknown)
      }
    case let .failure(error):
      return Result.failure(LoginError.make(from: error))
    }
  }
}

private extension LoginError {
  static func make(from authError: Error) -> LoginError {
    guard let error = authError as? ASAuthorizationError else { return .unknown }

    switch error.code {
    case .invalidResponse, .failed:
      return .unauthorized
    default:
      return .unknown
    }
  }
}
