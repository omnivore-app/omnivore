import CoreData
import Foundation
import Utils

public struct LinkedItemQueryResult {
  public let itemIDs: [NSManagedObjectID]
  public let cursor: String?

  public init(itemIDs: [NSManagedObjectID], cursor: String?) {
    self.itemIDs = itemIDs
    self.cursor = cursor
  }
}

public struct LinkedItemSyncResult {
  public let updatedItemIDs: [String]
  public let cursor: String?
  public let hasMore: Bool
  public let mostRecentUpdatedAt: Date?
  public let isEmpty: Bool

  public init(updatedItemIDs: [String], cursor: String?, hasMore: Bool, mostRecentUpdatedAt: Date?, isEmpty: Bool) {
    self.updatedItemIDs = updatedItemIDs
    self.cursor = cursor
    self.hasMore = hasMore
    self.mostRecentUpdatedAt = mostRecentUpdatedAt
    self.isEmpty = isEmpty
  }
}

public struct LinkedItemAudioProperties {
  public let itemID: String
  public let objectID: NSManagedObjectID
  public let title: String
  public let byline: String?
  public let imageURL: URL?
  public let language: String?
  public let startIndex: Int
  public let startOffset: Double
}

// Internal model used for parsing a push notification object only
public struct JSONArticle: Decodable {
  public let id: String
  public let title: String
  public let createdAt: Date
  public let updatedAt: Date
  public let savedAt: Date
  public let readAt: Date?
  public let image: String
  public let readingProgressPercent: Double
  public let readingProgressAnchorIndex: Int
  public let slug: String
  public let contentReader: String
  public let url: String
  public let isArchived: Bool
  public let language: String?
  public let wordsCount: Int?
}

public extension LinkedItem {
  var unwrappedID: String { id ?? "" }
  var unwrappedSlug: String { slug ?? "" }
  var unwrappedTitle: String { title ?? "" }
  var unwrappedPageURLString: String { pageURLString ?? "" }
  var unwrappedSavedAt: Date { savedAt ?? Date() }
  var unwrappedCreatedAt: Date { createdAt ?? Date() }

  var hasLabels: Bool {
    (labels?.count ?? 0) > 0
  }

  var isUnread: Bool {
    readingProgress <= 0
  }

  var isRead: Bool {
    readingProgress >= 0.98
  }

  var isPDF: Bool {
    if let contentReader = contentReader {
      return contentReader == "PDF"
    }
    return (pageURLString ?? "").hasSuffix("pdf")
  }

  func hideHost(_ host: String) -> Bool {
    switch host {
    case "storage.googleapis.com":
      return true
    case "omnivore.app":
      return true
    default:
      return false
    }
  }

  var publisherDisplayName: String? {
    if let siteName = siteName {
      return siteName
    }
    if let host = URL(string: publisherURLString ?? pageURLString ?? "")?.host, !hideHost(host) {
      return host
    }
    return nil
  }

  var imageURL: URL? {
    imageURLString.flatMap { URL(string: $0) }
  }

  var pdfURL: URL? {
    guard isPDF else { return nil }
    return URL(string: pageURLString ?? "")
  }

  var sortedLabels: [LinkedItemLabel] {
    labels.asArray(of: LinkedItemLabel.self).sorted {
      ($0.name ?? "").lowercased() < ($1.name ?? "").lowercased()
    }
  }

  var sortedHighlights: [Highlight] {
    highlights.asArray(of: Highlight.self).sorted {
      ($0.createdAt ?? Date()) < ($1.createdAt ?? Date())
    }
  }

  var labelsJSONString: String {
    let labels = self.labels.asArray(of: LinkedItemLabel.self).map { label in
      [
        "id": NSString(string: label.id ?? ""),
        "color": NSString(string: label.color ?? ""),
        "name": NSString(string: label.name ?? ""),
        "description": NSString(string: label.labelDescription ?? "")
      ]
    }
    guard let JSON = (try? JSONSerialization.data(withJSONObject: labels, options: .prettyPrinted)) else { return "[]" }
    return String(data: JSON, encoding: .utf8) ?? "[]"
  }

