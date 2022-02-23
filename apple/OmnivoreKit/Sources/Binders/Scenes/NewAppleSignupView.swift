import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

extension NewAppleSignupViewModel {
  static func make(
    services: Services,
    userProfile: UserProfile,
    showProfileEditView: @escaping () -> Void
  ) -> NewAppleSignupViewModel {
    let viewModel = NewAppleSignupViewModel(userProfile: userProfile)
    viewModel.bind(services: services, showProfileEditView: showProfileEditView)
    return viewModel
  }

  func bind(services: Services, showProfileEditView: @escaping () -> Void) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case let .acceptProfile(userProfile: userProfile):
        self?.submitProfile(userProfile: userProfile, authenticator: services.authenticator)
      case .changeProfile:
        showProfileEditView()
      }
    }
    .store(in: &subscriptions)
  }

  private func submitProfile(userProfile: UserProfile, authenticator: Authenticator) {
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

final class NewAppleSignupViewModel: ObservableObject {
  let userProfile: UserProfile
  @Published var loginError: LoginError?

  enum Action {
    case acceptProfile(userProfile: UserProfile)
    case changeProfile
  }

  var subscriptions = Set<AnyCancellable>()
  let performActionSubject = PassthroughSubject<Action, Never>()

  init(userProfile: UserProfile) {
    self.userProfile = userProfile
  }
}

struct NewAppleSignupView: View {
  @ObservedObject private var viewModel: NewAppleSignupViewModel

  init(viewModel: NewAppleSignupViewModel) {
    self.viewModel = viewModel
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
          action: { viewModel.performActionSubject.send(.acceptProfile(userProfile: viewModel.userProfile)) },
          label: { Text("Continue") }
        )
        .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

        Button(
          action: { viewModel.performActionSubject.send(.changeProfile) },
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
