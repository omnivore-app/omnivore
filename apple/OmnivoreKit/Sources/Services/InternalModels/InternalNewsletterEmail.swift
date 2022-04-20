import CoreData
import Foundation
import Models

struct InternalNewsletterEmail {
  let emailId: String
  let email: String
  let confirmationCode: String?

  func persist(context: NSManagedObjectContext) -> NewsletterEmail? {
    let newsletterEmail = asManagedObject(inContext: context)

    do {
      try context.save()
      DataService.logger.debug("NewsletterEmail saved succesfully")
      return newsletterEmail
    } catch {
      context.rollback()
      DataService.logger.debug("Failed to save NewsletterEmail: \(error.localizedDescription)")
      return nil
    }
  }

  func asManagedObject(inContext context: NSManagedObjectContext) -> NewsletterEmail {
    let newsletterEmail = NewsletterEmail(entity: NewsletterEmail.entity(), insertInto: context)
    newsletterEmail.emailId = emailId
    newsletterEmail.email = email
    newsletterEmail.confirmationCode = confirmationCode
    return newsletterEmail
  }
}

extension Sequence where Element == InternalNewsletterEmail {
  func persist(context: NSManagedObjectContext) -> [NewsletterEmail]? {
    let newsletterEmails = map { $0.asManagedObject(inContext: context) }

    do {
      try context.save()
      DataService.logger.debug("NewsletterEmail saved succesfully")
      return newsletterEmails
    } catch {
      context.rollback()
      DataService.logger.debug("Failed to save NewsletterEmail: \(error.localizedDescription)")
      return nil
    }
  }
}