  var recommendationsJSONString: String {
    let recommendations = self.recommendations.asArray(of: Recommendation.self).map { recommendation in
      let recommendedAt = recommendation.recommendedAt == nil ? nil : recommendation.recommendedAt?.ISO8601Format()
      return [
        "id": NSString(string: recommendation.groupID ?? ""),
        "name": NSString(string: recommendation.name ?? ""),
        "note": recommendation.note == nil ? nil : NSString(string: recommendation.note ?? ""),
        "user": recommendation.user == nil ? nil : NSDictionary(dictionary: [
          "userID": NSString(string: recommendation.user?.userID ?? ""),
          "name": NSString(string: recommendation.user?.name ?? ""),
          "username": NSString(string: recommendation.user?.username ?? ""),
          "profileImageURL": recommendation.user?.profileImageURL == nil ? nil : NSString(string: recommendation.user?.profileImageURL ?? "")
        ]),
        "recommendedAt": recommendedAt == nil ? nil : NSString(string: recommendedAt!)
      ]
    }
    guard let JSON = (try? JSONSerialization.data(withJSONObject: recommendations, options: .prettyPrinted)) else { return "[]" }
    return String(data: JSON, encoding: .utf8) ?? "[]"
  }

  var formattedByline: String {
    var byline = ""

    if let author = author {
      byline += author
    }
    if author != nil, publisherDisplayName != nil {
      byline += " • "
    }
    if let publisherDisplayName = publisherDisplayName {
      byline += publisherDisplayName
    }
    return byline
  }

  var audioProperties: LinkedItemAudioProperties {
    LinkedItemAudioProperties(
      itemID: unwrappedID,
      objectID: objectID,
      title: unwrappedTitle,
      byline: formattedByline,
      imageURL: imageURL,
      language: language,
      startIndex: Int(listenPositionIndex),
      startOffset: listenPositionOffset
    )
  }

  static func lookup(byID itemID: String, inContext context: NSManagedObjectContext) -> LinkedItem? {
    let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", itemID
    )

    var item: LinkedItem?

    context.performAndWait {
      item = (try? context.fetch(fetchRequest))?.first
    }

    return item
  }

  func update(
    inContext context: NSManagedObjectContext,
    newReadingProgress: Double? = nil,
    newAnchorIndex: Int? = nil,
    newIsArchivedValue: Bool? = nil,
    newTitle: String? = nil,
    newDescription: String? = nil,
    newAuthor: String? = nil,
    listenPositionIndex: Int? = nil,
    listenPositionOffset: Double? = nil,
    listenPositionTime: Double? = nil
  ) {
    context.perform {
      if let newReadingProgress = newReadingProgress {
        self.readingProgress = newReadingProgress
      }

      if let newAnchorIndex = newAnchorIndex {
        self.readingProgressAnchor = Int64(newAnchorIndex)
      }

      if let newIsArchivedValue = newIsArchivedValue {
        self.isArchived = newIsArchivedValue
      }

      if let newTitle = newTitle {
        self.title = newTitle
      }

      if let newDescription = newDescription {
        self.descriptionText = newDescription
      }

      if let newAuthor = newAuthor {
        self.author = newAuthor
      }

      if let listenPositionIndex = listenPositionIndex {
        self.listenPositionIndex = Int64(listenPositionIndex)
      }

      if let listenPositionOffset = listenPositionOffset {
        self.listenPositionOffset = listenPositionOffset
      }

      if let listenPositionTime = listenPositionTime {
        self.listenPositionTime = listenPositionTime
      }

      guard context.hasChanges else { return }
      self.updatedAt = Date()

      do {
        try context.save()
        logger.debug("LinkedItem updated succesfully")
      } catch {
        context.rollback()
        logger.debug("Failed to update LinkedItem: \(error.localizedDescription)")
      }
    }
  }

  func remove(inContext context: NSManagedObjectContext) {
    context.perform {
      context.delete(self)

      do {
        try context.save()
        logger.debug("LinkedItem removed")
      } catch {
        context.rollback()
        logger.debug("Failed to remove LinkedItem: \(error.localizedDescription)")
      }
    }
  }

  static func deleteItems(ids: [String], context: NSManagedObjectContext) {
    for itemID in ids {
      if let linkedItem = lookup(byID: itemID, inContext: context) {
        linkedItem.remove(inContext: context)
      }
    }
  }
}
