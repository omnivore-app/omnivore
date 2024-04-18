import CoreData
import Foundation
import Utils

public struct LinkedItemQueryResult {
  public let itemIDs: [NSManagedObjectID]
  public let cursor: String?
  public let totalCount: Int?

  public init(itemIDs: [NSManagedObjectID], cursor: String?, totalCount: Int?) {
    self.itemIDs = itemIDs
    self.cursor = cursor
    self.totalCount = totalCount
  }
}

public struct LinkedItemSyncResult {
  public let updatedItemIDs: [String]
  public let cursor: String?
  public let hasMore: Bool
  public let mostRecentUpdatedAt: Date?
  public let oldestUpdatedAt: Date?
  public let isEmpty: Bool

  public init(updatedItemIDs: [String],
              cursor: String?,
              hasMore: Bool,
              mostRecentUpdatedAt: Date?,
              oldestUpdatedAt: Date?,
              isEmpty: Bool) {
    self.updatedItemIDs = updatedItemIDs
    self.cursor = cursor
    self.hasMore = hasMore
    self.mostRecentUpdatedAt = mostRecentUpdatedAt
    self.oldestUpdatedAt = oldestUpdatedAt
    self.isEmpty = isEmpty
  }
}

public enum AudioItemType {
  case digest
  case libraryItem
}

public protocol AudioItemProperties {
  var audioItemType: AudioItemType {
    get
  }
  var itemID: String {
    get
  }
  var title: String {
    get
  }
  var byline: String? {
    get
  }
  var imageURL: URL? {
    get
  }
  var language: String? {
    get
  }
  var startIndex: Int {
    get
  }
  var startOffset: Double {
    get
  }
}

public struct LinkedItemAudioProperties: AudioItemProperties {
  public let audioItemType = AudioItemType.libraryItem

  public let itemID: String
  public let objectID: NSManagedObjectID
  public let title: String
  public var isArchived: Bool
  public let byline: String?
  public let imageURL: URL?
  public let language: String?
  public let startIndex: Int
  public let startOffset: Double
}

public extension LibraryItem {
  var unwrappedID: String { id ?? "" }
  var unwrappedSlug: String { slug ?? "" }
  var unwrappedTitle: String { title ?? "" }
  var unwrappedDownloadURLString: String { downloadURL ?? "" }
  var unwrappedPageURLString: String { pageURLString ?? "" }
  var unwrappedSavedAt: Date { savedAt ?? Date() }
  var unwrappedCreatedAt: Date { createdAt ?? Date() }

  var deepLink: URL? {
    if let id = id {
      return URL(string: "omnivore://read/\(id)")
    }
    return nil
  }

  var hasLabels: Bool {
    (labels?.count ?? 0) > 0
  }

  var noteHighlight: Highlight? {
    if let highlights = highlights?.compactMap({ $0 as? Highlight }) {
      let result = highlights
        .filter { $0.type == "NOTE" }
        .sorted(by: { $0.updatedAt ?? Date() < $1.updatedAt ?? Date() })
        .first
      return result
    }
    return nil
  }

  var noteText: String? {
    noteHighlight?.annotation
  }

  var isUnread: Bool {
    readingProgress <= 0
  }

  var isPartiallyRead: Bool {
    Int(readingProgress) > 0
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
    sortedLabels(labels: labels.asArray(of: LinkedItemLabel.self))
  }

  func sortedLabels(labels: [LinkedItemLabel]?) -> [LinkedItemLabel] {
    guard let labels = labels else {
      return []
    }

    var colors = [String: [LinkedItemLabel]]()
    for label in labels {
      if let color = label.color {
        var list = colors[color] ?? []
        list.append(label)
        colors[color] = list.sorted(by: { ($0.name ?? "").localizedCompare($1.name ?? "") == .orderedAscending })
      }
    }

    let sortedColors = Array(colors.keys).sorted(by: { leftLabel, rightLabel -> Bool in
      let aname = colors[leftLabel]?.first?.name ?? leftLabel
      let bname = colors[rightLabel]?.first?.name ?? rightLabel
      return aname.localizedCompare(bname) == .orderedAscending
    })

    var result = [LinkedItemLabel]()
    for key in sortedColors {
      if let items = colors[key] {
        let sorted = items.sorted(by: { ($0.name ?? "").localizedCompare($1.name ?? "") == .orderedAscending })
        result.append(contentsOf: sorted)
      }
    }

    return result
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
          "profileImageURL": recommendation.user?.profileImageURL as NSString? as Any
        ]),
        "recommendedAt": recommendedAt == nil ? nil : NSString(string: recommendedAt!)
      ]
    }
    guard let JSON = try? JSONSerialization.data(withJSONObject: recommendations, options: .prettyPrinted) else {
      return "[]"
    }
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
      isArchived: isArchived,
      byline: formattedByline,
      imageURL: imageURL,
      language: language,
      startIndex: Int(listenPositionIndex),
      startOffset: listenPositionOffset
    )
  }

  static func lookup(byID itemID: String, inContext context: NSManagedObjectContext) -> LibraryItem? {
    let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", itemID
    )

    var item: LibraryItem?

    context.performAndWait {
      item = (try? context.fetch(fetchRequest))?.first
    }

    return item
  }

  // swiftlint:disable:next cyclomatic_complexity
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
    listenPositionTime: Double? = nil,
    readAt: Date? = nil
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

      if let readAt = readAt {
        self.readAt = readAt
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
