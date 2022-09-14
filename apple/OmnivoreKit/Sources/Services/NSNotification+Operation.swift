import CoreData
import Foundation
import Models

public extension NSNotification {
  static let PushJSONArticle = Notification.Name("PushJSONArticle")
  static let PushReaderItem = Notification.Name("PushReaderItem")
  static let OperationSuccess = Notification.Name("OperationSuccess")
  static let OperationFailure = Notification.Name("OperationFailure")
  static let ReaderSettingsChanged = Notification.Name("ReaderSettingsChanged")
  static let SpeakingReaderItem = Notification.Name("SpeakingReaderItem")

  static var pushFeedItemPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: PushJSONArticle)
  }

  static var pushReaderItemPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: PushReaderItem)
  }

  static var operationSuccessPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: OperationSuccess)
  }

  static var operationFailedPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: OperationFailure)
  }

  static var readerSettingsChangedPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: ReaderSettingsChanged)
  }

  static var speakingReaderItemPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: SpeakingReaderItem)
  }

  internal var operationMessage: String? {
    if let message = userInfo?["message"] as? String {
      return message
    }
    return nil
  }

  static func pushJSONArticle(article: JSONArticle) {
    NotificationCenter.default.post(
      name: NSNotification.PushJSONArticle,
      object: nil,
      userInfo: ["article": article]
    )
  }

  static func pushReaderItem(objectID: NSManagedObjectID) {
    NotificationCenter.default.post(
      name: NSNotification.PushReaderItem,
      object: nil,
      userInfo: ["objectID": objectID]
    )
  }

  static func operationSuccess(message: String) {
    NotificationCenter.default.post(name: NSNotification.OperationSuccess, object: nil, userInfo: ["message": message])
  }

  static func operationFailed(message: String) {
    NotificationCenter.default.post(name: NSNotification.OperationFailure, object: nil, userInfo: ["message": message])
  }

  static func readerSettingsChanged() {
    NotificationCenter.default.post(name: NSNotification.ReaderSettingsChanged, object: nil)
  }
}
