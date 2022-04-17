import Combine
import CoreData
import Foundation
import Models

public final class DataService: ObservableObject {
  public static var registerIntercomUser: ((String) -> Void)?
  public static var showIntercomMessenger: (() -> Void)?

  public let appEnvironment: AppEnvironment
  public internal(set) var currentViewer: Viewer?
  let networker: Networker

  let persistentContainer: PersistentContainer
  var subscriptions = Set<AnyCancellable>()
  public var deletedHighlightsIDs = Set<String>()

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
    deletedHighlightsIDs.removeAll()

    let fetchRequest: NSFetchRequest<Models.PersistedHighlight> = PersistedHighlight.fetchRequest()

    let highlights = (try? persistentContainer.viewContext.fetch(fetchRequest)) ?? []

    for highlight in highlights {
      persistentContainer.viewContext.delete(highlight)
    }

    do {
      try persistentContainer.viewContext.save()
    } catch {
      print("failed to delete objects")
    }
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
        receiveValue: { _ in }
      )
      .store(in: &subscriptions)
    }
  }

  func pageFromCache(slug: String) -> ArticleContent? {
    let fetchRequest: NSFetchRequest<Models.PersistedArticleContent> = PersistedArticleContent.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "slug = %@", slug
    )
    if let htmlContent = try? persistentContainer.viewContext.fetch(fetchRequest).first?.htmlContent {
      return ArticleContent(htmlContent: htmlContent, highlights: [])
    } else {
      return nil
    }
  }

  func invalidateCachedPage(slug _: String?) {}
}
