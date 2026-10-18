import Foundation

#if os(iOS)
  import PostHog
#endif

@MainActor
public enum EventTracker {
  #if os(iOS)
    public static var posthog: PHGPostHog? = {
      guard let writeKey = AppKeys.sharedInstance?.posthogClientKey else {
        return nil
      }

      guard let posthogInstanceAddress = AppKeys.sharedInstance?.posthogInstanceAddress else {
        return nil
      }

      let configuration = PHGPostHogConfiguration(apiKey: writeKey, host: posthogInstanceAddress)

      configuration.recordScreenViews = false
      configuration.captureApplicationLifecycleEvents = true

      PHGPostHog.setup(with: configuration)
      return PHGPostHog.shared()
    }()
  #endif

  public static func trackForDebugging(_ message: String) {
    #if DEBUG
      track(.debugMessage(message: message))
    #endif
  }

  public static func track(_ event: TrackableEvent) {
    #if os(iOS)
      posthog?.capture(event.name, properties: event.properties)
    #endif
  }

  public static func registerUser(userID: String) {
    #if os(iOS)
      posthog?.identify(userID)
    #endif
  }

  public static func reset() {
    #if os(iOS)
      posthog?.reset()
    #endif
  }
}
