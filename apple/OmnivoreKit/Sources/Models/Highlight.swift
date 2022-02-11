import Foundation

public struct Highlight: Identifiable, Hashable {
  public let id: String
  public let shortId: String
  public let quote: String
  public let prefix: String?
  public let suffix: String?
  public let patch: String
  public let annotation: String?

  public init(
    id: String,
    shortId: String,
    quote: String,
    prefix: String?,
    suffix: String?,
    patch: String,
    annotation: String?
  ) {
    self.id = id
    self.shortId = shortId
    self.quote = quote
    self.prefix = prefix
    self.suffix = suffix
    self.patch = patch
    self.annotation = annotation
  }
}
