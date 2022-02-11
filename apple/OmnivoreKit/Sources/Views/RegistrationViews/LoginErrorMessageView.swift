import Models
import SwiftUI

struct LoginErrorMessageView: View {
  let loginError: LoginError

  var body: some View {
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
      return LocalText.invalidCredsLoginError
    case .network:
      return LocalText.networkError
    case .unknown:
      return LocalText.genericError
    }
  }
}
