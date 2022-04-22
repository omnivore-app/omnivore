import CoreData
import Foundation

public struct HomeFeedData {
  public let items: [FeedItemDep]
  public let cursor: String?

  public init(items: [FeedItemDep], cursor: String?) {
    self.items = items
    self.cursor = cursor
  }
}

public struct FeedItemDep: Identifiable, Hashable {
  public let id: String
  public let title: String
  public let createdAt: Date
  public let savedAt: Date
  public var readingProgress: Double
  public var readingProgressAnchor: Int
  public let imageURLString: String?
  public let onDeviceImageURLString: String?
  public let documentDirectoryPath: String?
  public let pageURLString: String
  public let descriptionText: String?
  public let publisherURLString: String?
  public let author: String?
  public let publishDate: Date?
  public let slug: String
  public let isArchived: Bool
  public let contentReader: String?
  public var labels: [FeedItemLabelDep]

  public init(
    id: String,
    title: String,
    createdAt: Date,
    savedAt: Date,
    readingProgress: Double,
    readingProgressAnchor: Int,
    imageURLString: String?,
    onDeviceImageURLString: String?,
    documentDirectoryPath: String?,
    pageURLString: String,
    descriptionText: String?,
    publisherURLString: String?,
    author: String?,
    publishDate: Date?,
    slug: String,
    isArchived: Bool,
    contentReader: String?,
    labels: [FeedItemLabelDep]
  ) {
    self.id = id
    self.title = title
    self.createdAt = createdAt
    self.savedAt = savedAt
    self.readingProgress = readingProgress
    self.readingProgressAnchor = readingProgressAnchor
    self.imageURLString = imageURLString
    self.onDeviceImageURLString = onDeviceImageURLString
    self.documentDirectoryPath = documentDirectoryPath
    self.pageURLString = pageURLString
    self.descriptionText = descriptionText
    self.publisherURLString = publisherURLString
    self.author = author
    self.publishDate = publishDate
    self.slug = slug
    self.isArchived = isArchived
    self.contentReader = contentReader
    self.labels = labels
  }

  public static func fromJsonArticle(linkData: Data) -> FeedItemDep? {
    try? JSONDecoder().decode(JSONArticle.self, from: linkData).feedItem
  }

  public var isRead: Bool {
    readingProgress >= 0.98
  }

  public var isPDF: Bool {
    if let contentReader = contentReader {
      return contentReader == "PDF"
    }
    return pageURLString.hasSuffix("pdf")
  }

  public var publisherHostname: String? {
    URL(string: publisherURLString ?? pageURLString)?.host
  }

  public var imageURL: URL? {
    imageURLString.flatMap { URL(string: $0) }
  }

  public var pdfURL: URL? {
    guard isPDF else { return nil }
    let documentDirectoryURL = documentDirectoryPath.flatMap { URL(string: $0) }
    return documentDirectoryURL ?? URL(string: pageURLString)
  }
}

/// Internal model used for parsing a push notification object only
struct JSONArticle: Decodable {
  let id: String
  let title: String
  let createdAt: Date
  let savedAt: Date
  let image: String
  let readingProgressPercent: Double
  let readingProgressAnchorIndex: Int
  let slug: String
  let contentReader: String
  let url: String
  let isArchived: Bool

  var feedItem: FeedItemDep {
    FeedItemDep(
      id: id,
      title: title,
      createdAt: createdAt,
      savedAt: savedAt,
      readingProgress: readingProgressPercent,
      readingProgressAnchor: readingProgressAnchorIndex,
      imageURLString: image,
      onDeviceImageURLString: nil,
      documentDirectoryPath: nil,
      pageURLString: url,
      descriptionText: title,
      publisherURLString: nil,
      author: nil,
      publishDate: nil,
      slug: slug,
      isArchived: isArchived,
      contentReader: contentReader,
      labels: []
    )
  }
}

public extension FeedItemDep {
  func asManagedObject(inContext context: NSManagedObjectContext) -> LinkedItem {
    let existingItem = LinkedItem.lookup(byID: id, inContext: context)
    let linkedItem = existingItem ?? LinkedItem(entity: LinkedItem.entity(), insertInto: context)

    linkedItem.id = id
    linkedItem.title = title
    linkedItem.createdAt = createdAt
    linkedItem.savedAt = savedAt
    linkedItem.readingProgress = readingProgress
    linkedItem.readingProgressAnchor = Int64(readingProgressAnchor)
    linkedItem.imageURLString = imageURLString
    linkedItem.onDeviceImageURLString = onDeviceImageURLString
    linkedItem.pageURLString = pageURLString
    linkedItem.descriptionText = descriptionText
    linkedItem.publisherURLString = publisherURLString
    linkedItem.author = author
    linkedItem.publishDate = publishDate
    linkedItem.slug = slug
    linkedItem.isArchived = isArchived
    linkedItem.contentReader = contentReader

    //    for label in item.labels {
    // TODO: append labels
    //    }

    return linkedItem
  }

  static func make(from item: LinkedItem) -> FeedItemDep {
    FeedItemDep(
      id: item.id ?? "",
      title: item.title ?? "",
      createdAt: item.createdAt ?? Date(),
      savedAt: item.savedAt ?? Date(),
      readingProgress: item.readingProgress,
      readingProgressAnchor: Int(item.readingProgressAnchor),
      imageURLString: item.imageURLString,
      onDeviceImageURLString: item.onDeviceImageURLString,
      documentDirectoryPath: nil,
      pageURLString: item.pageURLString ?? "",
      descriptionText: item.title,
      publisherURLString: item.publisherURLString,
      author: item.author,
      publishDate: item.publishDate,
      slug: item.slug ?? "",
      isArchived: item.isArchived,
      contentReader: item.contentReader,
      labels: []
    )
  }
}

public extension Sequence where Element == FeedItemDep {
  func persist(context: NSManagedObjectContext) -> [LinkedItem]? {
    var result: [LinkedItem]?

    context.performAndWait {
      let linkedItems = map { $0.asManagedObject(inContext: context) }

      do {
        try context.save()
        result = linkedItems
        logger.debug("LinkedItems saved succesfully")
      } catch {
        context.rollback()
        logger.debug("Failed to save LinkedItems: \(error.localizedDescription)")
      }
    }
    return result
  }
}

public extension LinkedItem {
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
