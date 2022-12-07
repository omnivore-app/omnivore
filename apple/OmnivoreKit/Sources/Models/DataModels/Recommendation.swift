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

  static func byline(_ set: NSSet) -> String {
    Array(set).reduce("") { str, item in
      if let recommendation = item as? Recommendation, let userName = recommendation.user?.name {
        if str.isEmpty {
          return userName
        } else {
          return str + ", " + userName
        }
      }
      return str
    }
  }

  static func groupsLine(_ set: NSSet) -> String {
    Array(set).reduce("") { str, item in
      if let recommendation = item as? Recommendation, let name = recommendation.name {
        if str.isEmpty {
          return name
        } else {
          return str + ", " + name
        }
      }
      return str
    }
  }
}
