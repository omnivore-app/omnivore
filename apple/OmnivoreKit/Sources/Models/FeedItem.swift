import Foundation

public struct HomeFeedData {
  public let items: [FeedItem]
  public let cursor: String?

  public init(items: [FeedItem], cursor: String?) {
    self.items = items
    self.cursor = cursor
  }
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
  public let description: String?
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
    description: String?,
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
    self.description = description
    self.publisherURLString = publisherURLString
    self.author = author
    self.publishDate = publishDate
    self.slug = slug
    self.isArchived = isArchived
    self.contentReader = contentReader
    self.labels = labels
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
      description: title,
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
