import CoreData
import Foundation
import Models

public extension NSNotification {
  static let PushJSONArticle = Notification.Name("PushJSONArticle")
  static let PushReaderItem = Notification.Name("PushReaderItem")
  static let LibrarySnackBar = Notification.Name("LibrarySnackBar")
  static let ReaderSnackBar = Notification.Name("ReaderSnackBar")
  static let OperationFailure = Notification.Name("OperationFailure")
  static let ReaderSettingsChanged = Notification.Name("ReaderSettingsChanged")
  static let SpeakingReaderItem = Notification.Name("SpeakingReaderItem")
  static let DisplayProfile = Notification.Name("DisplayProfile")
  static let Logout = Notification.Name("Logout")

  static var pushFeedItemPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: PushJSONArticle)
  }

  static var pushReaderItemPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: PushReaderItem)
  }

  static var readerSnackBarPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: ReaderSnackBar)
  }

  static var librarySnackBarPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: LibrarySnackBar)
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

  static var displayProfilePublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: DisplayProfile)
  }

  static var logoutPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: Logout)
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

  static func librarySnackBar(message: String, undoAction: (() -> Void)?) {
    NotificationCenter.default.post(name: NSNotification.LibrarySnackBar,
                                    object: nil,
                                    userInfo: ["message": message, "undoAction": undoAction as Any])
  }

  static func operationFailed(message: String) {
    NotificationCenter.default.post(name: NSNotification.OperationFailure, object: nil, userInfo: ["message": message])
  }

  static func readerSettingsChanged() {
    NotificationCenter.default.post(name: NSNotification.ReaderSettingsChanged, object: nil)
  }

  static func logout() {
    NotificationCenter.default.post(name: NSNotification.Logout, object: nil)
  }

  static func displayProfile() {
    NotificationCenter.default.post(name: NSNotification.DisplayProfile, object: nil)
  }
}
