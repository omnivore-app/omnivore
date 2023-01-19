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

private enum AppEnvironmentUserDefaultKey: String {
  case serverBaseURL = "AppEnvironment_serverBaseURL"
  case webAppBaseURL = "AppEnvironment_webAppBaseURL"
  case ttsBaseURL = "AppEnvironment_ttsBaseURL"
}

public extension AppEnvironment {
  static func setCustom(serverBaseURL: String, webAppBaseURL: String, ttsBaseURL: String) {
    UserDefaults.standard.set(serverBaseURL, forKey: AppEnvironmentUserDefaultKey.serverBaseURL.rawValue)
    UserDefaults.standard.set(webAppBaseURL, forKey: AppEnvironmentUserDefaultKey.webAppBaseURL.rawValue)
    UserDefaults.standard.set(ttsBaseURL, forKey: AppEnvironmentUserDefaultKey.ttsBaseURL.rawValue)
  }

  var graphqlPath: String {
    "\(serverBaseURL.absoluteString)/api/graphql"
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
      guard let str = UserDefaults.standard.string(forKey: AppEnvironmentUserDefaultKey.serverBaseURL.rawValue), let url = URL(string: str) else {
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
      guard let str = UserDefaults.standard.string(forKey: AppEnvironmentUserDefaultKey.webAppBaseURL.rawValue), let url = URL(string: str) else {
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
      return URL(string: "http://localhost:4000")!
    case .custom:
      guard let str = UserDefaults.standard.string(forKey: AppEnvironmentUserDefaultKey.ttsBaseURL.rawValue), let url = URL(string: str) else {
        fatalError("custom ttsBaseURL not set")
      }
      return url
    }
  }
}
