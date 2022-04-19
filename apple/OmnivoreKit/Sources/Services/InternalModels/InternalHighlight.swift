import CoreData
import Foundation
import Models

struct InternalHighlight: Encodable {
  let id: String
  let shortId: String
  let quote: String
  let prefix: String?
  let suffix: String?
  let patch: String
  let annotation: String?
  let createdAt: Date?
  let updatedAt: Date?
  let createdByMe: Bool

  func asManagedObject(context: NSManagedObjectContext, associatedItemID: String) -> Highlight {
    let highlight = Highlight(context: context)
    highlight.linkedItemId = associatedItemID
    highlight.markedForDeletion = false
    highlight.id = id
    highlight.shortId = shortId
    highlight.quote = quote
    highlight.prefix = prefix
    highlight.suffix = suffix
    highlight.patch = patch
    highlight.annotation = annotation
    highlight.createdAt = createdAt
    highlight.updatedAt = updatedAt
    highlight.createdByMe = createdByMe
    return highlight
  }

  func persist(
    context: NSManagedObjectContext,
    associatedItemID: String,
    oldHighlightsIds: [String] = []
  ) -> Highlight? {
    let highlight = asManagedObject(context: context, associatedItemID: associatedItemID)

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
      return highlight
    } catch {
      context.rollback()
      print("Failed to save Highlight: \(error.localizedDescription)")
      return nil
    }
  }

  func encoded() -> [String: Any]? {
    guard let data = try? JSONEncoder().encode(self) else { return nil }
    return try? JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any]
  }
}
