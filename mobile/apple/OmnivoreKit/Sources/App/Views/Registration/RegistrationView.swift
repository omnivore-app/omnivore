import AuthenticationServices
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class RegistrationViewModel: ObservableObject {
  enum RegistrationState {
    case createProfile(userProfile: NewUserProfile)
    case newAppleSignUp(userProfile: NewUserProfile)
  }

  @Published var loginError: LoginError?
  @Published var registrationState: RegistrationState?

  func handleAppleSignInCompletion(result: Result<ASAuthorization, Error>, authenticator: Authenticator) {
    switch AppleSigninPayload.parse(authResult: result) {
    case let .success(payload):
      Task { await handleAppleToken(payload: payload, authenticator: authenticator) }
    case let .failure(error):
      switch error {
      case .unauthorized, .unknown, .pendingEmailVerification:
        break
      case .network:
        loginError = error
      }
    }
  }

  private func handleAppleToken(payload: AppleSigninPayload, authenticator: Authenticator) async {
    do {
      try await authenticator.submitAppleToken(token: payload.token)
    } catch {
      let submitTokenError = (error as? LoginError) ?? .unknown
      switch submitTokenError {
      case .unauthorized, .unknown, .pendingEmailVerification:
        await handleAppleSignUp(authenticator: authenticator, payload: payload)
      case .network:
        loginError = submitTokenError
      }
    }
  }

  private func handleAppleSignUp(authenticator: Authenticator, payload: AppleSigninPayload) async {
    do {
      let pendingUserProfile = try await authenticator.createPendingAccountUsingApple(
        token: payload.token,
        name: payload.fullName
      )
      if pendingUserProfile.name.isEmpty {
        registrationState = .createProfile(userProfile: pendingUserProfile)
      } else {
        registrationState = .newAppleSignUp(userProfile: pendingUserProfile)
      }
    } catch {
      loginError = (error as? LoginError) ?? .unknown
    }
  }

  func handleGoogleAuth(authenticator: Authenticator) async {
    let presentingVC = presentingViewController()
    let googleAuthResponse = await authenticator.handleGoogleAuth(presentingVC: presentingVC)

    switch googleAuthResponse {
    case let .loginError(error):
      loginError = error
    case .newOmnivoreUser:
      registrationState = .createProfile(userProfile: NewUserProfile(username: "", name: ""))
    case .existingOmnivoreUser:
      break
    }
  }
}

@MainActor private func presentingViewController() -> PlatformViewController? {
  #if os(iOS)
    let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene
    return scene?.windows
      .filter(\.isKeyWindow)
      .first?
      .rootViewController
  #elseif os(macOS)
    return NSApplication.shared.windows.first
  #endif
}
