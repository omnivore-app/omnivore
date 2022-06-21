import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class NewAppleSignupViewModel: ObservableObject {
  @Published var loginError: LoginError?

  init() {}

  func submitProfile(userProfile: UserProfile, authenticator: Authenticator) async {
    do {
      try await authenticator.createAccount(userProfile: userProfile)
    } catch {
      if let error = error as? LoginError {
        loginError = error
      }
    }
  }
}

struct NewAppleSignupView: View {
  @EnvironmentObject var authenticator: Authenticator
  @StateObject private var viewModel = NewAppleSignupViewModel()
  let userProfile: UserProfile
  let showProfileEditView: () -> Void

  var body: some View {
    VStack(spacing: 28) {
      Text("Welcome to Omnivore!")
        .font(.appTitle)
        .multilineTextAlignment(.center)

      VStack(alignment: .center, spacing: 12) {
        Text("Your username is:")
          .font(.appBody)
          .foregroundColor(.appGrayText)
        Text("@\(userProfile.username)")
          .font(.appHeadline)
          .foregroundColor(.appGrayText)
      }

      VStack {
        Button(
          action: {
            Task {
              await viewModel.submitProfile(userProfile: userProfile, authenticator: authenticator)
            }
          },
          label: { Text("Continue") }
        )
        .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

        Button(
          action: showProfileEditView,
          label: { Text("Change Username") }
        )
        .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

        if let loginError = viewModel.loginError {
          LoginErrorMessageView(loginError: loginError)
        }
      }
    }
    .frame(maxWidth: 300)
  }
}
