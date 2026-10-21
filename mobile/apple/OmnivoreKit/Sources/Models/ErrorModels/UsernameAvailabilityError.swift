import Foundation

public enum PotentialUsernameStatus {
  case tooShort
  case tooLong
  case invalidPattern
  case unavailable
  case available
  case noUsername
}

public enum UsernameAvailabilityError: Error {
  case tooShort
  case tooLong
  case invalidPattern
  case nameUnavailable
  case internalServer
  case network
  case unknown
}

public extension PotentialUsernameStatus {
  static func validationError(username: String) -> PotentialUsernameStatus? {
    if username.count == 0 { return .noUsername }
    if username.count < 4 { return .tooShort }
    if username.count > 15 { return .tooLong }
    if hasInvalidPattern(username: username) { return .invalidPattern }

    return nil
  }

  private static func hasInvalidPattern(username: String) -> Bool {
    let usernamePattern = #"^[a-z0-9][a-z0-9_]+[a-z0-9]$"#

    let match = username.range(
      of: usernamePattern,
      options: .regularExpression
    )

    return match == nil
  }
}
