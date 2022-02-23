import Models
import SwiftUI

struct ToggleAuthFlowButton: View {
  let authFlow: AuthFlow
  let action: () -> Void

  var buttonTitle: String {
    switch authFlow {
    case .signIn:
      return "Don’t have an account? "
    case .signUp:
      return "Already have an account? "
    }
  }

  var buttonTitleSuffix: String {
    switch authFlow {
    case .signIn:
      return "Sign Up"
    case .signUp:
      return "Log In"
    }
  }

  var body: some View {
    Button(
      action: action,
      label: {
        Text(buttonTitle)
          .font(.appFootnote)
          .foregroundColor(.appGrayText)
          + Text(buttonTitleSuffix)
          .underline()
          .font(.appFootnote)
          .foregroundColor(.red)
      }
    )
    .buttonStyle(PlainButtonStyle())
  }
}
