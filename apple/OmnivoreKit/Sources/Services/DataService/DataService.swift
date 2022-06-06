import Combine
import CoreData
import CoreImage
import Foundation
import Models
import OSLog
import QuickLookThumbnailing
import UIKit
import Utils

let logger = Logger(subsystem: "app.omnivore", category: "data-service")

public final class DataService: ObservableObject {
  public static var registerIntercomUser: ((String) -> Void)?
  public static var showIntercomMessenger: (() -> Void)?

  public let appEnvironment: AppEnvironment
  public let networker: Networker

  var persistentContainer: PersistentContainer
  public var backgroundContext: NSManagedObjectContext
  var subscriptions = Set<AnyCancellable>()

  public var viewContext: NSManagedObjectContext {
    persistentContainer.viewContext
  }

  public init(appEnvironment: AppEnvironment, networker: Networker) {
    self.appEnvironment = appEnvironment
    self.networker = networker
    self.persistentContainer = PersistentContainer.make()
    self.backgroundContext = persistentContainer.newBackgroundContext()
    backgroundContext.mergePolicy = NSMergePolicy.mergeByPropertyObjectTrump

    if isFirstTimeRunningNewAppBuild() {
      resetCoreData()
    } else {
      persistentContainer.loadPersistentStores { _, error in
        if let error = error {
          fatalError("Core Data store failed to load with error: \(error)")
        }
      }
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

  private func resetCoreData() {
    clearCoreData()

    persistentContainer = PersistentContainer.make()
    persistentContainer.loadPersistentStores { _, error in
      if let error = error {
        fatalError("Core Data store failed to load with error: \(error)")
      }
    }
    backgroundContext = persistentContainer.newBackgroundContext()
  }

  private func isFirstTimeRunningNewAppBuild() -> Bool {
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

  public func persistPageScrapePayload(_ pageScrape: PageScrapePayload, requestId: String) async throws {
    let normalizedURL = normalizeURL(pageScrape.url)

    try await backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "pageURLString = %@", normalizedURL)

      let currentTime = Date()
      let existingItem = try? self.backgroundContext.fetch(fetchRequest).first
      let linkedItem = existingItem ?? LinkedItem(entity: LinkedItem.entity(), insertInto: self.backgroundContext)

      linkedItem.id = existingItem?.unwrappedID ?? requestId
      linkedItem.title = normalizedURL
      linkedItem.pageURLString = normalizedURL
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

      if let currentViewer = self.currentViewer {
        linkedItem.slug = "\(currentViewer)/\(requestId)"
      } else {
        // Technically this is invalid, but I don't think slug is used at all locally anymore
        linkedItem.slug = requestId
      }

      switch pageScrape.contentType {
      case let .pdf(localUrl):
        linkedItem.contentReader = "PDF"
        linkedItem.localPdfURL = localUrl.absoluteString
        linkedItem.title = PDFUtils.titleFromPdfFile(pageScrape.url)
//        let thumbnailUrl = PDFUtils.thumbnailUrl(localUrl: localUrl)
//        linkedItem.imageURLString = await PDFUtils.createThumbnailFor(inputUrl: localUrl, at: thumbnailUrl)

      case let .html(html: html, title: title, iconURL: iconURL):
        linkedItem.contentReader = "WEB"
        linkedItem.originalHtml = html
        linkedItem.imageURLString = iconURL
        linkedItem.title = title ?? PDFUtils.titleFromPdfFile(pageScrape.url)
      case .none:
        print("SAVING URL", linkedItem.unwrappedPageURLString)
        linkedItem.contentReader = "WEB"
      }

      do {
        try self.backgroundContext.save()
        logger.debug("ArticleContent saved succesfully")
      } catch {
        self.backgroundContext.rollback()

        print("Failed to save ArticleContent", error.localizedDescription, error)
        throw error
      }
    }
  }
}
