import AuthenticationServices
import Models
import Services
import SwiftUI
import Utils
import Views

extension RegistrationViewModel {
  static func make(services: Services) -> RegistrationViewModel {
    let viewModel = RegistrationViewModel()
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      self?.loginError = nil

      switch action {
      case .googleButtonTapped:
        self?.handleGoogleAuth(services: services)
      case let .appleSignInCompleted(result: result):
        switch AppleSigninPayload.parse(authResult: result) {
        case let .success(payload):
          self?.handleAppleToken(payload: payload, services: services)
        case let .failure(error):
          switch error {
          case .unauthorized, .unknown:
            break
          case .network:
            self?.loginError = error
          }
        }
      }
    }
    .store(in: &subscriptions)
  }

  private func handleAppleToken(payload: AppleSigninPayload, services: Services) {
    services.authenticator.submitAppleToken(token: payload.token).sink(
      receiveCompletion: { [weak self] completion in
        guard case let .failure(loginError) = completion else { return }
        switch loginError {
        case .unauthorized, .unknown:
          self?.handleAppleSignUp(services: services, payload: payload)
        case .network:
          self?.loginError = loginError
        }
      },
      receiveValue: { _ in }
    )
    .store(in: &subscriptions)
  }

  private func handleAppleSignUp(services: Services, payload: AppleSigninPayload) {
    services.authenticator
      .createPendingAccountUsingApple(token: payload.token, name: payload.fullName)
      .sink(
        receiveCompletion: { [weak self] completion in
          guard case let .failure(loginError) = completion else { return }
          self?.loginError = loginError
        },
        receiveValue: { [weak self] userProfile in
          if userProfile.name.isEmpty {
            self?.showProfileEditView(services: services, pendingUserProfile: userProfile)
          } else {
            self?.newAppleSignupViewModel = NewAppleSignupViewModel.make(
              services: services,
              userProfile: userProfile,
              showProfileEditView: {
                self?.showProfileEditView(services: services, pendingUserProfile: userProfile)
              }
            )
          }
        }
      )
      .store(in: &subscriptions)
  }

  private func handleGoogleAuth(services: Services) {
    services.authenticator
      .handleGoogleAuth(presentingViewController: presentingViewController())
      .sink(
        receiveCompletion: { [weak self] completion in
          guard case let .failure(loginError) = completion else { return }
          self?.loginError = loginError
        },
        receiveValue: { [weak self] isNewAccount in
          if isNewAccount {
            let pendingUserProfile = UserProfile(username: "", name: "")
            self?.showProfileEditView(services: services, pendingUserProfile: pendingUserProfile)
          }
        }
      )
      .store(in: &subscriptions)
  }

  func showProfileEditView(services: Services, pendingUserProfile: UserProfile) {
    createProfileViewModel = CreateProfileViewModel.make(
      services: services,
      pendingUserProfile: pendingUserProfile
    )
    newAppleSignupViewModel = nil
  }
}

private func presentingViewController() -> PlatformViewController? {
  #if os(iOS)
    return UIApplication.shared.windows
      .filter(\.isKeyWindow)
      .first?
      .rootViewController
  #elseif os(macOS)
    return nil
  #endif
}
