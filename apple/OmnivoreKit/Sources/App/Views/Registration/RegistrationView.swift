import AuthenticationServices
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class RegistrationViewModel: ObservableObject {
  enum RegistrationState {
    case createProfile(userProfile: UserProfile)
    case newAppleSignUp(userProfile: UserProfile)
  }

  @Published var loginError: LoginError?
  @Published var registrationState: RegistrationState?

  func handleAppleSignInCompletion(result: Result<ASAuthorization, Error>, authenticator: Authenticator) {
    switch AppleSigninPayload.parse(authResult: result) {
    case let .success(payload):
      Task { await handleAppleToken(payload: payload, authenticator: authenticator) }
    case let .failure(error):
      switch error {
      case .unauthorized, .unknown:
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
      case .unauthorized, .unknown:
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
