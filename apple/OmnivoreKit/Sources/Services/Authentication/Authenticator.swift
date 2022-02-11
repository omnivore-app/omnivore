import AppAuth
import Combine
import Foundation
import Utils
import WebKit

public final class Authenticator: ObservableObject {
  public static var unregisterIntercomUser: (() -> Void)?

  public enum AuthStatus {
    case loggedOut
    case pendingUser
    case loggedIn
  }

  @Published public internal(set) var isLoggedIn: Bool
  @Published public internal(set) var isWaitlisted = false

  let networker: Networker

  var subscriptions = Set<AnyCancellable>()
  var currentAuthorizationFlow: OIDExternalUserAgentSession?
  var pendingUserToken: String?

  #if os(macOS)
    var authRedirectHandler: OIDRedirectHTTPHandler?
  #endif

  public init(networker: Networker) {
    self.networker = networker
    self.isLoggedIn = ValetKey.authToken.exists
  }

  public var omnivoreAuthCookieString: String? {
    ValetKey.authCookieString.value()
  }

  public var authToken: String? {
    ValetKey.authToken.value()
  }

  public func logout() {
    clearCreds()
    Authenticator.unregisterIntercomUser?()
    isLoggedIn = false
  }

  public func clearCreds() {
    clearCookies()
    ValetKey.removeAllKeys()
    UserDefaults.standard.removeObject(forKey: Keys.userIdKey)
  }

  public var hasValidAuthToken: Bool {
    guard let authToken = ValetKey.authToken.value() else { return false }
    // We could do a more thorough check by decoding the token and reading it's properties
    // but then we would have to store the jwt secret client side.
    return !authToken.isEmpty
  }

  public func updateWaitlistStatus(isWaitlistedUser: Bool) {
    isWaitlisted = isWaitlistedUser
  }

  private func clearCookies() {
    HTTPCookieStorage.shared.removeCookies(since: Date.distantPast)

    WKWebsiteDataStore.default().fetchDataRecords(ofTypes: WKWebsiteDataStore.allWebsiteDataTypes()) { records in
      records.forEach { record in
        WKWebsiteDataStore.default().removeData(ofTypes: record.dataTypes, for: [record], completionHandler: {})
      }
    }
  }
}
