import SwiftUI

struct TextChip: View {
  let text: String
  let color: Color
  let cornerRadius = 20.0

  var body: some View {
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
