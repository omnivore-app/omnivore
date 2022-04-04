import Foundation

public struct HomeFeedData {
  public let items: [FeedItem]
  public let cursor: String?

  public init(items: [FeedItem], cursor: String?) {
    self.items = items
    self.cursor = cursor
  }
}

public struct FeedItem: Identifiable, Hashable, Decodable {
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
    contentReader: String?
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
  }

  enum CodingKeys: String, CodingKey {
    case id, title, createdAt, savedAt, image, isArchived, readingProgressPercent, readingProgressAnchorIndex, slug, contentReader, url
  }

  public init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    id = try container.decode(String.self, forKey: .id)
    title = try container.decode(String.self, forKey: .title)
    createdAt = try container.decode(Date.self, forKey: .createdAt)
    savedAt = try container.decode(Date.self, forKey: .savedAt)
    description = try container.decode(String?.self, forKey: .title)
    imageURLString = try container.decode(String?.self, forKey: .image)
    readingProgress = try container.decode(Double.self, forKey: .readingProgressPercent)
    readingProgressAnchor = try container.decode(Int.self, forKey: .readingProgressAnchorIndex)
    slug = try container.decode(String.self, forKey: .slug)
    contentReader = try container.decode(String.self, forKey: .contentReader)
    pageURLString = try container.decode(String.self, forKey: .url)
    isArchived = try container.decode(Bool.self, forKey: .isArchived)

    self.onDeviceImageURLString = nil
    self.documentDirectoryPath = nil
    self.publisherURLString = nil
    self.author = nil
    self.publishDate = nil
  }

  public static func fromJsonArticle(linkData: Data) -> FeedItem? {
    if let item = try? JSONDecoder().decode(FeedItem.self, from: linkData) {
      return item
    }
    return nil
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
