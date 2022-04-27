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

    container.viewContext.automaticallyMergesChangesFromParent = true
    container.viewContext.name = "viewContext"
    container.viewContext.mergePolicy = NSMergePolicy.mergeByPropertyObjectTrump

    return container
  }
}
