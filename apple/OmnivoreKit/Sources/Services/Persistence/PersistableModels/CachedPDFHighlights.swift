import Combine
import CoreData
import Foundation
import Models

// TODO: possibly remove this file?
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
}
