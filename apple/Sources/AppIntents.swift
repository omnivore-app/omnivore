#if os(iOS)
  import App
  import AppIntents
  import CoreData
  import Firebase
  import FirebaseMessaging
  import Foundation
  import Models
  import Services
  import UIKit
  import Utils

  @available(iOS 16.0, *)
  func filterQuery(predicte: NSPredicate, sort: NSSortDescriptor, limit: Int = 10) async throws -> [LibraryItemEntity] {
    let context = await Services().dataService.viewContext
    let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
    fetchRequest.fetchLimit = limit
    fetchRequest.predicate = predicte
    fetchRequest.sortDescriptors = [sort]

    return try context.performAndWait {
      do {
        return try context.fetch(fetchRequest).map { LibraryItemEntity(item: $0) }
      } catch {
        throw error
      }
    }
  }

  @available(iOS 16.0, *)
  enum OmnivoreIntentError: Swift.Error, CustomLocalizedStringResourceConvertible {
    case general
    case message(_ message: String)

    var localizedStringResource: LocalizedStringResource {
      switch self {
      case let .message(message): return "Error: \(message)"
      case .general: return "My general error"
      }
    }
  }

  @available(iOS 16.0, *)
  struct LibraryItemEntity: AppEntity {
    static var defaultQuery = LibraryItemQuery()

    let id: UUID

    @Property(title: "Title")
    var title: String
    @Property(title: "Orignal URL")
    var originalURL: String?
    @Property(title: "Omnivore web URL")
    var omnivoreWebURL: String
    @Property(title: "Omnivore deeplink URL")
    var omnivoreShortcutURL: String
    @Property(title: "Author if set")
    var author: String?
    @Property(title: "Site name if set")
    var siteName: String?
    @Property(title: "Published date if set")
    var publishedAt: Date?
    @Property(title: "Time the item was saved")
    var savedAt: Date?

    init(item: Models.LibraryItem) {
      self.id = UUID(uuidString: item.unwrappedID)!
      self.title = item.unwrappedTitle
      self.originalURL = item.pageURLString
      self.omnivoreWebURL = "https://omnivore.app/me/\(item.slug!)"
      self.omnivoreShortcutURL = "omnivore://read/\(item.unwrappedID)"
      self.author = item.author
      self.siteName = item.siteName
      self.publishedAt = item.publishDate
      self.savedAt = item.savedAt
    }

    static var typeDisplayRepresentation = TypeDisplayRepresentation(
      stringLiteral: "Library Item"
    )

    var displayRepresentation: DisplayRepresentation {
      DisplayRepresentation(title: "\(title)")
    }
  }

  @available(iOS 16.0, *)
  struct LibraryItemQuery: EntityQuery {
    func entities(for itemIds: [UUID]) async throws -> [LibraryItemEntity] {
      let predicate = NSPredicate(format: "id IN %@", itemIds)
      let sort = FeaturedItemFilter.continueReading.sortDescriptor // sort by read recency
      return try await filterQuery(predicte: predicate, sort: sort)
    }

    func suggestedEntities() async throws -> [LibraryItemEntity] {
      try await filterQuery(
        predicte: FeaturedItemFilter.continueReading.predicate,
        sort: FeaturedItemFilter.continueReading.sortDescriptor,
        limit: 10
      )
    }
  }

  @available(iOS 16.0, *)
  public struct OmnivoreAppShorcuts: AppShortcutsProvider {
    @AppShortcutsBuilder public static var appShortcuts: [AppShortcut] {
      AppShortcut(intent: SaveToOmnivoreIntent(), phrases: ["Save URL to \(.applicationName)"])
    }
  }

  @available(iOS 16.0, *)
  struct SaveToOmnivoreIntent: AppIntent {
    static var title: LocalizedStringResource = "Save to Omnivore"
    static var description: LocalizedStringResource = "Save a URL to your Omnivore library"

    static var parameterSummary: some ParameterSummary {
      Summary("Save \(\.$link) to your Omnivore library.")
    }

    @Parameter(title: "link")
    var link: URL

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog & ReturnsValue<URL> {
      let requestId = UUID().uuidString.lowercased()
      let result  = try? await Services().dataService.saveURL(id: requestId, url: link.absoluteString)
      if let result = result, let deepLink = URL(string: "omnivore://read/\(result)") {
        return .result(value: deepLink, dialog: "Link saved")
      }
      throw OmnivoreIntentError.message("Unable to save link")
    }
  }

  @available(iOS 16.0, *)
  struct SaveToOmnivoreAndReturnDeeplinkIntent: AppIntent {
    static var title: LocalizedStringResource = "Save to Omnivore"
    static var description: LocalizedStringResource = "Save a URL to your Omnivore library"

    static var parameterSummary: some ParameterSummary {
      Summary("Save \(\.$link) to your Omnivore library.")
    }

    @Parameter(title: "link")
    var link: URL

    @MainActor
    func perform() async throws -> some IntentResult & ReturnsValue<URL> {
      let requestId = UUID().uuidString.lowercased()
      let result  = try? await Services().dataService.saveURL(id: requestId, url: link.absoluteString)
      if let result = result, let deepLink = URL(string: "omnivore://read/\(result)") {
        return .result(value: deepLink)
      }
      throw OmnivoreIntentError.message("Unable to save link")
    }
  }

  @available(iOS 16.4, *)
  struct ReadInOmnivoreIntent: ForegroundContinuableIntent {
    static var title: LocalizedStringResource = "Save and read a URL in Omnivore"
    static var openAppWhenRun: Bool = false

    @Parameter(title: "link")
    var link: URL

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
      let requestId = UUID().uuidString.lowercased()
      _ = try? await Services().dataService.saveURL(id: requestId, url: link.absoluteString)

      throw needsToContinueInForegroundError("Please continue to open the app.") {
        UIApplication.shared.open(URL(string: "omnivore://read/\(requestId)")!)
      }

      return .result(dialog: "I opened the app.")
    }
  }

  @available(iOS 16.4, *)
  struct GetMostRecentLibraryItem: AppIntent {
    static let title: LocalizedStringResource = "Get most recently read library item"

    func perform() async throws -> some IntentResult & ReturnsValue<LibraryItemEntity?> {
      let result = try await filterQuery(
        predicte: LinkedItemFilter.all.predicate,
        sort: FeaturedItemFilter.continueReading.sortDescriptor,
        limit: 10
      )

      if let result = result.first {
        return .result(value: result)
      }
      return .result(value: nil)
    }
  }

  @available(iOS 16.4, *)
  struct GetContinueReadingLibraryItems: AppIntent {
    static let title: LocalizedStringResource = "Get your continue reading library items"

    func perform() async throws -> some IntentResult & ReturnsValue<[LibraryItemEntity]> {
      let result = try await filterQuery(
        predicte: FeaturedItemFilter.continueReading.predicate,
        sort: FeaturedItemFilter.continueReading.sortDescriptor,
        limit: 10
      )

      return .result(value: result)
    }
  }

  @available(iOS 16.4, *)
  struct GetFollowingLibraryItems: AppIntent {
    static let title: LocalizedStringResource = "Get your following library items"

    func perform() async throws -> some IntentResult & ReturnsValue<[LibraryItemEntity]> {
      let savedAtSort = NSSortDescriptor(key: #keyPath(Models.LibraryItem.savedAt), ascending: false)
      let folderPredicate = NSPredicate(
        format: "%K == %@", #keyPath(Models.LibraryItem.folder), "following"
      )

      let result = try await filterQuery(
        predicte: folderPredicate,
        sort: savedAtSort,
        limit: 10
      )

      return .result(value: result)
    }
  }

  @available(iOS 16.4, *)
  struct GetSavedLibraryItems: AppIntent {
    static let title: LocalizedStringResource = "Get your saved library items"

    func perform() async throws -> some IntentResult & ReturnsValue<[LibraryItemEntity]> {
      let savedAtSort = NSSortDescriptor(key: #keyPath(Models.LibraryItem.savedAt), ascending: false)
      let folderPredicate = NSPredicate(
        format: "%K == %@", #keyPath(Models.LibraryItem.folder), "inbox"
      )

      let result = try await filterQuery(
        predicte: folderPredicate,
        sort: savedAtSort,
        limit: 10
      )

      return .result(value: result)
    }
  }

#endif
