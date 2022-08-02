import Foundation
import Models
import Valet

public enum PublicValet {
  public static var storedAppEnvironment: AppEnvironment? {
    ValetKey.appEnvironmentString.value().flatMap { AppEnvironment(rawValue: $0) }
  }

  public static var authToken: String? {
    ValetKey.authToken.value()
  }
}

enum ValetKey: String {
  case authToken = "app.omnivore.valet.auth-token"
  case authCookieString = "app.omnivore.valet.auth-cookie-raw-string"
  case appEnvironmentString = "app.omnivore.valet.app-environment"
}

extension ValetKey {
  var exists: Bool {
    value() != nil
  }

  func value() -> String? {
    try? ValetKey.valet.string(forKey: rawValue)
  }

  func setValue(_ value: String) throws {
    try ValetKey.valet.setString(value, forKey: rawValue)
  }

  static func removeAllKeys() {
    try? ValetKey.valet.removeAllObjects()
  }

  private static let valet = Valet.sharedGroupValet(with: appGroupIdentifier, accessibility: .afterFirstUnlock)

  private static let appGroupIdentifier: SharedGroupIdentifier = {
    #if os(macOS)
      return SharedGroupIdentifier(appIDPrefix: "QJF2XZ86HB", nonEmptyGroup: "app.omnivoreapp.shared")!
    #endif

    #if os(iOS)
      return SharedGroupIdentifier(groupPrefix: "group", nonEmptyGroup: "app.omnivoreapp")!
    #endif
  }()
}
