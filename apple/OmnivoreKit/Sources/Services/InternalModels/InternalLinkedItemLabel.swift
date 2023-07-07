import CoreData
import Foundation
import Models

public struct InternalLinkedItemLabel: Encodable {
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
        logger.debug("LinkedItemLabel saved succesfully")
        objectID = label.objectID
      } catch {
        context.rollback()
        logger.debug("Failed to save LinkedItemLabel: \(error.localizedDescription)")
      }
    }

    return objectID
  }

  func asManagedObject(inContext context: NSManagedObjectContext) -> LinkedItemLabel {
    let existingLabel = LinkedItemLabel.lookup(byID: id, inContext: context)
    let label = existingLabel ?? LinkedItemLabel(entity: LinkedItemLabel.entity(), insertInto: context)
    label.id = id
    label.name = name
    label.color = color
    label.createdAt = createdAt
    label.labelDescription = labelDescription
    return label
  }

  public static func make(_ labels: NSSet?) -> [InternalLinkedItemLabel] {
    labels?
      .compactMap { label in
        if let label = label as? LinkedItemLabel {
          return InternalLinkedItemLabel(
            id: label.id ?? "",
            name: label.name ?? "",
            color: label.color ?? "",
            createdAt: label.createdAt,
            labelDescription: label.labelDescription
          )
        }
        return nil
      } ?? []
  }
}

public extension LinkedItemLabel {
  var unwrappedID: String { id ?? "" }
  var unwrappedName: String { name ?? "" }

  static func named(_ name: String, inContext context: NSManagedObjectContext) -> LinkedItemLabel? {
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "name == %@", name
    )

    var label: LinkedItemLabel?

    context.performAndWait {
      label = (try? context.fetch(fetchRequest))?.first
    }

    return label
  }

  static func lookup(byID id: String, inContext context: NSManagedObjectContext) -> LinkedItemLabel? {
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", id
    )

    var label: LinkedItemLabel?

    context.performAndWait {
      label = (try? context.fetch(fetchRequest))?.first
    }

    return label
  }

  internal func update(
    inContext context: NSManagedObjectContext,
    newName: String? = nil,
    newColor: String? = nil,
    newLabelDescription: String? = nil
  ) {
    context.perform {
      if let newName = newName {
        self.name = newName
      }

      if let newColor = newColor {
        self.color = newColor
      }

      if let newLabelDescription = newLabelDescription {
        self.labelDescription = newLabelDescription
      }

      guard context.hasChanges else { return }

      do {
        try context.save()
        logger.debug("LinkedItemLabel updated succesfully")
      } catch {
        context.rollback()
        logger.debug("Failed to update LinkedItemLabel: \(error.localizedDescription)")
      }
    }
  }

  internal func remove(inContext context: NSManagedObjectContext) {
    context.perform {
      context.delete(self)

      do {
        try context.save()
        logger.debug("LinkedItemLabel removed")
      } catch {
        context.rollback()
        logger.debug("Failed to remove LinkedItemLabel: \(error.localizedDescription)")
      }
    }
  }
}

extension Sequence where Element == InternalLinkedItemLabel {
  func persist(context: NSManagedObjectContext) -> [NSManagedObjectID]? {
    var result: [NSManagedObjectID]?

    context.performAndWait {
      // Get currently stored label ids so we can later delete the old ones
      let labelsFetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()
      let existingLabels = (try? labelsFetchRequest.execute()) ?? []

      let validLabelIDs = map(\.id)
      let invalidLinkedItemLabels = existingLabels.filter { !validLabelIDs.contains($0.unwrappedID) }

      // Delete all existing labels that aren't part of the newly updated list
      // received from the server
      for linkedItem in invalidLinkedItemLabels {
        context.delete(linkedItem)
      }

      let labels = map { $0.asManagedObject(inContext: context) }

      do {
        try context.save()
        logger.debug("labels saved succesfully")
        result = labels.map(\.objectID)
      } catch {
        context.rollback()
        logger.debug("Failed to save labels: \(error.localizedDescription)")
      }
    }

    return result
  }
}
