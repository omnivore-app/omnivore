import Foundation

public struct PDFItem {
  public let itemID: String
  public let documentData: Data?
  public let title: String
  public let slug: String
  public let readingProgress: Double
  public let readingProgressAnchor: Int
  public let highlights: [Highlight]

  public static func make(item: LinkedItem) -> PDFItem? {
    guard item.isPDF else { return nil }

    return PDFItem(
      itemID: item.unwrappedID,
      documentData: item.pdfData,
      title: item.unwrappedID,
      slug: item.unwrappedSlug,
      readingProgress: item.readingProgress,
      readingProgressAnchor: Int(item.readingProgressAnchor),
      highlights: item.highlights.asArray(of: Highlight.self)
    )
  }
}
