import CoreData
import Foundation
import Models

struct InternalLinkedItem {
  let id: String
  let title: String
  let createdAt: Date
  let savedAt: Date
  var readingProgress: Double
  var readingProgressAnchor: Int
  let imageURLString: String?
  let onDeviceImageURLString: String?
  let documentDirectoryPath: String?
  let pageURLString: String
  let descriptionText: String?
  let publisherURLString: String?
  let siteName: String?
  let author: String?
  let publishDate: Date?
  let slug: String
  let isArchived: Bool
  let contentReader: String?
  var labels: [InternalLinkedItemLabel]

  func asManagedObject(inContext context: NSManagedObjectContext) -> LinkedItem {
    let existingItem = LinkedItem.lookup(byID: id, inContext: context)
    let linkedItem = existingItem ?? LinkedItem(entity: LinkedItem.entity(), insertInto: context)

    linkedItem.id = id
    linkedItem.title = title
    linkedItem.createdAt = createdAt
    linkedItem.savedAt = savedAt
    linkedItem.readingProgress = readingProgress
    linkedItem.readingProgressAnchor = Int64(readingProgressAnchor)
    linkedItem.imageURLString = imageURLString
    linkedItem.onDeviceImageURLString = onDeviceImageURLString
    linkedItem.pageURLString = pageURLString
    linkedItem.descriptionText = descriptionText
    linkedItem.publisherURLString = publisherURLString
    linkedItem.siteName = siteName
    linkedItem.author = author
    linkedItem.publishDate = publishDate
    linkedItem.slug = slug
    linkedItem.isArchived = isArchived
    linkedItem.contentReader = contentReader

    for label in labels {
      linkedItem.addToLabels(label.asManagedObject(inContext: context))
    }

    return linkedItem
  }
}

extension Sequence where Element == InternalLinkedItem {
  // TODO: -optimization use batch update?
  func persist(context: NSManagedObjectContext) -> [LinkedItem]? {
    var linkedItems: [LinkedItem]?
    context.performAndWait {
      linkedItems = map { $0.asManagedObject(inContext: context) }

      do {
        try context.save()
        print("LinkedItems saved succesfully")
      } catch {
        context.rollback()
        print("Failed to save LinkedItems: \(error.localizedDescription)")
      }
    }
    return linkedItems
  }
}

public extension DataService {
  func persist(jsonArticle: JSONArticle) -> NSManagedObjectID? {
    jsonArticle.persistAsLinkedItem(context: backgroundContext)
  }
}

extension JSONArticle {
  func persistAsLinkedItem(context: NSManagedObjectContext) -> NSManagedObjectID? {
    var objectID: NSManagedObjectID?

    let internalLinkedItem = InternalLinkedItem(
      id: id,
      title: title,
      createdAt: createdAt,
      savedAt: savedAt,
      readingProgress: readingProgressPercent,
      readingProgressAnchor: readingProgressAnchorIndex,
      imageURLString: image,
      onDeviceImageURLString: nil,
      documentDirectoryPath: nil,
      pageURLString: url,
      descriptionText: title,
      publisherURLString: nil,
      siteName: nil,
      author: nil,
      publishDate: nil,
      slug: slug,
      isArchived: isArchived,
      contentReader: contentReader,
      labels: []
    )

    context.performAndWait {
      objectID = internalLinkedItem.asManagedObject(inContext: context).objectID

      do {
        try context.save()
        logger.debug("LinkedItem saved succesfully")
      } catch {
        context.rollback()
        logger.debug("Failed to save LinkedItem: \(error.localizedDescription)")
      }
    }

    return objectID
  }
}
