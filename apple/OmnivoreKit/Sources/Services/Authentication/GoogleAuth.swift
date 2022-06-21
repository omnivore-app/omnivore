import Combine
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
  public func handleGoogleAuth(presenting: PlatformViewController) async -> GoogleAuthResponse {
    let authToken = try? await googleSignIn(presenting: presenting)
    guard let authToken = authToken else { return .loginError(error: .unauthorized) }
    // TODO: sync with server
    return .existingOmnivoreUser
  }

  func googleSignIn(presenting: PlatformViewController) async throws -> String {
    try await withCheckedThrowingContinuation { continuation in
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

// #if os(iOS)
//  import UIKit
//
//  public extension Authenticator {
//    func handleGoogleAuthDep(presentingViewController: PlatformViewController?) -> AnyPublisher<Bool, LoginError> {
//      Future { [weak self] promise in
//        guard let self = self, let presenting = presentingViewController else { return }
//
//        // swiftlint:disable:next line_length
//        self.currentAuthorizationFlow = OIDAuthState.authState(byPresenting: self.googleAuthRequest(redirectURL: nil), presenting: presenting) { authState, authError in
//          self.resolveAuthResponse(promise: promise, authState: authState, authError: authError)
//        }
//      }
//      .eraseToAnyPublisher()
//    }
//  }
// #endif

// #if os(macOS)
//  import AppKit
//
//  public extension Authenticator {
//    func handleGoogleAuthDep(presentingViewController _: PlatformViewController?) -> AnyPublisher<Bool, LoginError> {
//      authRedirectHandler = OIDRedirectHTTPHandler(
//        successURL: URL(string: "https://omnivore.app")!
//      )
//      let redirectURL = authRedirectHandler?.startHTTPListener(nil)
//      let authRequest = googleAuthRequest(redirectURL: redirectURL)
//
//      return Future { [weak self] promise in
//        guard let self = self else { return }
//
//        // swiftlint:disable:next line_length
//        self.authRedirectHandler?.currentAuthorizationFlow = OIDAuthState.authState(byPresenting: authRequest) { authState, authError in
//          NSRunningApplication.current.activate(options: [.activateAllWindows, .activateIgnoringOtherApps])
//          self.resolveAuthResponse(promise: promise, authState: authState, authError: authError)
//        }
//      }
//      .eraseToAnyPublisher()
//    }
//  }
// #endif

// private extension Authenticator {
//  func resolveAuthResponse(
//    promise: @escaping (Result<Bool, LoginError>) -> Void,
//    authState: OIDAuthState?,
//    authError: Error?
//  ) {
//    if let idToken = authState?.lastTokenResponse?.idToken {
//      Task {
//        do {
//          let authPayload = try await networker.submitGoogleToken(idToken: idToken)
//          try ValetKey.authCookieString.setValue(authPayload.commentedAuthCookieString)
//          try ValetKey.authToken.setValue(authPayload.authToken)
//          DispatchQueue.main.async {
//            self.isLoggedIn = true
//          }
//        } catch {
//          if let error = error as? LoginError {
//            switch error {
//            case .unauthorized, .unknown:
//              self.resolveAuthResponseForAccountCreation(promise: promise, authState: authState, authError: authError)
//            case .network:
//              promise(.failure(error))
//            }
//            self.resolveAuthResponseForAccountCreation(promise: promise, authState: authState, authError: authError)
//          }
//        }
//      }
//    } else {
//      resolveAuthResponseForAccountCreation(promise: promise, authState: authState, authError: authError)
//    }
//  }
//
//  func resolveAuthResponseForAccountCreation(
//    promise: @escaping (Result<Bool, LoginError>) -> Void,
//    authState: OIDAuthState?,
//    authError _: Error?
//  ) {
//    if let idToken = authState?.lastTokenResponse?.idToken {
//      let params = CreatePendingAccountParams(token: idToken, provider: .google, fullName: nil)
//      let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()
//
//      networker
//        .createPendingUser(params: encodedParams)
//        .sink { completion in
//          guard case let .failure(serverError) = completion else { return }
//          promise(.failure(LoginError.make(serverError: serverError)))
//        } receiveValue: { [weak self] in
//          self?.pendingUserToken = $0.pendingUserToken
//          promise(.success(true))
//        }
//        .store(in: &subscriptions)
//    } else {
//      promise(.failure(.unauthorized))
//    }
//  }
// }
