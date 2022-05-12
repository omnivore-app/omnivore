import Combine
import CoreData
import Foundation
import Models
import OSLog
import Utils

let logger = Logger(subsystem: "app.omnivore", category: "data-service")

public final class DataService: ObservableObject {
  public static var registerIntercomUser: ((String) -> Void)?
  public static var showIntercomMessenger: (() -> Void)?

  public let appEnvironment: AppEnvironment
  let networker: Networker

  var persistentContainer: PersistentContainer
  var backgroundContext: NSManagedObjectContext
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

    if isFirstTimeRunningNewAppVersion() {
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
      fatalError("App environment changed -- restarting app")
    } catch {
      fatalError("Unable to write to Keychain: \(error)")
    }
  }

  private func resetCoreData() {
    let storeContainer =
      persistentContainer.persistentStoreCoordinator

    do {
      for store in storeContainer.persistentStores {
        try storeContainer.destroyPersistentStore(
          at: store.url!,
          ofType: store.type,
          options: nil
        )
      }
      persistentContainer = PersistentContainer.make()
      persistentContainer.loadPersistentStores { _, error in
        if let error = error {
          fatalError("Core Data store failed to load with error: \(error)")
        }
      }
      backgroundContext = persistentContainer.newBackgroundContext()
    } catch {
      logger.debug("Failed to reset core data stores")
    }
  }

  private func isFirstTimeRunningNewAppVersion() -> Bool {
    let appVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString")
    guard let appVersion = appVersion as? String else { return false }

    let lastUsedAppVersion = UserDefaults.standard.string(forKey: UserDefaultKey.lastUsedAppVersion.rawValue)
    let isFirstRun = (lastUsedAppVersion ?? "unknown") != appVersion
    UserDefaults.standard.set(appVersion, forKey: UserDefaultKey.lastUsedAppVersion.rawValue)
    return isFirstRun
  }
}
