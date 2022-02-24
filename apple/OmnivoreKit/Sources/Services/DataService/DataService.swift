import Foundation
import Models

public final class DataService: ObservableObject {
  public static var registerIntercomUser: ((String) -> Void)?
  public static var showIntercomMessenger: (() -> Void)?

  public let appEnvironment: AppEnvironment
  public internal(set) var currentViewer: Viewer?
  let networker: Networker

  let highlightsCache = NSCache<AnyObject, CachedPDFHighlights>()
  let highlightsCacheQueue = DispatchQueue(label: "app.omnivore.highlights.cache.queue", attributes: .concurrent)

  public init(appEnvironment: AppEnvironment, networker: Networker) {
    self.appEnvironment = appEnvironment
    self.networker = networker
  }

  public func clearHighlights() {
    highlightsCache.removeAllObjects()
  }

  public func switchAppEnvironment(appEnvironment: AppEnvironment) {
    do {
      try ValetKey.appEnvironmentString.setValue(appEnvironment.rawValue)
      fatalError("App environment changed -- restarting app")
    } catch {
      fatalError("Unable to write to Keychain: \(error)")
    }
  }
}
