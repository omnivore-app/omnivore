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

  func handleGoogleAuth(authenticator: Authenticator) {
    authenticator
      .handleGoogleAuth(presentingViewController: presentingViewController())
      .sink(
        receiveCompletion: { [weak self] completion in
          guard case let .failure(loginError) = completion else { return }
          self?.loginError = loginError
        },
        receiveValue: { [weak self] isNewAccount in
          if isNewAccount {
            self?.registrationState = .createProfile(userProfile: UserProfile(username: "", name: ""))
          }
        }
      )
      .store(in: &subscriptions)
  }
}

struct RegistrationView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @StateObject private var viewModel = RegistrationViewModel()

  var authenticationView: some View {
    VStack(spacing: 0) {
      VStack(spacing: 28) {
        if horizontalSizeClass == .regular {
          Spacer()
        }

        VStack(alignment: .center, spacing: 16) {
          Text(LocalText.registrationViewHeadline)
            .font(.appTitle)
            .multilineTextAlignment(.center)
            .padding(.bottom, horizontalSizeClass == .compact ? 0 : 50)
            .padding(.top, horizontalSizeClass == .compact ? 30 : 0)

          AppleSignInButton {
            viewModel.handleAppleSignInCompletion(result: $0, authenticator: authenticator)
          }

          if AppKeys.sharedInstance?.iosClientGoogleId != nil {
            GoogleAuthButton {
              viewModel.handleGoogleAuth(authenticator: authenticator)
            }
          }
        }

        if let loginError = viewModel.loginError {
          LoginErrorMessageView(loginError: loginError)
        }

        Spacer()
      }
      .frame(maxWidth: 316)
      .padding(.horizontal, 16)
    }
  }

  var body: some View {
    if let registrationState = viewModel.registrationState {
      if case let RegistrationViewModel.RegistrationState.createProfile(userProfile) = registrationState {
        CreateProfileView(userProfile: userProfile)
      } else if case let RegistrationViewModel.RegistrationState.newAppleSignUp(userProfile) = registrationState {
        NewAppleSignupView(
          userProfile: userProfile,
          showProfileEditView: { viewModel.registrationState = .createProfile(userProfile: userProfile) }
        )
      } else {
        authenticationView
      }
    } else {
      authenticationView
    }
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
