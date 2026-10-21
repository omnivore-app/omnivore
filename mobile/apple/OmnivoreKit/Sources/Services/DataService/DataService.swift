import CoreData
import CoreImage
import Foundation
import Models
import OSLog
import QuickLookThumbnailing
import SwiftUI
import Utils

#if os(iOS)
  import UIKit
#else
  import AppKit
#endif

let logger = Logger(subsystem: "app.omnivore", category: "data-service")

public final class DataService: ObservableObject {
  public static var registerIntercomUser: ((String) -> Void)?
  public static var setIntercomUserHash: ((String) -> Void)?

  public static var showIntercomMessenger: (() -> Void)?

  public let appEnvironment: AppEnvironment
  public let networker: Networker

  public let prefetchQueue = OperationQueue()

  var persistentContainer: PersistentContainer
  public var backgroundContext: NSManagedObjectContext

  public var viewContext: NSManagedObjectContext {
    persistentContainer.viewContext
  }

  public var featureFlags = FeatureFlags()

  public var lastItemSyncTime: Date {
    get {
      guard
        let str = UserDefaults.standard.string(forKey: UserDefaultKey.lastItemSyncTime.rawValue),
        let date = DateFormatter.formatterISO8601.date(from: str)
      else {
        return Date(timeIntervalSinceReferenceDate: 0)
      }
      return date
    }
    set {
      logger.trace("last item sync updated to \(newValue)")
      let str = DateFormatter.formatterISO8601.string(from: newValue)
      UserDefaults.standard.set(str, forKey: UserDefaultKey.lastItemSyncTime.rawValue)
    }
  }

  public init(appEnvironment: AppEnvironment, networker: Networker) {
    self.appEnvironment = appEnvironment
    self.networker = networker
    self.persistentContainer = PersistentContainer.make()

    persistentContainer.loadPersistentStores { _, error in
      if let error = error {
        fatalError("Core Data store failed to load with error: \(error)")
      }
    }
    self.backgroundContext = persistentContainer.newBackgroundContext()

    backgroundContext.automaticallyMergesChangesFromParent = true
    backgroundContext.mergePolicy = NSMergePolicy.mergeByPropertyObjectTrump
  }

  public func cleanupDeletedItems(in context: NSManagedObjectContext) {
    let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()

    let calendar = Calendar.current
    let oneDayAgo = calendar.date(byAdding: .day, value: -1, to: Date())!

    let statePredicate = NSPredicate(format: "state == %@", "DELETED")
    let datePredicate = NSPredicate(format: "updatedAt < %@", oneDayAgo as NSDate)

    fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [statePredicate, datePredicate])

