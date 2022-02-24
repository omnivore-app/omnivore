import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

final class NewAppleSignupViewModel: ObservableObject {
  let userProfile: UserProfile
  @Published var loginError: LoginError?

  var subscriptions = Set<AnyCancellable>()

  init(userProfile: UserProfile) {
    self.userProfile = userProfile
  }

  func submitProfile(authenticator: Authenticator) {
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
  @ObservedObject private var viewModel: NewAppleSignupViewModel
  let showProfileEditView: () -> Void

  init(userProfile: UserProfile, showProfileEditView: @escaping () -> Void) {
    self.showProfileEditView = showProfileEditView
    self.viewModel = NewAppleSignupViewModel(userProfile: userProfile)
  }

  var body: some View {
    VStack(spacing: 28) {
      Text("Welcome to Omnivore!")
        .font(.appTitle)
        .multilineTextAlignment(.center)

      VStack(alignment: .center, spacing: 12) {
        Text("Your username is:")
          .font(.appBody)
          .foregroundColor(.appGrayText)
        Text("@\(viewModel.userProfile.username)")
          .font(.appHeadline)
          .foregroundColor(.appGrayText)
      }

      VStack {
        Button(
          action: { viewModel.submitProfile(authenticator: authenticator) },
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
