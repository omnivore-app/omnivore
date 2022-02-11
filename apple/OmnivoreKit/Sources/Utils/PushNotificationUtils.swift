import Foundation
import UserNotifications

public extension UNUserNotificationCenter {
  /// Shows prompt to user to allow push notifications
  /// If previously denied then no prompt is shown
  func requestAuth() {
    // Only the first call to this function will result in a prompt
    // If user denies the first time then that gets saved to device settings
    requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
      guard error != nil else { return }

      if !granted {
        // Maybe show instructions to change in settings?
        print("user denied push notifications")
      }
    }
  }
}
