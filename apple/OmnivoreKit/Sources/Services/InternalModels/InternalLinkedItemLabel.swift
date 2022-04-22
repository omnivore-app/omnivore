import CoreData
import Foundation
import Models

struct InternalLinkedItemLabel {
  let id: String
  let name: String
  let color: String
  let createdAt: Date?
  let labelDescription: String?

  func persist(context: NSManagedObjectContext) -> NSManagedObjectID? {
    var objectID: NSManagedObjectID?

    context.performAndWait {
      let label = asManagedObject(inContext: context)

      do {
        try context.save()
        logger.debug("NewsletterEmail saved succesfully")
        objectID = label.objectID
      } catch {
        context.rollback()
        logger.debug("Failed to save NewsletterEmail: \(error.localizedDescription)")
      }
    }

    return objectID
  }

  func asManagedObject(inContext context: NSManagedObjectContext) -> LinkedItemLabel {
    let existingItem = LinkedItemLabel.lookup(byID: id, inContext: context)
    let label = existingItem ?? LinkedItemLabel(entity: LinkedItemLabel.entity(), insertInto: context)
    label.id = id
    label.name = name
    label.color = color
    label.createdAt = createdAt
    label.labelDescription = labelDescription
    return label
  }
}

extension LinkedItemLabel {
  static func lookup(byID labelID: String, inContext context: NSManagedObjectContext) -> LinkedItemLabel? {
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", labelID
    )

    var label: LinkedItemLabel?

    context.performAndWait {
      label = (try? context.fetch(fetchRequest))?.first
    }

    return label
  }
}
