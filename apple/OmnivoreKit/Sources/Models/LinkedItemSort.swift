import Foundation

public enum LinkedItemSort: String, CaseIterable {
  case newest
  case oldest
  case recentlyRead
  case recentlyPublished
}

public extension LinkedItemSort {
  var displayName: String {
    switch self {
    case .newest:
      return "Newest"
    case .oldest:
      return "Oldest"
    case .recentlyRead:
      return "Recently Read"
    case .recentlyPublished:
      return "Recently Published"
    }
  }

  var queryString: String {
    switch self {
    case .newest:
      return "sort:saved"
    case .oldest:
      return "sort:saved-ASC"
    case .recentlyRead:
      return "sort:read"
    case .recentlyPublished:
      return "sort:published"
    }
  }

  var sortDescriptors: [NSSortDescriptor] {
    switch self {
    case .newest:
      return [NSSortDescriptor(keyPath: \LinkedItem.savedAt, ascending: false)]
    case .oldest:
      return [NSSortDescriptor(keyPath: \LinkedItem.savedAt, ascending: true)]
    case .recentlyRead:
      return [NSSortDescriptor(keyPath: \LinkedItem.updatedAt, ascending: false)]
    case .recentlyPublished:
      return [NSSortDescriptor(keyPath: \LinkedItem.publishDate, ascending: false)]
    }
  }
}
