import CoreData
import Foundation

public struct HighlightDep: Identifiable, Hashable, Codable {
  public let id: String
  public let shortId: String
  public let quote: String
  public let prefix: String?
  public let suffix: String?
  public let patch: String
  public let annotation: String?
  public let createdAt: Date?
  public let updatedAt: Date?
  public let createdByMe: Bool

  public init(
    id: String,
    shortId: String,
    quote: String,
    prefix: String?,
    suffix: String?,
    patch: String,
    annotation: String?,
    createdByMe: Bool,
    createdAt: Date? = nil,
    updatedAt: Date? = nil
  ) {
    self.id = id
    self.shortId = shortId
    self.quote = quote
    self.prefix = prefix
    self.suffix = suffix
    self.patch = patch
    self.annotation = annotation
    self.createdAt = createdAt
    self.updatedAt = updatedAt
    self.createdByMe = createdByMe
  }

  public func toManagedObject(context: NSManagedObjectContext, associatedItemID: String) -> Highlight {
    let highlight = Highlight(context: context)
    highlight.linkedItemId = associatedItemID
    highlight.markedForDeletion = false
    highlight.id = id
    highlight.shortId = shortId
    highlight.quote = quote
    highlight.prefix = prefix
    highlight.suffix = suffix
    highlight.patch = patch
    highlight.annotation = annotation
    highlight.createdAt = createdAt
    highlight.updatedAt = updatedAt
    highlight.createdByMe = createdByMe
    return highlight
  }

  public func persist(context: NSManagedObjectContext, associatedItemID: String) -> Highlight? {
    let highlight = toManagedObject(context: context, associatedItemID: associatedItemID)

    do {
      try context.save()
      logger.debug("Highlight saved succesfully")
      return highlight
    } catch {
      context.rollback()
      logger.debug("Failed to save Highlight: \(error.localizedDescription)")
      return nil
    }
  }

  public static func make(from highlight: Highlight) -> HighlightDep {
    HighlightDep(
      id: highlight.id ?? "",
      shortId: highlight.shortId ?? "",
      quote: highlight.quote ?? "",
      prefix: highlight.prefix,
      suffix: highlight.suffix,
      patch: highlight.patch ?? "",
      annotation: highlight.annotation,
      createdByMe: highlight.createdByMe,
      createdAt: highlight.createdAt,
      updatedAt: highlight.updatedAt
    )
  }
}
