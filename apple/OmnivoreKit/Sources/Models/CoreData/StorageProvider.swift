import CoreData
import Foundation

/// An `NSPersistentContainer` subclass that lives in the `Models` package so that
/// the data model is looked for in the same package bundle (rather than the main bundle)
public class PersistentContainer: NSPersistentContainer {
  public static func make() -> PersistentContainer {
    let modelURL = Bundle.module.url(forResource: "CoreDataModel", withExtension: "momd")!
    let model = NSManagedObjectModel(contentsOf: modelURL)!
    return PersistentContainer(name: "DataModel", managedObjectModel: model)
  }
}
