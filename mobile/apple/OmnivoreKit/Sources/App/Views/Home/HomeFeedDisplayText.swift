import Foundation
import Models
import Views

// extension InboxFilters {
//  var displayName: String {
//    switch self {
//    case .inbox:
//      return LocalText.inboxGeneric
//    case .readlater:
//      return LocalText.readLaterGeneric
//    case .newsletters:
//      return LocalText.newslettersGeneric
//    case .downloaded:
//      return "Downloaded"
//    case .feeds:
//      return "Feeds"
//    case .recommended:
//      return "Recommended"
//    case .all:
//      return LocalText.allGeneric
//    case .archived:
//      return LocalText.archivedGeneric
//    case .deleted:
//      return "Deleted"
//    case .hasHighlights:
//      return LocalText.highlightedGeneric
//    case .files:
//      return LocalText.filesGeneric
//    }
//  }
// }

public extension LinkedItemSort {
  var displayName: String {
    switch self {
    case .newest:
      return LocalText.newestGeneric
    case .oldest:
      return LocalText.oldestGeneric
    case .longest:
      return LocalText.longestGeneric
    case .shortest:
      return LocalText.shortestGeneric
    case .recentlyRead:
      return LocalText.recentlyReadGeneric
    case .recentlyPublished:
      return LocalText.recentlyPublishedGeneric
    }
  }
}
