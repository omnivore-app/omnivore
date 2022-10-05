import CoreData
import Models
import Services
import SwiftUI
import Views

@MainActor final class HighlightsListViewModel: ObservableObject {
  @Published var highlights = [Highlight]()

  func load(item: LinkedItem) {
    let unsortedHighlights = item.highlights.asArray(of: Highlight.self)

    highlights = unsortedHighlights.sorted {
      ($0.createdAt ?? Date()) < ($1.createdAt ?? Date())
    }
  }
}

extension Highlight {
  var highlightCardTitle: String {
    "Highlight"
  }
}
