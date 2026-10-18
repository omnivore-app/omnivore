import Models
import SwiftUI
import Utils

public struct LibraryItemLabelView: View {
  let text: String
  let color: Color

  public init(text: String, color: Color) {
    self.text = text
    self.color = color
  }

  public var body: some View {
    HStack(spacing: 5) {
      Circle()
        .fill(color)
        .frame(width: 11, height: 11)

      Text(text)
        .font(.appCaptionTwo)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .lineLimit(1)
    .foregroundColor(Color.themeLabelForeground)
    .background(Color.themeLabelBackground)
    .cornerRadius(5)
    .overlay(
      RoundedRectangle(cornerRadius: 5)
        .stroke(Color.isDarkMode ? Color.themeLabelBackground : Color.themeLabelBackground, lineWidth: 1)
    )
  }
}
