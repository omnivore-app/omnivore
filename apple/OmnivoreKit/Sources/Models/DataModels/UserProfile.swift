import CoreData
import Foundation

public extension UserProfile {
  static func lookup(byID userID: String, inContext context: NSManagedObjectContext) -> UserProfile? {
    let fetchRequest: NSFetchRequest<Models.UserProfile> = UserProfile.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "%K == %@", #keyPath(UserProfile.userID), userID
    )

    var result: UserProfile?

    context.performAndWait {
      result = (try? context.fetch(fetchRequest))?.first
    }

    return result
  }
}
