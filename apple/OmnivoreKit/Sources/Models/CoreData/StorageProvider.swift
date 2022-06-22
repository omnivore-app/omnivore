import CoreData
import Foundation
import OSLog

let logger = Logger(subsystem: "app.omnivore", category: "models")

/// An `NSPersistentContainer` subclass that lives in the `Models` package so that
/// the data model is looked for in the same package bundle (rather than the main bundle)
public class PersistentContainer: NSPersistentContainer {
  public static func make() -> PersistentContainer {
    let modelURL = Bundle.module.url(forResource: "CoreDataModel", withExtension: "momd")!
    let model = NSManagedObjectModel(contentsOf: modelURL)!
    let container = PersistentContainer(name: "DataModel", managedObjectModel: model)

    // Store the sqlite file in the app group container.
    // This allows shared access for app and app extensions.
    #if os(iOS)
      let appGroupID = "group.app.omnivoreapp"
    #else
      let appGroupID = "QJF2XZ86HB.app.omnivore.app"
    #endif
    let appGroupContainer = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID)
    let appGroupContainerURL = appGroupContainer?.appendingPathComponent("store.sqlite")

    container.persistentStoreDescriptions.first!.url = appGroupContainerURL

    container.viewContext.automaticallyMergesChangesFromParent = true
    container.viewContext.name = "viewContext"
    container.viewContext.mergePolicy = NSMergePolicy.mergeByPropertyObjectTrump

    return container
  }
}
