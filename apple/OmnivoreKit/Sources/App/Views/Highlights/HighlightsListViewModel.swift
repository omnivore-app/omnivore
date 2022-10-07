import CoreData
import Models
import Services
import SwiftUI
import Views

struct HighlightListItemParams: Identifiable {
  let id = UUID()
  let highlightID: String
  let title: String
  let annotation: String
  let quote: String
}

@MainActor final class HighlightsListViewModel: ObservableObject {
  @Published var highlightItems = [HighlightListItemParams]()

  func load(itemObjectID: NSManagedObjectID, dataService: DataService) {
    if let linkedItem = dataService.viewContext.object(with: itemObjectID) as? LinkedItem {
      loadHighlights(item: linkedItem)
    }
  }

  func updateAnnotation(highlightID: String, annotation: String, dataService: DataService) {
    dataService.updateHighlightAttributes(highlightID: highlightID, annotation: annotation)

    if let index = highlightItems.firstIndex(where: { $0.highlightID == highlightID }) {
      highlightItems[index] = HighlightListItemParams(
        highlightID: highlightID,
        title: highlightItems[index].title,
        annotation: annotation,
        quote: highlightItems[index].quote
      )
    }
  }

  func deleteHighlight(highlightID: String, dataService: DataService) {
    dataService.deleteHighlight(highlightID: highlightID)
    highlightItems.removeAll { $0.highlightID == highlightID }
  }

  private func loadHighlights(item: LinkedItem) {
    let unsortedHighlights = item.highlights.asArray(of: Highlight.self)

    let highlights = unsortedHighlights.sorted {
      ($0.createdAt ?? Date()) < ($1.createdAt ?? Date())
    }

    highlightItems = highlights.map {
      HighlightListItemParams(
        highlightID: $0.unwrappedID,
        title: "Highlight",
        annotation: $0.annotation ?? "",
        quote: $0.quote ?? ""
      )
    }
  }
}
