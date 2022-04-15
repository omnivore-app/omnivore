import CoreData
import Foundation

public struct HomeFeedData {
  public let items: [FeedItem]
  public let cursor: String?

  public init(items: [FeedItem], cursor: String?) {
    self.items = items
    self.cursor = cursor
  }
}

public class FeedItemManagedObject: NSManagedObject {
  static let entityName = "FeedItemManagedObject"

  @NSManaged public var id: String
  @NSManaged public var title: String
  @NSManaged public var createdAt: Date
  @NSManaged public var savedAt: Date
  @NSManaged public var readingProgress: Double
  @NSManaged public var readingProgressAnchor: Int
  @NSManaged public var imageURLString: String?
  @NSManaged public var onDeviceImageURLString: String?
  @NSManaged public var documentDirectoryPath: String?
  @NSManaged public var pageURLString: String
  @NSManaged public var descriptionText: String?
  @NSManaged public var publisherURLString: String?
  @NSManaged public var author: String?
  @NSManaged public var publishDate: Date?
  @NSManaged public var slug: String
  @NSManaged public var isArchived: Bool
  @NSManaged public var contentReader: String?
  @NSManaged public var labels: Set<FeedItemLabelManagedObject>
}

public struct FeedItem: Identifiable, Hashable {
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
  public var labels: [FeedItemLabel]

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
    labels: [FeedItemLabel]
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

  func toManagedObject(inContext context: NSManagedObjectContext) -> FeedItemManagedObject? {
    guard let entityDescription = NSEntityDescription.entity(forEntityName: FeedItemManagedObject.entityName, in: context) else {
      print("Failed to create \(FeedItemManagedObject.entityName)")
      return nil
    }

    let object = FeedItemManagedObject(entity: entityDescription, insertInto: context)
    object.id = id
    object.title = title
    object.createdAt = createdAt
    object.savedAt = savedAt
    object.readingProgress = readingProgress
    object.readingProgressAnchor = readingProgressAnchor
    object.imageURLString = imageURLString
    object.onDeviceImageURLString = onDeviceImageURLString
    object.documentDirectoryPath = documentDirectoryPath
    object.pageURLString = pageURLString
    object.descriptionText = descriptionText
    object.publisherURLString = publisherURLString
    object.author = author
    object.publishDate = publishDate
    object.slug = slug
    object.isArchived = isArchived
    object.contentReader = contentReader

    for label in labels {
      if let managedLabel = label.toManagedObject(inContext: context) {
        object.labels.insert(managedLabel)
      }
    }

    return object
  }

  public static func fromJsonArticle(linkData: Data) -> FeedItem? {
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

  var feedItem: FeedItem {
    FeedItem(
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
