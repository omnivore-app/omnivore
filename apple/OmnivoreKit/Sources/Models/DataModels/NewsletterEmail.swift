import CoreData
import Foundation

public extension NewsletterEmail {
  var unwrappedEmailId: String { emailId ?? "" }

  var unwrappedEmail: String { email ?? "" }

  static func lookup(byID emailID: String, inContext context: NSManagedObjectContext) -> NewsletterEmail? {
    let fetchRequest: NSFetchRequest<Models.NewsletterEmail> = NewsletterEmail.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "%K == %@", #keyPath(NewsletterEmail.emailId), emailID
    )

    var email: NewsletterEmail?

    context.performAndWait {
      email = (try? context.fetch(fetchRequest))?.first
    }

    return email
  }
}
