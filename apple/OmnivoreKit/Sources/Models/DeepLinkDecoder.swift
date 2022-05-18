import Foundation

public struct LinkRequest: Identifiable, Hashable {
  public let id: UUID
  public let serverID: String

  public init(id: UUID, serverID: String) {
    self.id = id
    self.serverID = serverID
  }
}

public enum DeepLink {
  case webAppLinkRequest(requestID: String)
}

public extension DeepLink {
  var linkRequestID: String? {
    if case let DeepLink.webAppLinkRequest(requestID) = self {
      return requestID
    }
    return nil
  }

  static func make(from url: URL) -> DeepLink? {
    if url.scheme == "omnivore" {
      return deepLinkFromOmnivoreScheme(url: url)
    }

    return nil
  }

  private static func deepLinkFromOmnivoreScheme(url: URL) -> DeepLink? {
    switch url.host {
    case "shareExtensionRequestID":
      let requestID = url.path.replacingOccurrences(of: "/", with: "")
      return .webAppLinkRequest(requestID: requestID)
    default:
      return nil
    }
  }
}

// Example deep links
// "omnivore://shareExtensionRequestID/sampleRequestID"
