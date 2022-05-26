import Foundation

public struct Subscription {
  public let createdAt: Date?
  public let description: String?
  public let subscriptionID: String
  public let name: String
  public let newsletterEmailAddress: String
  public let status: SubscriptionStatus
  public let unsubscribeHttpUrl: String?
  public let unsubscribeMailTo: String?
  public let updatedAt: Date?
  public let url: String?

  public init(
    createdAt: Date?,
    description: String?,
    subscriptionID: String,
    name: String,
    newsletterEmailAddress: String,
    status: SubscriptionStatus,
    unsubscribeHttpUrl: String?,
    unsubscribeMailTo: String?,
    updatedAt: Date?,
    url: String?
  ) {
    self.createdAt = createdAt
    self.description = description
    self.subscriptionID = subscriptionID
    self.name = name
    self.newsletterEmailAddress = newsletterEmailAddress
    self.status = status
    self.unsubscribeHttpUrl = unsubscribeHttpUrl
    self.unsubscribeMailTo = unsubscribeMailTo
    self.updatedAt = updatedAt
    self.url = url
  }
}

public enum SubscriptionStatus {
  case active
  case deleted
  case unsubscribed
}
