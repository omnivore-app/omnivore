import CoreData
import Foundation
import Models

public struct InternalFilter: Encodable, Identifiable, Hashable, Equatable {
  public let id: String
  public let name: String
  public let folder: String
  public let filter: String
  public let visible: Bool
  public let position: Int
  public let defaultFilter: Bool

  public static func == (lhs: Self, rhs: Self) -> Bool {
    lhs.id == rhs.id
  }

  public static var InboxDownloadedFilter: InternalFilter {
    InternalFilter(
      id: "inbox-downloaded",
      name: "Downloaded",
      folder: "inbox",
      filter: "",
      visible: true,
      position: 11,
      defaultFilter: true
    )
  }

  public static var InboxDeletedFilter: InternalFilter {
    InternalFilter(
      id: "inbox-deleted",
      name: "Deleted",
      folder: "inbox",
      filter: "in:trash",
      visible: true,
      position: 12,
      defaultFilter: true
    )
  }

  public static var InboxUnreadFilter: InternalFilter {
    InternalFilter(
      id: "inbox-unread",
      name: "Unread",
      folder: "inbox",
      filter: "in:inbox is:unread",
      visible: true,
      position: 10,
      defaultFilter: true
    )
  }

  public static var FollowingDownloadedFilter: InternalFilter {
    InternalFilter(
      id: "following-downloaded",
      name: "Downloaded",
      folder: "following",
      filter: "",
      visible: true,
      position: 11,
      defaultFilter: true
    )
  }

  public static var FollowingDeletedFilter: InternalFilter {
    InternalFilter(
      id: "following-deleted",
      name: "Deleted",
      folder: "following",
      filter: "in:trash",
      visible: true,
      position: 12,
      defaultFilter: true
    )
  }

  public static var FollowingUnreadFilter: InternalFilter {
    InternalFilter(
      id: "unread",
      name: "Unread",
      folder: "inbox",
      filter: "in:inbox is:unread",
      visible: true,
      position: 10,
      defaultFilter: true
    )
  }

  public static var DefaultInboxFilters: [InternalFilter] {
    [
      InternalFilter(
        id: "inbox",
        name: "Inbox",
        folder: "inbox",
        filter: "",
        visible: true,
        position: 10,
        defaultFilter: true
      ),
      InternalFilter(
        id: "non-feed-items",
        name: "Non-Feed Items",
        folder: "inbox",
        filter: "",
        visible: true,
        position: 11,
        defaultFilter: true
      ),
      InternalFilter(
        id: "newsletters",
        name: "Newsletters",
        folder: "inbox",
        filter: "",
        visible: true,
        position: 12,
        defaultFilter: true
      ),
      InternalFilter(
        id: "feeds",
        name: "Feeds",
        folder: "inbox",
        filter: "",
        visible: true,
        position: 13,
        defaultFilter: true
      ),
      InternalFilter(
        id: "archived",
        name: "Archived",
        folder: "inbox",
        filter: "is:archived",
        visible: true,
        position: 14,
        defaultFilter: true
      ),
      InternalFilter(
        id: "files",
        name: "Files",
        folder: "inbox",
        filter: "type:file",
        visible: true,
        position: 15,
        defaultFilter: true
      ),
      InternalFilter(
        id: "highlighted",
        name: "Highlights",
        folder: "inbox",
        filter: "has:highlights",
        visible: true,
        position: 16,
        defaultFilter: true
      ),
      InternalFilter(
        id: "all",
        name: "All",
        folder: "inbox",
        filter: "in:all",
        visible: true,
        position: 17,
        defaultFilter: true
      )
    ]
  }

  public static var DefaultFollowingFilters: [InternalFilter] {
    [
      InternalFilter(
        id: "following",
        name: "Following",
        folder: "following",
        filter: "in:following",
        visible: true,
        position: 10,
        defaultFilter: true
      ),
      InternalFilter(
        id: "following_unread",
        name: "Unread",
        folder: "following",
        filter: "in:following is:unread",
        visible: true,
        position: 11,
        defaultFilter: true
      ),
      InternalFilter(
        id: "rss",
        name: "Feeds",
        folder: "following",
        filter: "in:following label:RSS",
        visible: true,
        position: 12,
        defaultFilter: true
      ),
      InternalFilter(
        id: "newsletters",
        name: "Newsletters",
        folder: "following",
        filter: "in:following label:Newsletter",
        visible: true,
        position: 13,
        defaultFilter: true
      )
    ]
  }

  public var shouldRemoteSearch: Bool {
    id != "downloaded"
  }

  public var isDownloadedFilter: Bool {
    id == "downloaded"
  }

  public var allowLocalFetch: Bool {
    predicate != nil
  }

  public var ignoreFolders: Bool {
    return name == "Deleted"
  }

