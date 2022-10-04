import Models
import SwiftUI

struct HighlightsListCard: View {
  let highlight: Highlight

  var body: some View {
    Text(highlight.quote ?? "no quote")
  }
}
