import Foundation

#if DEBUG
  public let isDebug = true
#else
  public let isDebug = false
#endif

public enum FeatureFlag {
  public static let enableSnoozeFromShareExtension = false
  public static let enableRemindersFromShareExtension = false
  public static let enableReadNow = false
  public static let enablePushNotifications = false
  public static let enableShareButton = false
  public static let enableSnooze = false
  public static let enableGridCardsOnPhone = true
  public static let enableTextToSpeechButton = true
  public static let enableHighlightsView = true
}
