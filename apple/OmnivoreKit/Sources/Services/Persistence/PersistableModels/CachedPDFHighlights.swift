import Combine
import CoreData
import Foundation
import Models

public extension DataService {
  func cachedHighlights(pdfID: String) -> [HighlightDep] {
    let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "linkedItemId = %@ AND markedForDeletion = %@", pdfID, false
    )

    let highlights = (try? persistentContainer.viewContext.fetch(fetchRequest)) ?? []
    return highlights.map { HighlightDep.make(from: $0) }
  }

  func persistHighlight(pdfID: String, highlight: HighlightDep) {
    _ = highlight.toManagedObject(
      context: persistentContainer.viewContext,
      associatedItemID: pdfID
    )

    do {
      try persistentContainer.viewContext.save()
      print("Highlight saved succesfully")
    } catch {
      persistentContainer.viewContext.rollback()
      print("Failed to save Highlight: \(error)")
    }
  }

  func removeHighlights(highlightIds: [String]) {
    for highlightID in highlightIds {
      deletedHighlightsIDs.insert(highlightID)
    }

    let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
    fetchRequest.predicate = NSPredicate(format: "id IN %@", highlightIds)
    guard let highlights = try? persistentContainer.viewContext.fetch(fetchRequest) else { return }

    for highlight in highlights {
      highlight.markedForDeletion = true
    }

    do {
      try persistentContainer.viewContext.save()
      print("Highlight(s) updated succesfully")
    } catch {
      persistentContainer.viewContext.rollback()
      print("Failed to update Highlight(s): \(error)")
    }
  }
}
