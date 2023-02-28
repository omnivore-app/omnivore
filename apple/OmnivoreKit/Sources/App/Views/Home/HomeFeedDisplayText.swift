import Foundation
import Models
import Views

extension LinkedItemFilter {
  var displayName: String {
    switch self {
    case .inbox:
      return LocalText.inboxGeneric
    case .readlater:
      return LocalText.readLaterGeneric
    case .newsletters:
      return LocalText.newslettersGeneric
    case .recommended:
      return "Recommended"
    case .all:
      return LocalText.allGeneric
    case .archived:
      return LocalText.archivedGeneric
    case .hasHighlights:
      return LocalText.highlightedGeneric
    case .files:
      return LocalText.filesGeneric
    }
  }
}

public extension LinkedItemSort {
  var displayName: String {
    switch self {
    case .newest:
      return LocalText.newestGeneric
    case .oldest:
      return LocalText.oldestGeneric
    case .recentlyRead:
      return LocalText.recentlyReadGeneric
    case .recentlyPublished:
      return LocalText.recentlyPublishedGeneric
    }
  }
}
