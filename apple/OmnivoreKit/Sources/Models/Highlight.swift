import CoreData
import Foundation

public struct Highlight: Identifiable, Hashable, Codable {
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

  public func toManagedObject(context: NSManagedObjectContext, associatedItemID: String) -> PersistedHighlight {
    let persistedHighlight = PersistedHighlight(context: context)
    persistedHighlight.associatedItemId = associatedItemID
    persistedHighlight.markedForDeletion = false
    persistedHighlight.id = id
    persistedHighlight.shortId = shortId
    persistedHighlight.quote = quote
    persistedHighlight.prefix = prefix
    persistedHighlight.suffix = suffix
    persistedHighlight.patch = patch
    persistedHighlight.annotation = annotation
    persistedHighlight.createdAt = createdAt
    persistedHighlight.updatedAt = updatedAt
    persistedHighlight.createdByMe = createdByMe
    return persistedHighlight
  }

  public static func make(from persistedHighlight: PersistedHighlight) -> Highlight {
    Highlight(
      id: persistedHighlight.id ?? "",
      shortId: persistedHighlight.shortId ?? "",
      quote: persistedHighlight.quote ?? "",
      prefix: persistedHighlight.prefix,
      suffix: persistedHighlight.suffix,
      patch: persistedHighlight.patch ?? "",
      annotation: persistedHighlight.annotation,
      createdByMe: persistedHighlight.createdByMe,
      createdAt: persistedHighlight.createdAt,
      updatedAt: persistedHighlight.updatedAt
    )
  }
}
