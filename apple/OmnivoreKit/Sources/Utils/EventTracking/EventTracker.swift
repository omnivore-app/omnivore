import Foundation
import Segment

public enum EventTracker {
  public static func start() {
    // invoke the closure that creates the segment instance
    _ = segment?.version()
  }

  public static func track(_ event: TrackableEvent) {
    segment?.track(name: event.name, properties: event.properties)
  }

  public static func registerUser(userID: String) {
    segment?.identify(userId: userID)
  }

  public static func recordUserTraits(userID: String, traits: [String: String]) {
    segment?.identify(userId: userID, traits: traits)
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
