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

  static func make(from item: LinkedItem) -> InternalLinkedItem {
    InternalLinkedItem(
      id: item.id ?? "",
      title: item.title ?? "",
      createdAt: item.createdAt ?? Date(),
      savedAt: item.savedAt ?? Date(),
      readingProgress: item.readingProgress,
      readingProgressAnchor: Int(item.readingProgressAnchor),
      imageURLString: item.imageURLString,
      onDeviceImageURLString: item.onDeviceImageURLString,
      documentDirectoryPath: nil,
      pageURLString: item.pageURLString ?? "",
      descriptionText: item.title,
      publisherURLString: item.publisherURLString,
      author: item.author,
      publishDate: item.publishDate,
      slug: item.slug ?? "",
      isArchived: item.isArchived,
      contentReader: item.contentReader,
      labels: []
    )
  }
}

extension Sequence where Element == InternalLinkedItem {
  // TODO: use batch update?
  func persist(context: NSManagedObjectContext) -> [LinkedItem]? {
    let linkedItems = map { $0.asManagedObject(inContext: context) }

    do {
      try context.save()
      print("LinkedItems saved succesfully")
      return linkedItems
    } catch {
      context.rollback()
      print("Failed to save LinkedItems: \(error.localizedDescription)")
      return nil
    }
  }
}
