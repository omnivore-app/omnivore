import Foundation

#if DEBUG
  public let isDebug = true
#else
  public let isDebug = false
#endif

public enum FeatureFlag {
  public static let showAccountDeletion = false
  public static let enableSnoozeFromShareExtension = false
  public static let enableReadNowFromShareExtension = false
  public static let enableRemindersFromShareExtension = false
  public static let enablePushNotifications = false
  public static let enableShareButton = false
  public static let enableSnooze = false
  public static let enableLabels = false
  public static let useLocalWebView = true
}
