#if os(macOS)
  import Foundation

  public final class AudioController: ObservableObject {
    public init() {}

    public func preload(itemIDs _: [String]) {}

    public func downloadForOffline(itemID _: String) -> Bool { true }

    func updateDuration(forItem _: SpeechItem, newDuration _: TimeInterval) {}

    public func stopWithError() {}

    public static func removeAudioFiles(itemID _: String) {}
  }
#endif
