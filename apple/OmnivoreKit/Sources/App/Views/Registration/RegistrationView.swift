import AuthenticationServices
import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

final class RegistrationViewModel: ObservableObject {
  enum RegistrationState {
    case createProfile(userProfile: UserProfile)
    case newAppleSignUp(userProfile: UserProfile)
  }

  @Published var loginError: LoginError?
  @Published var registrationState: RegistrationState?

  var subscriptions = Set<AnyCancellable>()

  func handleAppleSignInCompletion(result: Result<ASAuthorization, Error>, authenticator: Authenticator) {
    switch AppleSigninPayload.parse(authResult: result) {
    case let .success(payload):
      handleAppleToken(payload: payload, authenticator: authenticator)
    case let .failure(error):
      switch error {
      case .unauthorized, .unknown:
        break
      case .network:
        loginError = error
      }
    }
  }

  private func handleAppleToken(payload: AppleSigninPayload, authenticator: Authenticator) {
    authenticator.submitAppleToken(token: payload.token).sink(
      receiveCompletion: { [weak self] completion in
        guard case let .failure(loginError) = completion else { return }
        switch loginError {
        case .unauthorized, .unknown:
          self?.handleAppleSignUp(authenticator: authenticator, payload: payload)
        case .network:
          self?.loginError = loginError
        }
      },
      receiveValue: { _ in }
    )
    .store(in: &subscriptions)
  }

  private func handleAppleSignUp(authenticator: Authenticator, payload: AppleSigninPayload) {
    authenticator
      .createPendingAccountUsingApple(token: payload.token, name: payload.fullName)
      .sink(
        receiveCompletion: { [weak self] completion in
          guard case let .failure(loginError) = completion else { return }
          self?.loginError = loginError
        },
        receiveValue: { [weak self] userProfile in
          if userProfile.name.isEmpty {
            self?.registrationState = .createProfile(userProfile: userProfile)
          } else {
            self?.registrationState = .newAppleSignUp(userProfile: userProfile)
          }
        }
      )
      .store(in: &subscriptions)
  }

  func handleGoogleAuth(authenticator: Authenticator) async {
    guard let presentingViewController = presentingViewController() else { return }
    let googleAuthResponse = await authenticator.handleGoogleAuth(presenting: presentingViewController)

    switch googleAuthResponse {
    case let .loginError(error):
      loginError = error
    case .newOmnivoreUser:
      registrationState = .createProfile(userProfile: UserProfile(username: "", name: ""))
    case .existingOmnivoreUser:
      break
    }
  }
}

private func presentingViewController() -> PlatformViewController? {
  #if os(iOS)
    let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene
    return scene?.windows
      .filter(\.isKeyWindow)
      .first?
      .rootViewController
  #elseif os(macOS)
    return nil
  #endif
}
