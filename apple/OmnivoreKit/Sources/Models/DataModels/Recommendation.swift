import CoreData
import Foundation

public extension Recommendation {
  var unwrappedID: String { id ?? "" }

  static func lookup(byID recommendationID: String, inContext context: NSManagedObjectContext) -> Recommendation? {
    let fetchRequest: NSFetchRequest<Models.Recommendation> = Recommendation.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", recommendationID
    )

    var recommendation: Recommendation?

    context.performAndWait {
      recommendation = (try? context.fetch(fetchRequest))?.first
    }

    return recommendation
  }
}
