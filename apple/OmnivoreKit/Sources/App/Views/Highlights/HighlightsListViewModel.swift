import CoreData
import Models
import Services
import SwiftUI
import Views

@MainActor final class HighlightsListViewModel: ObservableObject {
  @Published var highlights = [Highlight]()

  func load(item: LinkedItem) {
    highlights = item.highlights.asArray(of: Highlight.self)
  }
}

extension Highlight {
  var highlightCardTitle: String {
    "Highlight"
  }
}
