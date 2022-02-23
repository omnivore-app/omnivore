import AuthenticationServices
import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

public final class RegistrationViewModel: ObservableObject {
  @Published public var loginError: LoginError?
  @Published public var createProfileViewModel: CreateProfileViewModel?
  @Published public var newAppleSignupViewModel: NewAppleSignupViewModel?

  public enum Action {
    case googleButtonTapped
    case appleSignInCompleted(result: Result<ASAuthorization, Error>)
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init() {}
}

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

public struct RegistrationView: View {
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @ObservedObject private var viewModel: RegistrationViewModel

  public init(viewModel: RegistrationViewModel) {
    self.viewModel = viewModel
  }

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
            viewModel.performActionSubject.send(.appleSignInCompleted(result: $0))
          }

          if AppKeys.sharedInstance?.iosClientGoogleId != nil {
            GoogleAuthButton {
              viewModel.performActionSubject.send(.googleButtonTapped)
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

  public var body: some View {
    if let createProfileViewModel = viewModel.createProfileViewModel {
      CreateProfileView(viewModel: createProfileViewModel)
    } else if let newAppleSignupViewModel = viewModel.newAppleSignupViewModel {
      NewAppleSignupView(viewModel: newAppleSignupViewModel)
    } else {
      authenticationView
    }
  }
}
