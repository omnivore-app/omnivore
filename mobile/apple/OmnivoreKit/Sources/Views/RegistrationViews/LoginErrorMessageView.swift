import Models
import SwiftUI

public struct LoginErrorMessageView: View {
  let loginError: LoginError

  public init(loginError: LoginError) {
    self.loginError = loginError
  }

  public var body: some View {
    Text(loginError.message)
      .font(.appBody)
      .foregroundColor(.red)
      .multilineTextAlignment(.leading)
  }
}

private extension LoginError {
  var message: String {
    switch self {
    case .unauthorized:
      return LocalText.loginErrorInvalidCreds
    case .network:
      return LocalText.errorNetwork
    case .unknown:
      return LocalText.errorGeneric
    case .pendingEmailVerification:
      return "Please check your email for a verification message."
    }
  }
}
