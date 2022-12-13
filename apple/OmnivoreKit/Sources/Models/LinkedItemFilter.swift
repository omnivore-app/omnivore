import Foundation

public enum LinkedItemFilter: String, CaseIterable {
  case inbox
  case readlater
  case newsletters
  case recommended
  case all
  case archived
  case hasHighlights
  case files
}

public extension LinkedItemFilter {
  var displayName: String {
    switch self {
    case .inbox:
      return "Inbox"
    case .readlater:
      return "Read Later"
    case .newsletters:
      return "Newsletters"
    case .recommended:
      return "Recommended"
    case .all:
      return "All"
    case .archived:
      return "Archived"
    case .hasHighlights:
      return "Highlighted"
    case .files:
      return "Files"
    }
  }

  var queryString: String {
    switch self {
    case .inbox:
      return "in:inbox"
    case .readlater:
      return "in:inbox -label:Newsletter"
    case .newsletters:
      return "in:inbox label:Newsletter"
    case .recommended:
      return "recommendedBy:*"
    case .all:
      return "in:all"
    case .archived:
      return "in:archive"
    case .hasHighlights:
      return "has:highlights"
    case .files:
      return "type:file"
    }
  }

  var predicate: NSPredicate {
    let undeletedPredicate = NSPredicate(
      format: "%K != %i", #keyPath(LinkedItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue)
    )
    let notInArchivePredicate = NSPredicate(
      format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: false) as NSNumber
    )

    switch self {
    case .inbox:
      // non-archived items
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate])
    case .readlater:
      // non-archived or deleted items without the Newsletter label
      let nonNewsletterLabelPredicate = NSPredicate(
        format: "NOT SUBQUERY(labels, $label, $label.name == \"Newsletter\") .@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [
        undeletedPredicate, notInArchivePredicate, nonNewsletterLabelPredicate
      ])
    case .newsletters:
      // non-archived or deleted items with the Newsletter label
      let newsletterLabelPredicate = NSPredicate(
        format: "SUBQUERY(labels, $label, $label.name == \"Newsletter\").@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, newsletterLabelPredicate])
    case .recommended:
      // non-archived or deleted items with the Newsletter label
      let recommendedPredicate = NSPredicate(
        format: "recommendations.@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, recommendedPredicate])
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
    case .hasHighlights:
      let hasHighlightsPredicate = NSPredicate(
        format: "highlights.@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [
        hasHighlightsPredicate, notInArchivePredicate
      ])
    }
  }
}
