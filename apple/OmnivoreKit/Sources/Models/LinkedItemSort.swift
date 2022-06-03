import Foundation

public enum LinkedItemSort: String, CaseIterable {
  case newest
  case oldest
  // case recentlyRead
  case recentlyPublished
//  case relevance
}

public extension LinkedItemSort {
  var displayName: String {
    switch self {
    case .newest:
      return "Newest"
    case .oldest:
      return "Oldest"
//    case .recentlyRead:
//      return "Recently Read"
    case .recentlyPublished:
      return "Recently Published"
//    case .relevance:
//      return "Relevance"
    }
  }

  var queryString: String {
    switch self {
    case .newest:
      return "sort:saved"
    case .oldest:
      return "sort:saved-ASC"
//    case .recentlyRead:
//      return "sort:updated"
    case .recentlyPublished:
      return "sort:published"
//    case .relevance:
//      return "relevance"
    }
  }

  var sortDescriptors: [NSSortDescriptor] {
    switch self {
    case .newest /* , .relevance */:
      return [NSSortDescriptor(keyPath: \LinkedItem.createdAt, ascending: false)]
    case .oldest:
      return [NSSortDescriptor(keyPath: \LinkedItem.createdAt, ascending: true)]
//    case .recentlyRead:
//      return [NSSortDescriptor(keyPath: \LinkedItem.updatedAt, ascending: false)]
    case .recentlyPublished:
      return [NSSortDescriptor(keyPath: \LinkedItem.publishDate, ascending: false)]
    }
  }
}
