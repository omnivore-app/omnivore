#if os(macOS)
  import Foundation

  public final class AudioController: ObservableObject {
    public init() {}

    public func preload(itemIDs _: [String]) {}

    public func downloadForOffline(itemID _: String) -> Bool { true }
  }
#endif
