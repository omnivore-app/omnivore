import Foundation
import PostHog
import Segment

public enum EventTracker {
  public static func start() {
    // invoke the closure that creates the segment instance
    _ = segment?.version()
    _ = posthog?.enable()
    print("POSTHOG: ", posthog)
    print("got posthog")
  }

  public static func trackForDebugging(_ message: String) {
    #if DEBUG
      track(.debugMessage(message: message))
    #endif
  }

  public static func track(_ event: TrackableEvent) {
    segment?.track(name: event.name, properties: event.properties)
    posthog?.capture(event.name, properties: event.properties)
  }

  public static func registerUser(userID: String) {
    segment?.identify(userId: userID)
    posthog?.identify(userID)
  }
}

private let segment: Analytics? = {
  guard let writeKey = AppKeys.sharedInstance?.segmentClientKey else {
    return nil
  }

  let config = Configuration(writeKey: writeKey)
    .flushAt(20) // default is 20
    .trackApplicationLifecycleEvents(true) // default is true
    .autoAddSegmentDestination(true) // default is true
    .flushInterval(30) // default is 30 seconds
    .trackDeeplinks(true) // default is true

  return Analytics(configuration: config)
}()

private let posthog: PHGPostHog? = {
  guard let apiKey = AppKeys.sharedInstance?.posthogClientKey else {
    return nil
  }

  let configuration = PHGPostHogConfiguration(apiKey: apiKey)

  PHGPostHog.setup(with: configuration)
  return PHGPostHog.shared()
}()
