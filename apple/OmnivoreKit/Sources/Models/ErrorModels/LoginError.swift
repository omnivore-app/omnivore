import Foundation

public enum LoginError: Error {
  case unauthorized
  case network
  case unknown
  case pendingEmailVerification
}
