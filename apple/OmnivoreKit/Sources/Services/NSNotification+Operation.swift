import CoreData
import Foundation
import Models

public extension NSNotification {
  static let PushLibraryItem = Notification.Name("PushLibraryItem")
  static let SnackBar = Notification.Name("SnackBar")
  static let OperationFailure = Notification.Name("OperationFailure")
  static let ReaderSettingsChanged = Notification.Name("ReaderSettingsChanged")
  static let SpeakingReaderItem = Notification.Name("SpeakingReaderItem")
  static let DisplayProfile = Notification.Name("DisplayProfile")
  static let Logout = Notification.Name("Logout")
  static let ScrollToTop = Notification.Name("ScrollToTop")
  static let PerformSync = Notification.Name("PerformSync")

  static var performSyncPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: PerformSync)
  }

  static var pushFeedItemPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: PushLibraryItem)
  }

  static var snackBarPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: SnackBar)
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

  static var scrollToTopPublisher: NotificationCenter.Publisher {
    NotificationCenter.default.publisher(for: ScrollToTop)
  }

  internal var operationMessage: String? {
    if let message = userInfo?["message"] as? String {
      return message
    }
    return nil
  }

  static func pushLibraryItem(folder: String?, libraryItemId: String) {
    NotificationCenter.default.post(
      name: NSNotification.PushLibraryItem,
      object: nil,
      userInfo: [
        "folder": folder ?? "inbox",
        "libraryItemId": libraryItemId
      ]
    )
  }

  static func snackBar(message: String, undoAction: (() -> Void)?, dismissAfter: Int?) {
    NotificationCenter.default.post(name: NSNotification.SnackBar,
                                    object: nil,
                                    userInfo: ["message": message, 
                                               "undoAction": undoAction as Any,
                                               "dismissAfter": dismissAfter as Any])
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
