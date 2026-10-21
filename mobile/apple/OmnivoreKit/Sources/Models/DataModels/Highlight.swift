import CoreData
import Foundation

public extension Highlight {
  var unwrappedID: String { id ?? "" }

  static func lookup(byID highlightID: String, inContext context: NSManagedObjectContext) -> Highlight? {
    let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", highlightID
    )

    var highlight: Highlight?

    context.performAndWait {
      highlight = (try? context.fetch(fetchRequest))?.first
    }

    return highlight
  }

  var sortedLabels: [LinkedItemLabel] {
    labels.asArray(of: LinkedItemLabel.self).sorted {
      ($0.name ?? "").lowercased() < ($1.name ?? "").lowercased()
    }
  }

  func update(
    inContext context: NSManagedObjectContext,
    newAnnotation: String
  ) {
    context.perform {
      self.annotation = newAnnotation

      guard context.hasChanges else { return }

      do {
        try context.save()
        logger.debug("Highlight updated succesfully")
      } catch {
        context.rollback()
        logger.debug("Failed to update Highlight: \(error.localizedDescription)")
      }
    }
  }

  func remove(inContext context: NSManagedObjectContext) {
    context.perform {
      context.delete(self)

      do {
        try context.save()
        logger.debug("Highlight removed")
      } catch {
        context.rollback()
        logger.debug("Failed to remove Highlight: \(error.localizedDescription)")
      }
    }
  }
}