  public var predicate: NSPredicate? {
    let undeletedPredicate = NSPredicate(
      format: "%K != %i AND %K != \"DELETED\"",
      #keyPath(Models.LibraryItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue),
      #keyPath(Models.LibraryItem.state)
    )
    let notInArchivePredicate = NSPredicate(
      format: "%K == %@", #keyPath(Models.LibraryItem.isArchived), Int(truncating: false) as NSNumber
    )

    switch name {
    case "RSS":
      let feedLabelPredicate = NSPredicate(
        format: "SUBQUERY(labels, $label, $label.name == \"RSS\").@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, undeletedPredicate, feedLabelPredicate])
    case "Following":
      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, undeletedPredicate])
    case "Inbox":
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate])
    case "Unread":
      let isUnread = NSPredicate(
        format: "readAt == nil"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate, isUnread])
    case "Non-Feed Items":
      // non-archived or deleted items without the Newsletter label
      let nonNewsletterLabelPredicate = NSPredicate(
        format: "NOT SUBQUERY(labels, $label, $label.name == \"Newsletter\") .@count > 0"
      )
      let nonRSSPredicate = NSPredicate(
        format: "NOT SUBQUERY(labels, $label, $label.name == \"RSS\") .@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [
        undeletedPredicate, notInArchivePredicate, nonNewsletterLabelPredicate, nonRSSPredicate
      ])
    case "Downloaded":
      // include pdf only
      let hasHTMLContent = NSPredicate(
        format: "htmlContent.length > 0"
      )
      let isPDFPredicate = NSPredicate(
        format: "%K == %@", #keyPath(Models.LibraryItem.contentReader), "PDF"
      )
      let localPDFURL = NSPredicate(
        format: "localPDF.length > 0"
      )
      let downloadedPDF = NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, isPDFPredicate, localPDFURL])
      return NSCompoundPredicate(orPredicateWithSubpredicates: [hasHTMLContent, downloadedPDF])
    case "Newsletters":
      // non-archived or deleted items with the Newsletter label
      let newsletterLabelPredicate = NSPredicate(
        format: "SUBQUERY(labels, $label, $label.name == \"Newsletter\").@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate, newsletterLabelPredicate])
    case "Feeds":
      let feedLabelPredicate = NSPredicate(
        format: "SUBQUERY(labels, $label, $label.name == \"RSS\").@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate, feedLabelPredicate])
    case "Recommended":
      // non-archived or deleted items with the Newsletter label
      let recommendedPredicate = NSPredicate(
        format: "recommendations.@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate, recommendedPredicate])
    case "All":
      // include everything undeleted
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate])
    case "Archived":
      let inArchivePredicate = NSPredicate(
        format: "%K == %@", #keyPath(Models.LibraryItem.isArchived), Int(truncating: true) as NSNumber
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, inArchivePredicate])
    case "Deleted":
      let deletedPredicate = NSPredicate(
        format: "%K == %i OR %K == \"DELETED\"",
        #keyPath(Models.LibraryItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue),
        #keyPath(Models.LibraryItem.state)
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [deletedPredicate])
    case "Files":
      // include pdf only
      let isPDFPredicate = NSPredicate(
        format: "%K == %@", #keyPath(Models.LibraryItem.contentReader), "PDF"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, isPDFPredicate])
    case "Highlights":
      let hasHighlightsPredicate = NSPredicate(
        format: "highlights.@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [
        undeletedPredicate,
        hasHighlightsPredicate
      ])
    default:
      return nil
    }
  }

  func persist(context: NSManagedObjectContext) -> NSManagedObjectID? {
    var objectID: NSManagedObjectID?

    context.performAndWait {
      let filter = asManagedObject(inContext: context)

      do {
        try context.save()
        logger.debug("LinkedItemLabel saved succesfully")
        objectID = filter.objectID
      } catch {
        context.rollback()
        logger.debug("Failed to save LinkedItemLabel: \(error.localizedDescription)")
      }
    }

    return objectID
  }

  func asManagedObject(inContext context: NSManagedObjectContext) -> Filter {
    let existing = Filter.lookup(byID: id, inContext: context)
    let newFilter = existing ?? Filter(entity: Filter.entity(), insertInto: context)
    newFilter.id = id
    newFilter.name = name
    newFilter.folder = folder
    newFilter.filter = filter
    newFilter.visible = visible
    newFilter.position = Int64(position)
    newFilter.defaultFilter = defaultFilter
    return newFilter
  }

  public static func make(from filters: [Filter]) -> [InternalFilter] {
    filters.compactMap { filter in
      if let id = filter.id,
         let name = filter.name,
         let folder = filter.folder,
         let filterStr = filter.filter
      {
        return InternalFilter(
          id: id,
          name: name,
          folder: folder,
          filter: filterStr,
          visible: filter.visible,
          position: Int(filter.position),
          defaultFilter: filter.defaultFilter
        )
      }
      return nil
    }
  }
}

public extension Filter {
  var unwrappedID: String { id ?? "" }

  static func lookup(byID id: String, inContext context: NSManagedObjectContext) -> Filter? {
    let fetchRequest: NSFetchRequest<Models.Filter> = Filter.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", id
    )

    var filter: Filter?
    context.performAndWait {
      filter = (try? context.fetch(fetchRequest))?.first
    }

    return filter
  }

  static func lookup(byFilter filter: String, inContext context: NSManagedObjectContext) -> Filter? {
    let fetchRequest: NSFetchRequest<Models.Filter> = Filter.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "filter == %@", filter
    )

    var filter: Filter?
    context.performAndWait {
      filter = (try? context.fetch(fetchRequest))?.first
    }

    return filter
  }
}

extension Sequence where Element == InternalFilter {
  func persist(context: NSManagedObjectContext) -> [NSManagedObjectID]? {
    var result: [NSManagedObjectID]?

    context.performAndWait {
      let fetchRequest: NSFetchRequest<Models.Filter> = Filter.fetchRequest()
      let existing = (try? fetchRequest.execute()) ?? []

      let validLabelIDs = map(\.id)
      let invalid = existing.filter { !validLabelIDs.contains($0.unwrappedID) }

      for filter in invalid {
        context.delete(filter)
      }

      let filters = map { $0.asManagedObject(inContext: context) }

      do {
        try context.save()
        logger.debug("filters saved succesfully")
        result = filters.map(\.objectID)
      } catch {
        context.rollback()
        logger.debug("Failed to save filters: \(error.localizedDescription)")
      }
    }

    return result
  }
}
