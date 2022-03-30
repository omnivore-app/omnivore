import Combine
import Foundation
import Models

public class CacheManager: NSObject, NSCacheDelegate {
  public func cache(_: NSCache<AnyObject, AnyObject>, willEvictObject obj: Any) {
    print("evicting object", obj)
  }
}

public final class DataService: ObservableObject {
  public static var registerIntercomUser: ((String) -> Void)?
  public static var showIntercomMessenger: (() -> Void)?

  public let appEnvironment: AppEnvironment
  public internal(set) var currentViewer: Viewer?
  let networker: Networker

  public let pageCache = NSCache<NSString, CachedPageContent>()
  let pageCacheQueue = DispatchQueue.global(qos: .background)

  let highlightsCache = NSCache<AnyObject, CachedPDFHighlights>()
  let highlightsCacheQueue = DispatchQueue(label: "app.omnivore.highlights.cache.queue", attributes: .concurrent)

  let cacheManager: CacheManager
  var subscriptions = Set<AnyCancellable>()

  public init(appEnvironment: AppEnvironment, networker: Networker) {
    self.appEnvironment = appEnvironment
    self.networker = networker
    self.cacheManager = CacheManager()
    pageCache.delegate = cacheManager
  }

  public func prefetchPages(items: [FeedItem]) {
    print("prefetching items", items, "cost limit", pageCache.countLimit)

    guard let viewer = currentViewer else { return }

    for item in items {
      let slug = item.slug
      articleContentPublisher(username: viewer.username, slug: slug).sink(
        receiveCompletion: { _ in },
        receiveValue: { [weak self] articleContent in
          self?.pageCache.setObject(CachedPageContent(articleContent), forKey: NSString(string: slug))
        }
      )
      .store(in: &subscriptions)
    }
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
