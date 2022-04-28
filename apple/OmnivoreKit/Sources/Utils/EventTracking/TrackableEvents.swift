import Foundation

public enum TrackableEvent {
  case linkRead(linkID: String, slug: String, originalArticleURL: String)
}

public extension TrackableEvent {
  var name: String {
    switch self {
    case .linkRead:
      return "link_read"
    }
  }

  var properties: [String: String]? {
    switch self {
    case let .linkRead(linkID: linkID, slug: slug, originalArticleURL: originalArticleURL):
      return [
        "link": linkID,
        "slug": slug,
        "url": originalArticleURL
      ]
    }
  }
}
