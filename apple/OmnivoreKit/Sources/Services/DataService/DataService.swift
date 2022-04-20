import Combine
import CoreData
import Foundation
import Models
import OSLog

public final class DataService: ObservableObject {
  public static var registerIntercomUser: ((String) -> Void)?
  public static var showIntercomMessenger: (() -> Void)?

  public let appEnvironment: AppEnvironment
  let networker: Networker
  static let logger = Logger(subsystem: "app.omnivore", category: "data-service")

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

  public var currentViewer: Viewer? {
    let fetchRequest: NSFetchRequest<Models.Viewer> = Viewer.fetchRequest()
    fetchRequest.fetchLimit = 1 // we should only have one viewer saved
    return try? persistentContainer.viewContext.fetch(fetchRequest).first
  }

  public func clearHighlights() {
    deletedHighlightsIDs.removeAll()

    let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()

    let highlights = (try? persistentContainer.viewContext.fetch(fetchRequest)) ?? []

    for highlight in highlights {
      persistentContainer.viewContext.delete(highlight)
    }

    do {
      try persistentContainer.viewContext.save()
    } catch {
      DataService.logger.debug("failed to delete objects")
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
  func prefetchPages(items: [FeedItemDep]) {
    guard let username = currentViewer?.username else { return }

    for item in items {
      let slug = item.slug
      articleContentPublisher(username: username, slug: slug).sink(
        receiveCompletion: { _ in },
        receiveValue: { _ in }
      )
      .store(in: &subscriptions)
    }
  }

  func pageFromCache(slug: String) -> ArticleContent? {
    // TODO: cerate highlightsJSON from stored highlights
//    let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
//    fetchRequest.predicate = NSPredicate(
//      format: "slug == %@", slug
//    )
//
//    guard let linkedItem = try? persistentContainer.viewContext.fetch(fetchRequest).first else { return nil }
//
//    let highlightsFetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
//    fetchRequest.predicate = NSPredicate(
//      format: "linkedItemId == %@", linkedItem.id ?? ""
//    )
//
//    let highlights = (try? persistentContainer.viewContext.fetch(highlightsFetchRequest)) ?? []

    let fetchRequest: NSFetchRequest<Models.PersistedArticleContent> = PersistedArticleContent.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "slug = %@", slug
    )

    if let articleContent = (try? persistentContainer.viewContext.fetch(fetchRequest))?.first {
      return ArticleContent(
        htmlContent: articleContent.htmlContent ?? "",
        highlightsJSONString: articleContent.highlightsJSONString ?? ""
      )
    } else {
      return nil
    }
  }

  func invalidateCachedPage(slug _: String?) {}
}

// TODO: move to util file
extension Optional where Wrapped == NSSet {
  func asArray<T: Hashable>(of _: T.Type) -> [T] {
    if let set = self as? Set<T> {
      return Array(set)
    }
    return [T]()
  }
}
