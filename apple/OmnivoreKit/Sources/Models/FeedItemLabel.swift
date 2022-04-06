import Foundation

public struct FeedItemLabel: Decodable, Hashable {
  public let id: String
  public let name: String
  public let color: String
  public let createdAt: Date?
  public let description: String?

  public init(
    id: String,
    name: String,
    color: String,
    createdAt: Date?,
    description: String?
  ) {
    self.id = id
    self.name = name
    self.color = color
    self.createdAt = createdAt
    self.description = description
  }
}
