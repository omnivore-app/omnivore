import Foundation
import Utils

public enum AppEnvironment: String {
  case local
  case prod
  case demo
  case test
  case custom

  public static let initialAppEnvironment: AppEnvironment = {
    #if DEBUG
      #if targetEnvironment(simulator)
        return .demo // could also return .local here
      #else
        return .demo
      #endif
    #else
      return .prod
    #endif
  }()
}

private let devBaseURL = "https://api-dev.omnivore.app"
private let demoBaseURL = "https://api-demo.omnivore.app"
private let prodBaseURL = "https://api-prod.omnivore.app"

private let demoTtsURL = "https://tts-demo.omnivore.app"
private let prodTtsURL = "https://tts-prod.omnivore.app"

private let devWebURL = "https://web-dev.omnivore.app"
private let demoWebURL = "https://demo.omnivore.app"
private let prodWebURL = "https://omnivore.app"

public enum AppEnvironmentUserDefaultKey: String {
  case serverBaseURL = "AppEnvironment_serverBaseURL"
  case webAppBaseURL = "AppEnvironment_webAppBaseURL"
  case ttsBaseURL = "AppEnvironment_ttsBaseURL"
}

public extension AppEnvironment {
  static func setCustom(serverBaseURL: String, webAppBaseURL: String, ttsBaseURL: String) {
    guard let sharedDefaults = UserDefaults(suiteName: "group.app.omnivoreapp") else {
      fatalError("Could not create shared user defaults")
    }
    sharedDefaults.set(
      serverBaseURL.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines),
      forKey: AppEnvironmentUserDefaultKey.serverBaseURL.rawValue
    )
    sharedDefaults.set(
      webAppBaseURL.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines),
      forKey: AppEnvironmentUserDefaultKey.webAppBaseURL.rawValue
    )
    sharedDefaults.set(
      ttsBaseURL.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines),
      forKey: AppEnvironmentUserDefaultKey.ttsBaseURL.rawValue
    )
  }

  var environmentConfigured: Bool {
    if self == .custom {
      guard
        let sharedDefaults = UserDefaults(suiteName: "group.app.omnnivoreapp"),
        let str = sharedDefaults.string(forKey: AppEnvironmentUserDefaultKey.serverBaseURL.rawValue),
        let url = URL(string: str) 
      else {
        return false
      }
      return true
    }
    return true
  }

  var graphqlPath: String {
    "\(serverBaseURL.absoluteString)/api/graphql"
  }

  var name: String {
    switch self {
    case .demo:
      return "Demo"
    case .prod:
      return "Production"
    case .test:
      return "Test"
    case .local:
      return "Local"
    case .custom:
      return "Self hosted"
    }
  }

  var serverBaseURL: URL {
    switch self {
    case .demo:
      return URL(string: demoBaseURL)!
    case .prod:
      return URL(string: prodBaseURL)!
    case .test, .local:
      return URL(string: "http://localhost:4000")!
    case .custom:
      guard
        let sharedDefaults = UserDefaults(suiteName: "group.app.omnnivoreapp"),
        let str = sharedDefaults.string(forKey: AppEnvironmentUserDefaultKey.serverBaseURL.rawValue),
        let url = URL(string: str)
      else {
        fatalError("custom serverBaseURL not set")
      }
      return url
    }
  }

  var webAppBaseURL: URL {
    switch self {
    case .demo:
      return URL(string: demoWebURL)!
    case .prod:
      return URL(string: prodWebURL)!
    case .test, .local:
      return URL(string: "http://localhost:3000")!
    case .custom:
      guard
        let sharedDefaults = UserDefaults(suiteName: "group.app.omnnivoreapp"),
        let str = sharedDefaults.string(forKey: AppEnvironmentUserDefaultKey.webAppBaseURL.rawValue),
        let url = URL(string: str)
      else {
        fatalError("custom webAppBaseURL not set")
      }
      return url
    }
  }

  var ttsBaseURL: URL {
    switch self {
    case .demo:
      return URL(string: demoTtsURL)!
    case .prod:
      return URL(string: prodTtsURL)!
    case .test, .local:
      return URL(string: "http://localhost:8080")!
    case .custom:
      guard
        let sharedDefaults = UserDefaults(suiteName: "group.app.omnnivoreapp"),
        let str = sharedDefaults.string(forKey: AppEnvironmentUserDefaultKey.ttsBaseURL.rawValue),
        let url = URL(string: str)
      else {
        fatalError("custom ttsBaseURL not set")
      }
      return url
    }
  }
}
