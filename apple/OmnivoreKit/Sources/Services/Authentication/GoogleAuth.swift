import AppAuth
import Combine
import Foundation
import Models
import Utils

#if os(iOS)
  import UIKit

  public extension Authenticator {
    func handleGoogleAuth(presentingViewController: PlatformViewController?) -> AnyPublisher<Bool, LoginError> {
      Future { [weak self] promise in
        guard let self = self, let presenting = presentingViewController else { return }

        // swiftlint:disable:next line_length
        self.currentAuthorizationFlow = OIDAuthState.authState(byPresenting: self.googleAuthRequest(redirectURL: nil), presenting: presenting) { authState, authError in
          self.resolveAuthResponse(promise: promise, authState: authState, authError: authError)
        }
      }
      .eraseToAnyPublisher()
    }
  }
#endif

#if os(macOS)
  import AppKit

  public extension Authenticator {
    func handleGoogleAuth(presentingViewController _: PlatformViewController?) -> AnyPublisher<Bool, LoginError> {
      authRedirectHandler = OIDRedirectHTTPHandler(
        successURL: URL(string: "https://omnivore.app")!
      )
      let redirectURL = authRedirectHandler?.startHTTPListener(nil)
      let authRequest = googleAuthRequest(redirectURL: redirectURL)

      return Future { [weak self] promise in
        guard let self = self else { return }

        // swiftlint:disable:next line_length
        self.authRedirectHandler?.currentAuthorizationFlow = OIDAuthState.authState(byPresenting: authRequest) { authState, authError in
          NSRunningApplication.current.activate(options: [.activateAllWindows, .activateIgnoringOtherApps])
          self.resolveAuthResponse(promise: promise, authState: authState, authError: authError)
        }
      }
      .eraseToAnyPublisher()
    }
  }
#endif

private extension Authenticator {
  func resolveAuthResponse(
    promise: @escaping (Result<Bool, LoginError>) -> Void,
    authState: OIDAuthState?,
    authError: Error?
  ) {
    if let idToken = authState?.lastTokenResponse?.idToken {
      Task {
        do {
          let authPayload = try await networker.submitGoogleToken(idToken: idToken)
          try ValetKey.authCookieString.setValue(authPayload.commentedAuthCookieString)
          try ValetKey.authToken.setValue(authPayload.authToken)
          DispatchQueue.main.async {
            self.isLoggedIn = true
          }
        } catch {
          if let error = error as? LoginError {
            switch error {
            case .unauthorized, .unknown:
              self.resolveAuthResponseForAccountCreation(promise: promise, authState: authState, authError: authError)
            case .network:
              promise(.failure(error))
            }
            self.resolveAuthResponseForAccountCreation(promise: promise, authState: authState, authError: authError)
          }
        }
      }
    } else {
      resolveAuthResponseForAccountCreation(promise: promise, authState: authState, authError: authError)
    }
  }

  func resolveAuthResponseForAccountCreation(
    promise: @escaping (Result<Bool, LoginError>) -> Void,
    authState: OIDAuthState?,
    authError _: Error?
  ) {
    if let idToken = authState?.lastTokenResponse?.idToken {
      let params = CreatePendingAccountParams(token: idToken, provider: .google, fullName: nil)
      let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()

      networker
        .createPendingUser(params: encodedParams)
        .sink { completion in
          guard case let .failure(serverError) = completion else { return }
          promise(.failure(LoginError.make(serverError: serverError)))
        } receiveValue: { [weak self] in
          self?.pendingUserToken = $0.pendingUserToken
          promise(.success(true))
        }
        .store(in: &subscriptions)
    } else {
      promise(.failure(.unauthorized))
    }
  }

  func googleAuthRequest(redirectURL: URL?) -> OIDAuthorizationRequest {
    let authEndpoint = URL(string: "https://accounts.google.com/o/oauth2/v2/auth")!
    let tokenEndpoint = URL(string: "https://www.googleapis.com/oauth2/v4/token")!
    let iosClientGoogleId = AppKeys.sharedInstance?.iosClientGoogleId ?? ""
    let scopes = ["profile", "email"]

    return OIDAuthorizationRequest(
      configuration: OIDServiceConfiguration(authorizationEndpoint: authEndpoint, tokenEndpoint: tokenEndpoint),
      clientId: "\(iosClientGoogleId).apps.googleusercontent.com",
      scopes: scopes,
      redirectURL: redirectURL ?? URL(
        string: "com.googleusercontent.apps.\(iosClientGoogleId):/oauth2redirect/google"
      )!,
      responseType: "code",
      additionalParameters: nil
    )
  }
}
