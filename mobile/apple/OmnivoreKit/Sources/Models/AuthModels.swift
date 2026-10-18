import Foundation

public struct AuthVerification: Decodable {
  public let authStatus: AuthStatus
}

public enum AuthStatus: String, Decodable {
  case authenticated = "AUTHENTICATED"
  case unAuthenticated = "NOT_AUTHENTICATED"

  public var isAuthenticated: Bool {
    self == .authenticated
  }
}
