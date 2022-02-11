import AuthenticationServices
import SwiftUI

struct AppleSignInButton: View {
  @Environment(\.colorScheme) var colorScheme

  let onCompletion: (Result<ASAuthorization, Error>) -> Void

  var body: some View {
    SignInWithAppleButton(
      .continue,
      onRequest: { request in
        request.requestedScopes = [.email, .fullName]
      },
      onCompletion: onCompletion
    )
    .frame(height: 44)
    .cornerRadius(8)
    .signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)
  }
}
