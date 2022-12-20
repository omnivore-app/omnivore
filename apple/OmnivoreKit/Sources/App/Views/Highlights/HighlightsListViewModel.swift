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
  let labels: [LinkedItemLabel]
  let createdBy: InternalUserProfile?
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
        quote: highlightItems[index].quote,
        labels: highlightItems[index].labels,
        createdBy: highlightItems[index].createdBy
      )
    }
  }

  func deleteHighlight(highlightID: String, dataService: DataService) {
    dataService.deleteHighlight(highlightID: highlightID)
    highlightItems.removeAll { $0.highlightID == highlightID }
  }

  func setLabelsForHighlight(highlightID: String, labels: [LinkedItemLabel], dataService: DataService) {
    dataService.setLabelsForHighlight(highlightID: highlightID, labelIDs: labels.map(\.unwrappedID))

    if let index = highlightItems.firstIndex(where: { $0.highlightID == highlightID }) {
      highlightItems[index] = HighlightListItemParams(
        highlightID: highlightID,
        title: highlightItems[index].title,
        annotation: highlightItems[index].annotation,
        quote: highlightItems[index].quote,
        labels: labels,
        createdBy: highlightItems[index].createdBy
      )
    }
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
        quote: $0.quote ?? "",
        labels: $0.labels.asArray(of: LinkedItemLabel.self),
        createdBy: $0.createdByMe ? nil : InternalUserProfile.makeSingle($0.createdBy)
      )
    }
  }
}
