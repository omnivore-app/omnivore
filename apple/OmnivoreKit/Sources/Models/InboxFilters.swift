import Foundation

//  var allowLocalFetch: Bool {
//    switch self {
//    case .inbox:
//      return true
//    default:
//      return false
//    }
//  }
//
//  var predicate: NSPredicate {
//    let undeletedPredicate = NSPredicate(
//      format: "%K != %i AND %K != \"DELETED\"",
//      #keyPath(LinkedItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue),
//      #keyPath(LinkedItem.state)
//    )
//    let notInArchivePredicate = NSPredicate(
//      format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: false) as NSNumber
//    )
//
//    switch self {
//    case .inbox:
//      // non-archived items
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate])
//    case .readlater:
//      // non-archived or deleted items without the Newsletter label
//      let nonNewsletterLabelPredicate = NSPredicate(
//        format: "NOT SUBQUERY(labels, $label, $label.name == \"Newsletter\") .@count > 0"
//      )
//      let nonRSSPredicate = NSPredicate(
//        format: "NOT SUBQUERY(labels, $label, $label.name == \"RSS\") .@count > 0"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [
//        undeletedPredicate, notInArchivePredicate, nonNewsletterLabelPredicate, nonRSSPredicate
//      ])
//    case .downloaded:
//      // include pdf only
//      let hasHTMLContent = NSPredicate(
//        format: "htmlContent.length > 0"
//      )
//      let isPDFPredicate = NSPredicate(
//        format: "%K == %@", #keyPath(LinkedItem.contentReader), "PDF"
//      )
//      let localPDFURL = NSPredicate(
//        format: "localPDF.length > 0"
//      )
//      let downloadedPDF = NSCompoundPredicate(andPredicateWithSubpredicates: [isPDFPredicate, localPDFURL])
//      return NSCompoundPredicate(orPredicateWithSubpredicates: [hasHTMLContent, downloadedPDF])
//    case .newsletters:
//      // non-archived or deleted items with the Newsletter label
//      let newsletterLabelPredicate = NSPredicate(
//        format: "SUBQUERY(labels, $label, $label.name == \"Newsletter\").@count > 0"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, newsletterLabelPredicate])
//    case .feeds:
//      let feedLabelPredicate = NSPredicate(
//        format: "SUBQUERY(labels, $label, $label.name == \"RSS\").@count > 0"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, feedLabelPredicate])
//    case .recommended:
//      // non-archived or deleted items with the Newsletter label
//      let recommendedPredicate = NSPredicate(
//        format: "recommendations.@count > 0"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, recommendedPredicate])
//    case .all:
//      // include everything undeleted
//      return undeletedPredicate
//    case .archived:
//      let inArchivePredicate = NSPredicate(
//        format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: true) as NSNumber
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, inArchivePredicate])
//    case .deleted:
//      let deletedPredicate = NSPredicate(
//        format: "%K == %i", #keyPath(LinkedItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue)
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [deletedPredicate])
//    case .files:
//      // include pdf only
//      let isPDFPredicate = NSPredicate(
//        format: "%K == %@", #keyPath(LinkedItem.contentReader), "PDF"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, isPDFPredicate])
//    case .hasHighlights:
//      let hasHighlightsPredicate = NSPredicate(
//        format: "highlights.@count > 0"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [
//        hasHighlightsPredicate
//      ])
//    }
//  }
// }

// public enum FeaturedItemFilter: String, CaseIterable {
//  case continueReading
//  case recommended
//  case newsletters
//  case pinned
// }
//
// public extension FeaturedItemFilter {
//  var title: String {
//    switch self {
//    case .continueReading:
//      return "Continue Reading"
//    case .recommended:
//      return "Recommended"
//    case .newsletters:
//      return "Newsletters"
//    case .pinned:
//      return "Pinned"
//    }
//  }
//
//  var emptyMessage: String {
//    switch self {
//    case .continueReading:
//      return "Your recently read items will appear here."
//    case .pinned:
//      return "Create a label named Pinned and add it to items you would like to appear here."
//    case .recommended:
//      return "Reads recommended in your Clubs will appear here."
//    case .newsletters:
//      return "All your Newsletters will appear here."
//    }
//  }
//
//  var predicate: NSPredicate {
//    let undeletedPredicate = NSPredicate(
//      format: "%K != %i", #keyPath(LinkedItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue)
//    )
//    let notInArchivePredicate = NSPredicate(
//      format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: false) as NSNumber
//    )
//
//    switch self {
//    case .continueReading:
//      // Use > 1 instead of 0 so its only reads they have made slight progress on.
//      let continueReadingPredicate = NSPredicate(
//        format: "readingProgress > 1 AND readingProgress < 100 AND readAt != nil"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [
//        continueReadingPredicate, undeletedPredicate, notInArchivePredicate
//      ])
//    case .pinned:
//      let pinnedPredicate = NSPredicate(
//        format: "SUBQUERY(labels, $label, $label.name == \"Pinned\").@count > 0"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [
//        notInArchivePredicate, undeletedPredicate, pinnedPredicate
//      ])
//    case .newsletters:
//      // non-archived or deleted items with the Newsletter label
//      let newsletterLabelPredicate = NSPredicate(
//        format: "SUBQUERY(labels, $label, $label.name == \"Newsletter\").@count > 0"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [
//        notInArchivePredicate, undeletedPredicate, newsletterLabelPredicate
//      ])
//    case .recommended:
//      // non-archived or deleted items with the Newsletter label
//      let recommendedPredicate = NSPredicate(
//        format: "recommendations.@count > 0"
//      )
//      return NSCompoundPredicate(andPredicateWithSubpredicates: [
//        notInArchivePredicate, undeletedPredicate, recommendedPredicate
//      ])
//    }
//  }
//
//  var sortDescriptor: NSSortDescriptor {
//    let savedAtSort = NSSortDescriptor(key: #keyPath(LinkedItem.savedAt), ascending: false)
//    switch self {
//    case .continueReading:
//      return NSSortDescriptor(key: #keyPath(LinkedItem.readAt), ascending: false)
//    case .pinned:
//      return NSSortDescriptor(key: #keyPath(LinkedItem.updatedAt), ascending: false)
//    default:
//      return savedAtSort
//    }
//  }
// }
