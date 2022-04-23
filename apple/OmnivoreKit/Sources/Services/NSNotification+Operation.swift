//
//  NSNotification+Operation.swift
//
//
//  Created by Jackson Harper on 1/31/22.
//

import Foundation
import Models

public extension NSNotification {
  static let PushFeedItem = Notification.Name("PushFeedItem")
  static let OperationSuccess = Notification.Name("OperationSuccess")
  static let OperationFailure = Notification.Name("OperationFailure")

  static var pushFeedItemPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: PushFeedItem)
  }

  static var operationSuccessPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: OperationSuccess)
  }

  static var operationFailedPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: OperationFailure)
  }

  internal var operationMessage: String? {
    if let message = userInfo?["message"] as? String {
      return message
    }
    return nil
  }

  // TODO: re-enable later
//  static func pushFeedItem(feedItem: FeedItem-----D---ep) {
//    NotificationCenter.default.post(name: NSNotification.PushFeedItem, object: nil, userInfo: ["feedItem": feedItem])
//  }

  static func operationSuccess(message: String) {
    NotificationCenter.default.post(name: NSNotification.OperationSuccess, object: nil, userInfo: ["message": message])
  }

  static func operationFailed(message: String) {
    NotificationCenter.default.post(name: NSNotification.OperationFailure, object: nil, userInfo: ["message": message])
  }
}
