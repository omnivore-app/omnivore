import Combine
import Foundation
import Models

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

  let persistentContainer: PersistentContainer
  var subscriptions = Set<AnyCancellable>()

  public init(appEnvironment: AppEnvironment, networker: Networker) {
    self.appEnvironment = appEnvironment
    self.networker = networker
    self.persistentContainer = PersistentContainer.make()

    persistentContainer.loadPersistentStores { _, error in
      if let error = error {
        fatalError("Core Data store failed to load with error: \(error)")
      }
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

public extension DataService {
  func prefetchPages(items: [FeedItem]) {
    guard let viewer = currentViewer else { return }

    for item in items {
      let slug = item.slug
      articleContentPublisher(username: viewer.username, slug: slug).sink(
        receiveCompletion: { _ in },
        receiveValue: { [weak self] articleContent in
          self?.pageCache.setObject(CachedPageContent(slug, articleContent), forKey: NSString(string: slug))
        }
      )
      .store(in: &subscriptions)
    }
  }

  func pageFromCache(slug: String) -> ArticleContent? {
    pageCache.object(forKey: NSString(string: slug))?.value
  }

  func invalidateCachedPage(slug: String?) {
    if let slug = slug {
      pageCache.removeObject(forKey: NSString(string: slug))
    }
  }
}
