
import Foundation
import Models
import SwiftGraphQL

let subscriptionSelection = Selection.Subscription {
  Subscription(
    createdAt: try $0.createdAt().value,
    description: try $0.description(),
    subscriptionID: try $0.id(),
    name: try $0.name(),
    type: try SubscriptionType.from($0.type()),
    folder: try $0.folder(),
    fetchContentType: try FetchContentType.from($0.fetchContentType()),
    newsletterEmailAddress: try $0.newsletterEmail(),
    status: try SubscriptionStatus.make(from: $0.status()),
    unsubscribeHttpUrl: try $0.unsubscribeHttpUrl(),
    unsubscribeMailTo: try $0.unsubscribeMailTo(),
    updatedAt: try $0.updatedAt()?.value ?? Date(),
    url: try $0.url(),
    icon: try $0.icon()
  )
}

extension SubscriptionStatus {
  static func make(from status: Enums.SubscriptionStatus) -> SubscriptionStatus {
    switch status {
    case .active:
      return .active
    case .deleted:
      return .deleted
    case .unsubscribed:
      return .unsubscribed
    }
  }
}

extension SubscriptionType {
  static func from(_ other: Enums.SubscriptionType) -> SubscriptionType {
    switch other {
    case .rss:
      return .feed
    case .newsletter:
      return .newsletter
    }
  }
}

extension FetchContentType {
  static func from(_ other: Enums.FetchContentType) -> FetchContentType {
    switch other {
    case .always:
      return .always
    case .never:
      return .never
    case .whenEmpty:
      return .whenEmpty
    }
  }
  func toGQLType() -> Enums.FetchContentType {
    switch self {
    case .always:
      return .always
    case .never:
      return .never
    case .whenEmpty:
      return .whenEmpty
    }
  }
}
