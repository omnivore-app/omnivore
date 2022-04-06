import Models
import SwiftUI
import Utils

public struct TextChip: View {
  public init(text: String, color: Color) {
    self.text = text
    self.color = color
  }

  public init?(feedItemLabel: FeedItemLabel) {
    guard let color = Color(hex: feedItemLabel.color) else { return nil }

    self.text = feedItemLabel.name
    self.color = color
  }

  let text: String
  let color: Color
  let cornerRadius = 20.0

  public var body: some View {
    Text(text)
      .padding(.horizontal, 10)
      .padding(.vertical, 5)
      .font(.appFootnote)
      .foregroundColor(color)
      .lineLimit(1)
      .background(color.opacity(0.1))
      .cornerRadius(cornerRadius)
      .overlay(
        RoundedRectangle(cornerRadius: cornerRadius)
          .stroke(color.opacity(0.3), lineWidth: 1)
      )
  }
}
