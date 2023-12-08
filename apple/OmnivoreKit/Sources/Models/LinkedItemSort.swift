import Foundation

public enum LinkedItemSort: String, CaseIterable {
  case newest
  case oldest
  case shortest
  case longest
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
    case .longest:
      return "sort:wordsCount-desc"
    case .shortest:
      return "sort:wordsCount-asc"
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
    case .shortest:
      return [NSSortDescriptor(keyPath: \LibraryItem.wordsCount, ascending: true)]
    case .longest:
      return [NSSortDescriptor(keyPath: \LibraryItem.wordsCount, ascending: false)]
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
