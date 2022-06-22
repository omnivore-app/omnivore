import Foundation
import GoogleSignIn
import Models
import Utils

public enum GoogleAuthResponse {
  case loginError(error: LoginError)
  case newOmnivoreUser
  case existingOmnivoreUser
}

extension Authenticator {
  public func handleGoogleAuth() async -> GoogleAuthResponse {
    let idToken = try? await googleSignIn()
    guard let idToken = idToken else { return .loginError(error: .unauthorized) }

    do {
      let authPayload = try await networker.submitGoogleToken(idToken: idToken)
      try ValetKey.authCookieString.setValue(authPayload.commentedAuthCookieString)
      try ValetKey.authToken.setValue(authPayload.authToken)
      DispatchQueue.main.async {
        self.isLoggedIn = true
      }
      return .existingOmnivoreUser
    } catch {
      let loginError = (error as? LoginError) ?? .unknown

      switch loginError {
      case .unauthorized, .unknown:
        return await createPendingUser(idToken: idToken)
      case .network:
        return .loginError(error: .network)
      }
    }
  }

  func createPendingUser(idToken: String) async -> GoogleAuthResponse {
    do {
      let params = CreatePendingAccountParams(token: idToken, provider: .google, fullName: nil)
      let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()
      let pendingUserAuthPayload = try await networker.createPendingUser(params: encodedParams)
      pendingUserToken = pendingUserAuthPayload.pendingUserToken
      return .newOmnivoreUser
    } catch {
      let loginError = LoginError.make(serverError: (error as? ServerError) ?? .unknown)
      return .loginError(error: loginError)
    }
  }

  func googleSignIn() async throws -> String {
    #if os(iOS)
      let presenting = presentingViewController()
    #else
      let presenting = await NSApplication.shared.mainWindow
    #endif

    guard let presenting = presenting else {
      throw LoginError.unknown
    }
    return try await withCheckedThrowingContinuation { continuation in

      let clientID = "\(AppKeys.sharedInstance?.iosClientGoogleId ?? "").apps.googleusercontent.com"

      GIDSignIn.sharedInstance.signIn(
        with: GIDConfiguration(clientID: clientID),
        presenting: presenting
      ) { user, error in
        guard let user = user, error == nil else {
          continuation.resume(throwing: LoginError.unauthorized)
          return
        }

        user.authentication.do { authentication, error in
          guard let idToken = authentication?.idToken, error == nil else {
            continuation.resume(throwing: LoginError.unauthorized)
            return
          }

          continuation.resume(returning: idToken)
        }
      }
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
