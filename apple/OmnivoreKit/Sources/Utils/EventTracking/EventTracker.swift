import Foundation
import PostHog

public enum EventTracker {
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

  public static func trackForDebugging(_ message: String) {
    #if DEBUG
      track(.debugMessage(message: message))
    #endif
  }

  public static func track(_ event: TrackableEvent) {
    posthog?.capture(event.name, properties: event.properties)
  }

  public static func registerUser(userID: String) {
    posthog?.identify(userID)
  }

  public static func reset() {
    posthog?.reset()
  }
}
