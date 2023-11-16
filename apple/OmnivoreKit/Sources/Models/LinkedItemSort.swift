import Foundation

public enum LinkedItemSort: String, CaseIterable {
  case newest
  case oldest
  case recentlyRead
  case recentlyPublished
}

public extension LinkedItemSort {
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
      return [NSSortDescriptor(keyPath: \LibraryItem.savedAt, ascending: false)]
    case .oldest:
      return [NSSortDescriptor(keyPath: \LibraryItem.savedAt, ascending: true)]
    case .recentlyRead:
      return [
        NSSortDescriptor(keyPath: \LibraryItem.readAt, ascending: false),
        NSSortDescriptor(keyPath: \LibraryItem.savedAt, ascending: false)
      ]
    case .recentlyPublished:
      return [NSSortDescriptor(keyPath: \LibraryItem.publishDate, ascending: false)]
    }
  }
}
