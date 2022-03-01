import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

final class NewAppleSignupViewModel: ObservableObject {
  @Published var loginError: LoginError?

  var subscriptions = Set<AnyCancellable>()

  init() {}

  func submitProfile(userProfile: UserProfile, authenticator: Authenticator) {
    authenticator
      .createAccount(userProfile: userProfile).sink(
        receiveCompletion: { [weak self] completion in
          guard case let .failure(loginError) = completion else { return }
          self?.loginError = loginError
        },
        receiveValue: { _ in }
      )
      .store(in: &subscriptions)
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
          action: { viewModel.submitProfile(userProfile: userProfile, authenticator: authenticator) },
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
