import Foundation
import SwiftGraphQL

public struct Subscription {
  public let createdAt: Date?
  public let description: String?
  public let subscriptionID: String
  public let name: String
  public let type: SubscriptionType
  public let folder: String
  public let fetchContentType: FetchContentType
  public let newsletterEmailAddress: String?
  public let status: SubscriptionStatus
  public let unsubscribeHttpUrl: String?
  public let unsubscribeMailTo: String?
  public let updatedAt: Date?
  public let url: String?
  public let icon: String?

  public init(
    createdAt: Date?,
    description: String?,
    subscriptionID: String,
    name: String,
    type: SubscriptionType,
    folder: String,
    fetchContentType: FetchContentType,
    newsletterEmailAddress: String?,
    status: SubscriptionStatus,
    unsubscribeHttpUrl: String?,
    unsubscribeMailTo: String?,
    updatedAt: Date?,
    url: String?,
    icon: String?
  ) {
    self.createdAt = createdAt
    self.description = description
    self.subscriptionID = subscriptionID
    self.name = name
    self.type = type
    self.folder = folder
    self.fetchContentType = fetchContentType
    self.newsletterEmailAddress = newsletterEmailAddress
    self.status = status
    self.unsubscribeHttpUrl = unsubscribeHttpUrl
    self.unsubscribeMailTo = unsubscribeMailTo
    self.updatedAt = updatedAt
    self.url = url
    self.icon = icon
  }
}

public enum SubscriptionStatus {
  case active
  case deleted
  case unsubscribed
}

public enum SubscriptionType {
  case newsletter
  case feed
}

public enum FetchContentType {
  case always
  case never
  case whenEmpty
}
