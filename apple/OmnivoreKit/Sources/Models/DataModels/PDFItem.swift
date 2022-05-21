import CoreData
import Foundation

public struct PDFItem {
  public let objectID: NSManagedObjectID
  public let itemID: String
  public let pdfURL: URL?
  public let documentData: Data?
  public let title: String
  public let slug: String
  public let readingProgress: Double
  public let readingProgressAnchor: Int
  public let isArchived: Bool
  public let isRead: Bool
  public let originalArticleURL: String
  public let highlights: [Highlight]

  public static func make(item: LinkedItem) -> PDFItem? {
    guard item.isPDF else { return nil }

    return PDFItem(
      objectID: item.objectID,
      itemID: item.unwrappedID,
      pdfURL: URL(string: item.unwrappedPageURLString),
      documentData: item.pdfData,
      title: item.unwrappedID,
      slug: item.unwrappedSlug,
      readingProgress: item.readingProgress,
      readingProgressAnchor: Int(item.readingProgressAnchor),
      isArchived: item.isArchived,
      isRead: item.isRead,
      originalArticleURL: item.unwrappedPageURLString,
      highlights: item.highlights.asArray(of: Highlight.self)
    )
  }
}
