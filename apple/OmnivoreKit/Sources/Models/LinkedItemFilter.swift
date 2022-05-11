import Foundation

public enum LinkedItemFilter: CaseIterable {
  case inbox
  case all
  case archived
  case files
}

public extension LinkedItemFilter {
  var displayName: String {
    switch self {
    case .inbox:
      return "Inbox"
    case .all:
      return "All"
    case .archived:
      return "Archived"
    case .files:
      return "Files"
    }
  }

  var queryString: String {
    switch self {
    case .inbox:
      return "in:inbox"
    case .all:
      return "in:all"
    case .archived:
      return "in:archive"
    case .files:
      return "type:file"
    }
  }

  var predicate: NSPredicate {
    let undeletedPredicate = NSPredicate(
      format: "%K != %i", #keyPath(LinkedItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue)
    )

    switch self {
    case .inbox:
      // non-archived items
      let notInArchivePredicate = NSPredicate(
        format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: false) as NSNumber
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate])
    case .all:
      // include everything undeleted
      return undeletedPredicate
    case .archived:
      let inArchivePredicate = NSPredicate(
        format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: true) as NSNumber
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, inArchivePredicate])
    case .files:
      // include pdf only
      let isPDFPredicate = NSPredicate(
        format: "%K == %@", #keyPath(LinkedItem.contentReader), "PDF"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, isPDFPredicate])
    }
  }
}
