import Foundation
import Utils

public enum AppEnvironment: String {
  case local
  case dev
  case prod
  case demo
  case test

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

public extension AppEnvironment {
  var graphqlPath: String {
    "\(serverBaseURL.absoluteString)/api/graphql"
  }

  var serverBaseURL: URL {
    switch self {
    case .dev:
      return URL(string: devBaseURL)!
    case .demo:
      return URL(string: demoBaseURL)!
    case .prod:
      return URL(string: prodBaseURL)!
    case .test, .local:
      return URL(string: "http://localhost:4000")!
    }
  }

  var webAppBaseURL: URL {
    switch self {
    case .dev:
      return URL(string: devWebURL)!
    case .demo:
      return URL(string: demoWebURL)!
    case .prod:
      return URL(string: prodWebURL)!
    case .test, .local:
      return URL(string: "http://localhost:3000")!
    }
  }

  var ttsBaseURL: URL {
    switch self {
    case .dev:
      return URL(string: "notimplemented")!
    case .demo:
      return URL(string: demoTtsURL)!
    case .prod:
      return URL(string: prodTtsURL)!
    case .test, .local:
      return URL(string: "http://localhost:4000")!
    }
  }
}
