import CoreData
import Foundation

/// An `NSPersistentContainer` subclass that lives in the `Models` package so that
/// the data model is looked for in the same package bundle (rather than the main bundle)
public class PersistentContainer: NSPersistentContainer {
  public static func make() -> PersistentContainer {
    let modelURL = Bundle.module.url(forResource: "CoreDataModel", withExtension: "momd")!
    let model = NSManagedObjectModel(contentsOf: modelURL)!
    let container = PersistentContainer(name: "DataModel", managedObjectModel: model)

    container.viewContext.automaticallyMergesChangesFromParent = false
    container.viewContext.name = "viewContext"
    container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    container.viewContext.undoManager = nil
    container.viewContext.shouldDeleteInaccessibleFaults = true

    return container
  }
}
