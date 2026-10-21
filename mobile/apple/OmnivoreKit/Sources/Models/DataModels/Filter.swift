import CoreData
import Foundation

public extension Filter {
  var unwrappedID: String { id ?? "" }

  static func lookup(byID filterID: String, inContext context: NSManagedObjectContext) -> Filter? {
    let fetchRequest: NSFetchRequest<Models.Filter> = Filter.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", filterID
    )

    var filter: Filter?

    context.performAndWait {
      filter = (try? context.fetch(fetchRequest))?.first
    }

    return filter
  }
}
