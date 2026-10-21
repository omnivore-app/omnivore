import CoreData
import Foundation
import Models

struct InternalLibraryItem {
  let id: String
  let title: String
  let createdAt: Date
  let savedAt: Date
  let readAt: Date?
  let updatedAt: Date
  let folder: String
  let state: ArticleContentStatus
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
  let htmlContent: String?
  let originalHtml: String?
  let language: String?
  let wordsCount: Int?
  let downloadURL: String
  let recommendations: [InternalRecommendation]
  var labels: [InternalLinkedItemLabel]
  var highlights: [InternalHighlight]

  var isPDF: Bool {
    if let contentReader = contentReader {
      return contentReader == "PDF"
    }
    return pageURLString.hasSuffix("pdf")
  }

  func asManagedObject(inContext context: NSManagedObjectContext) -> LibraryItem {
    let existingItem = LibraryItem.lookup(byID: id, inContext: context)
    let linkedItem = existingItem ?? LibraryItem(entity: LibraryItem.entity(), insertInto: context)

    linkedItem.id = id
    linkedItem.title = title
    linkedItem.createdAt = createdAt
    linkedItem.savedAt = savedAt
    linkedItem.updatedAt = updatedAt
    linkedItem.readAt = readAt
    linkedItem.folder = folder
    linkedItem.state = state.rawValue
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
    linkedItem.readAt = readAt
    linkedItem.slug = slug
    linkedItem.isArchived = isArchived
    linkedItem.contentReader = contentReader
    linkedItem.htmlContent = htmlContent
    linkedItem.originalHtml = originalHtml
    linkedItem.language = language
    linkedItem.wordsCount = Int64(wordsCount ?? 0)
    linkedItem.downloadURL = downloadURL

    // Remove existing labels in case a label had been deleted
    if let existingLabels = linkedItem.labels {
      linkedItem.removeFromLabels(existingLabels)
    }

    for label in labels {
      linkedItem.addToLabels(label.asManagedObject(inContext: context))
    }

    if let existingRecommendation = linkedItem.recommendations {
      linkedItem.removeFromRecommendations(existingRecommendation)
    }

    for recommendation in recommendations {
      linkedItem.addToRecommendations(recommendation.asManagedObject(inContext: context))
    }

    // Remove existing labels in case a label had been deleted
    if let existingHighlights = linkedItem.highlights {
      linkedItem.removeFromHighlights(existingHighlights)
    }

    for highlight in highlights {
      linkedItem.addToHighlights(highlight.asManagedObject(context: context))
    }

    return linkedItem
  }
}

extension Sequence where Element == InternalLibraryItem {
  func persist(context: NSManagedObjectContext) -> [NSManagedObjectID]? {
    var linkedItems: [LibraryItem]?
    context.performAndWait {
      linkedItems = map { $0.asManagedObject(inContext: context) }

      do {
        try context.save()
        print("LinkedItems saved succesfully")
      } catch {
        context.rollback()
        print(error)
        print("Failed to save LinkedItems: \(error.localizedDescription)")
      }
    }

    if let linkedItems = linkedItems {
      return linkedItems.map(\.objectID)
    } else {
      return nil
    }
  }
}
