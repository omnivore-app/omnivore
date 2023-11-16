import CoreData
import Foundation
import Models

public struct InternalFilter: Encodable, Identifiable, Hashable {
  public let id: String
  public let name: String
  public let filter: String
  public let visible: Bool
  public let position: Int
  public let defaultFilter: Bool

  public static var DownloadedFilter: InternalFilter {
    InternalFilter(
      id: "downloaded",
      name: "Downloaded",
      filter: "",
      visible: true,
      position: -1,
      defaultFilter: true
    )
  }

  public static var DeletedFilter: InternalFilter {
    InternalFilter(
      id: "deleted",
      name: "Deleted",
      filter: "in:trash",
      visible: true,
      position: -1,
      defaultFilter: true
    )
  }

  public static var DefaultFilters: [InternalFilter] {
    [
      InternalFilter(
        id: "inbox",
        name: "Inbox",
        filter: "",
        visible: true,
        position: 0,
        defaultFilter: true
      ),
      InternalFilter(
        id: "non-feed-items",
        name: "Non-Feed Items",
        filter: "",
        visible: true,
        position: 1,
        defaultFilter: true
      ),
      InternalFilter(
        id: "newsletters",
        name: "Newsletters",
        filter: "",
        visible: true,
        position: 2,
        defaultFilter: true
      ),
      InternalFilter(
        id: "feeds",
        name: "Feeds",
        filter: "",
        visible: true,
        position: 3,
        defaultFilter: true
      ),
      InternalFilter(
        id: "archived",
        name: "Archived",
        filter: "is:archived",
        visible: true,
        position: 4,
        defaultFilter: true
      ),
      InternalFilter(
        id: "files",
        name: "Files",
        filter: "type:file",
        visible: true,
        position: 5,
        defaultFilter: true
      ),
      InternalFilter(
        id: "highlighted",
        name: "Highlights",
        filter: "has:highlights",
        visible: true,
        position: 6,
        defaultFilter: true
      ),
      InternalFilter(
        id: "all",
        name: "All",
        filter: "in:all",
        visible: true,
        position: 7,
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

  public var predicate: NSPredicate? {
    if !defaultFilter {
      return nil
    }

    let undeletedPredicate = NSPredicate(
      format: "%K != %i AND %K != \"DELETED\"",
      #keyPath(Models.LibraryItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue),
      #keyPath(Models.LibraryItem.state)
    )
    let notInArchivePredicate = NSPredicate(
      format: "%K == %@", #keyPath(Models.LibraryItem.isArchived), Int(truncating: false) as NSNumber
    )

    switch name {
    case "Inbox":
      // non-archived items
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate])
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
      let downloadedPDF = NSCompoundPredicate(andPredicateWithSubpredicates: [isPDFPredicate, localPDFURL])
      return NSCompoundPredicate(orPredicateWithSubpredicates: [hasHTMLContent, downloadedPDF])
    case "Newsletters":
      // non-archived or deleted items with the Newsletter label
      let newsletterLabelPredicate = NSPredicate(
        format: "SUBQUERY(labels, $label, $label.name == \"Newsletter\").@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, newsletterLabelPredicate])
    case "Feeds":
      let feedLabelPredicate = NSPredicate(
        format: "SUBQUERY(labels, $label, $label.name == \"RSS\").@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, feedLabelPredicate])
    case "Recommended":
      // non-archived or deleted items with the Newsletter label
      let recommendedPredicate = NSPredicate(
        format: "recommendations.@count > 0"
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, recommendedPredicate])
    case "All":
      // include everything undeleted
      return undeletedPredicate
    case "Archived":
      let inArchivePredicate = NSPredicate(
        format: "%K == %@", #keyPath(Models.LibraryItem.isArchived), Int(truncating: true) as NSNumber
      )
      return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, inArchivePredicate])
    case "Deleted":
      let deletedPredicate = NSPredicate(
        format: "%K == %i", #keyPath(Models.LibraryItem.serverSyncStatus), Int64(ServerSyncStatus.needsDeletion.rawValue)
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
         let filterStr = filter.filter
      {
        return InternalFilter(
          id: id,
          name: name,
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
