import CoreData
import Foundation
import Models

struct InternalHighlight: Encodable {
  let id: String
  let type: String
  let shortId: String
  let quote: String
  let prefix: String?
  let suffix: String?
  let patch: String
  let annotation: String?
  let createdAt: Date?
  let updatedAt: Date?
  let createdByMe: Bool
  let createdBy: InternalUserProfile?
  let positionPercent: Double?
  let positionAnchorIndex: Int?
  let color: String?
  var labels: [InternalLinkedItemLabel]

  func asManagedObject(context: NSManagedObjectContext) -> Highlight {
    let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", id
    )
    let existingHighlight = (try? context.fetch(fetchRequest))?.first
    let highlight = existingHighlight ?? Highlight(entity: Highlight.entity(), insertInto: context)

    highlight.markedForDeletion = false
    highlight.id = id
    highlight.type = type
    highlight.shortId = shortId
    highlight.quote = quote
    highlight.prefix = prefix
    highlight.suffix = suffix
    highlight.patch = patch
    highlight.annotation = annotation
    highlight.createdAt = createdAt
    highlight.updatedAt = updatedAt
    highlight.createdByMe = createdByMe
    highlight.color = color
    highlight.positionPercent = positionPercent ?? -1.0
    if let positionAnchorIndex = positionAnchorIndex {
      highlight.positionAnchorIndex = Int64(positionAnchorIndex)
    }

    if let createdBy = createdBy {
      highlight.createdBy = createdBy.asManagedObject(inContext: context)
    }

    if let existingLabels = highlight.labels {
      highlight.removeFromLabels(existingLabels)
    }

    for label in labels {
      highlight.addToLabels(label.asManagedObject(inContext: context))
    }

    return highlight
  }

  static func make(from highlight: Highlight) -> InternalHighlight {
    InternalHighlight(
      id: highlight.id ?? "",
      type: highlight.type ?? "",
      shortId: highlight.shortId ?? "",
      quote: highlight.quote ?? "",
      prefix: highlight.prefix,
      suffix: highlight.suffix,
      patch: highlight.patch ?? "",
      annotation: highlight.annotation,
      createdAt: highlight.createdAt,
      updatedAt: highlight.updatedAt,
      createdByMe: highlight.createdByMe,
      createdBy: InternalUserProfile.makeSingle(highlight.createdBy),
      positionPercent: highlight.positionPercent,
      positionAnchorIndex: Int(highlight.positionAnchorIndex),
      color: highlight.color,
      labels: InternalLinkedItemLabel.make(highlight.labels)
    )
  }

  func persist(
    context: NSManagedObjectContext,
    associatedItemID: String?,
    oldHighlightsIds: [String] = []
  ) {
    context.perform {
      let highlight = asManagedObject(context: context)

      if let associatedItemID = associatedItemID {
        let linkedItem = LibraryItem.lookup(byID: associatedItemID, inContext: context)
        linkedItem?.addToHighlights(highlight)
      }

      if !oldHighlightsIds.isEmpty {
        let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id IN %@", oldHighlightsIds)
        for highlight in (try? context.fetch(fetchRequest)) ?? [] {
          context.delete(highlight)
        }
      }

      do {
        try context.save()
        print("Highlight saved succesfully")
      } catch {
        context.rollback()
        print("Failed to save Highlight: \(error.localizedDescription)")
      }
    }
  }

  func encoded() -> [String: Any]? {
    guard let data = try? JSONEncoder().encode(self) else { return nil }
    return try? JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any]
  }
}

extension Array where Element == InternalHighlight {
  var asJSONString: String {
    let jsonData = try? JSONEncoder().encode(self)
    guard let jsonData = jsonData else { return "[]" }
    return String(data: jsonData, encoding: .utf8) ?? "[]"
  }
}
