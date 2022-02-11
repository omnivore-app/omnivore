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