    do {
      let oldDeletedItems = try context.fetch(fetchRequest)

      for item in oldDeletedItems {
        context.delete(item)
      }

      try context.save()
    } catch {
      print("Error fetching or deleting objects: \(error)")
    }
  }

  public var currentViewer: Viewer? {
    let fetchRequest: NSFetchRequest<Models.Viewer> = Viewer.fetchRequest()
    fetchRequest.fetchLimit = 1 // we should only have one viewer saved
    return try? persistentContainer.viewContext.fetch(fetchRequest).first
  }

  public func switchAppEnvironment(appEnvironment: AppEnvironment) {
    do {
      try ValetKey.appEnvironmentString.setValue(appEnvironment.rawValue)
      clearCoreData()
      fatalError("App environment changed -- restarting app")
    } catch {
      fatalError("Unable to write to Keychain: \(error)")
    }
  }

  public func hasConnectionAndValidToken() async -> Bool {
    await networker.hasConnectionAndValidToken()
  }

  private func clearCoreData() {
    let storeContainer = persistentContainer.persistentStoreCoordinator

    do {
      for store in storeContainer.persistentStores {
        try storeContainer.destroyPersistentStore(
          at: store.url!,
          ofType: store.type,
          options: nil
        )
      }
    } catch {
      logger.debug("Failed to clear core data stores")
    }
  }

  func deleteAllEntities(entityName: String, inContext context: NSManagedObjectContext) {
    let deleteFetch = NSFetchRequest<NSFetchRequestResult>(entityName: entityName)
    let deleteRequest = NSBatchDeleteRequest(fetchRequest: deleteFetch)
    do {
      try context.execute(deleteRequest)
      try context.save()
    } catch {
      print("Error deleting all \(entityName) items.", error)
    }
  }

  private func clearDownloadedFiles() {
    let relevantTypes = ["pdf", "mp3", "speechMarks"]
    let fileMgr = FileManager()
    logger.trace("removing cached downloads")

    // clear the temporary files in the caches directory…
    if let cacheFileURLs = try? fileMgr.contentsOfDirectory(
      at: URL.om_cachesDirectory,
      includingPropertiesForKeys: .none,
      options: .skipsHiddenFiles
    ) {
      logger.trace("\(cacheFileURLs.count) file URLs in caches directory")
      for fileURL in cacheFileURLs where relevantTypes.contains(fileURL.pathExtension) {
        logger.trace("removing \(fileURL.absoluteString)")
        try? fileMgr.removeItem(at: fileURL)
      }
    }

    // …and also the copies written to Documents
    let resourceKeys = Set<URLResourceKey>([.nameKey, .isDirectoryKey])
    if let documentsFileURLs = try? fileMgr.contentsOfDirectory(
      at: URL.om_documentsDirectory,
      includingPropertiesForKeys: Array(resourceKeys),
      options: .skipsHiddenFiles
    ) {
      logger.trace("\(documentsFileURLs.count) file URLs in documents directory")
      for fileURL in documentsFileURLs {
        guard
          let resourceValues = try? fileURL.resourceValues(forKeys: resourceKeys),
          let isDirectory = resourceValues.isDirectory,
          let name = resourceValues.name
        else {
          continue
        }
        if isDirectory {
          if name.hasPrefix("audio-") {
            logger.trace("removing \(fileURL.absoluteString)")
            try? fileMgr.removeItem(at: fileURL)
          }
        } else if relevantTypes.contains(fileURL.pathExtension) {
          logger.trace("removing \(fileURL.absoluteString)")
          try? fileMgr.removeItem(at: fileURL)
        }
      }
    }
  }

  public static func deleteLocalStorage() {
    do {
      if let storeURL = PersistentContainer.path() {
        try FileManager.default.removeItem(atPath: storeURL.path)
      }
    } catch {
      print(error.localizedDescription)
      print("ERROR: ", error)
    }
  }

  public func resetLocalStorage() {
    UserDefaults.standard.set(nil, forKey: UserDefaultKey.lastSelectedTabItem.rawValue)

    lastItemSyncTime = Date(timeIntervalSinceReferenceDate: 0)

    clearCoreData()
    clearDownloadedFiles()

    persistentContainer = PersistentContainer.make()
    persistentContainer.loadPersistentStores { _, error in
      if let error = error {
        fatalError("Core Data store failed to load with error: \(error)")
      }
    }
    backgroundContext = persistentContainer.newBackgroundContext()
  }

  private static func isFirstTimeRunningNewAppBuild() -> Bool {
    let appVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String
    let buildNumber = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String

    guard let appVersion = appVersion, let buildNumber = buildNumber else { return false }

    let lastUsedAppVersion = UserDefaults.standard.string(forKey: UserDefaultKey.lastUsedAppVersion.rawValue)
    UserDefaults.standard.set(appVersion, forKey: UserDefaultKey.lastUsedAppVersion.rawValue)

    let lastUsedAppBuildNumber = UserDefaults.standard.string(forKey: UserDefaultKey.lastUsedAppBuildNumber.rawValue)
    UserDefaults.standard.set(buildNumber, forKey: UserDefaultKey.lastUsedAppBuildNumber.rawValue)

    let isFirstRunOfVersion = (lastUsedAppVersion ?? "unknown") != appVersion
    let isFirstRunWithBuildNumber = (lastUsedAppBuildNumber ?? "unknown") != buildNumber

    return isFirstRunOfVersion || isFirstRunWithBuildNumber
  }

  // swiftlint:disable:next function_body_length
  public func persistPageScrapePayload(
    _ pageScrape: PageScrapePayload,
    requestId: String
  ) async throws -> NSManagedObjectID? {
    var objectID: NSManagedObjectID?

    let normalizedURL = normalizeURL(pageScrape.url)

    try await backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "pageURLString = %@", normalizedURL)

      let currentTime = Date()
      let existingItem = try? self.backgroundContext.fetch(fetchRequest).first
      let linkedItem = existingItem ?? LibraryItem(entity: LibraryItem.entity(), insertInto: self.backgroundContext)

      linkedItem.createdId = requestId
      linkedItem.id = existingItem?.unwrappedID ?? requestId
      linkedItem.title = normalizedURL
      linkedItem.pageURLString = normalizedURL
      linkedItem.state = existingItem != nil ? existingItem?.state : "PROCESSING"
      linkedItem.serverSyncStatus = Int64(ServerSyncStatus.needsCreation.rawValue)
      linkedItem.savedAt = currentTime
      linkedItem.createdAt = currentTime
      linkedItem.isArchived = false

      linkedItem.imageURLString = nil
      linkedItem.onDeviceImageURLString = nil
      linkedItem.descriptionText = nil
      linkedItem.publisherURLString = nil
      linkedItem.author = nil
      linkedItem.publishDate = nil

      if let currentViewer = self.currentViewer, let username = currentViewer.username {
        linkedItem.slug = "\(username)/\(requestId)"
      } else {
        // Technically this is invalid, but I don't think slug is used at all locally anymore
        linkedItem.slug = requestId
      }

      switch pageScrape.contentType {
      case let .pdf(localUrl):
        linkedItem.contentReader = "PDF"
        linkedItem.tempPDFURL = localUrl
        linkedItem.title = PDFUtils.titleFromPdfFile(pageScrape.url)
      case let .html(html: html, title: title, iconURL: _, highlightData: _):
        linkedItem.contentReader = "WEB"
        linkedItem.originalHtml = html
        linkedItem.title = title ?? PDFUtils.titleFromPdfFile(pageScrape.url)
      case .none:
        linkedItem.contentReader = "WEB"
      }

      do {
        try self.backgroundContext.save()
        logger.debug("local ArticleContent saved succesfully")
        objectID = linkedItem.objectID
      } catch {
        self.backgroundContext.rollback()

        print("Failed to save ArticleContent", error.localizedDescription, error)
        throw error
      }
    }
    return objectID
  }

  public func tryUpdateFeatureFlags() async {
    if let features = (try? await fetchViewer())?.enabledFeatures {
      featureFlags.digestEnabled = features.contains("ai-digest")
      featureFlags.explainEnabled = features.contains("ai-explain")
    }
  }
}
