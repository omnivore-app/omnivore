import CoreData
import Foundation

public struct HomeFeedData {
  public let items: [NSManagedObjectID]
  public let cursor: String?

  public init(items: [NSManagedObjectID], cursor: String?) {
    self.items = items
    self.cursor = cursor
  }
}

// TODO: -push-notification delete this?
// Internal model used for parsing a push notification object only
// struct JSONArticle: Decodable {
//  let id: String
//  let title: String
//  let createdAt: Date
//  let savedAt: Date
//  let image: String
//  let readingProgressPercent: Double
//  let readingProgressAnchorIndex: Int
//  let slug: String
//  let contentReader: String
//  let url: String
//  let isArchived: Bool
//
//  var feedItem: FeedItem-----De---p {
//    FeedItem--------De----p(
//      id: id,
//      title: title,
//      createdAt: createdAt,
//      savedAt: savedAt,
//      readingProgress: readingProgressPercent,
//      readingProgressAnchor: readingProgressAnchorIndex,
//      imageURLString: image,
//      onDeviceImageURLString: nil,
//      documentDirectoryPath: nil,
//      pageURLString: url,
//      descriptionText: title,
//      publisherURLString: nil,
//      author: nil,
//      publishDate: nil,
//      slug: slug,
//      isArchived: isArchived,
//      contentReader: contentReader,
//      labels: []
//    )
//  }
// }

public extension LinkedItem {
  var unwrappedID: String { id ?? "" }
  var unwrappedSlug: String { slug ?? "" }
  var unwrappedTitle: String { title ?? "" }
  var unwrappedPageURLString: String { pageURLString ?? "" }
  var unwrappedSavedAt: Date { savedAt ?? Date() }
  var unwrappedCreatedAt: Date { createdAt ?? Date() }

  var isRead: Bool {
    readingProgress >= 0.98
  }

  var isPDF: Bool {
    if let contentReader = contentReader {
      return contentReader == "PDF"
    }
    return (pageURLString ?? "").hasSuffix("pdf")
  }

  var publisherHostname: String? {
    URL(string: publisherURLString ?? pageURLString ?? "")?.host
  }

  var imageURL: URL? {
    imageURLString.flatMap { URL(string: $0) }
  }

  var pdfURL: URL? {
    guard isPDF else { return nil }
    return URL(string: pageURLString ?? "")
  }

  static func lookup(byID itemID: String, inContext context: NSManagedObjectContext) -> LinkedItem? {
    let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", itemID
    )

    var item: LinkedItem?

    context.performAndWait {
      item = (try? context.fetch(fetchRequest))?.first
    }

    return item
  }

  func update(
    inContext context: NSManagedObjectContext,
    newReadingProgress: Double? = nil,
    newAnchorIndex: Int? = nil,
    newIsArchivedValue: Bool? = nil
  ) {
    context.perform {
      if let newReadingProgress = newReadingProgress {
        self.readingProgress = newReadingProgress
      }

      if let newAnchorIndex = newAnchorIndex {
        self.readingProgressAnchor = Int64(newAnchorIndex)
      }

      if let newIsArchivedValue = newIsArchivedValue {
        self.isArchived = newIsArchivedValue
      }

      guard context.hasChanges else { return }

      do {
        try context.save()
        logger.debug("LinkedItem updated succesfully")
      } catch {
        context.rollback()
        logger.debug("Failed to update LinkedItem: \(error.localizedDescription)")
      }
    }
  }

  func remove(inContext context: NSManagedObjectContext) {
    context.perform {
      context.delete(self)

      do {
        try context.save()
        logger.debug("LinkedItem removed")
      } catch {
        context.rollback()
        logger.debug("Failed to remove LinkedItem: \(error.localizedDescription)")
      }
    }
  }
}
