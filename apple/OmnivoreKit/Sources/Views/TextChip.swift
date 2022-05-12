import Models
import SwiftUI
import Utils

public struct TextChip: View {
  public init(text: String, color: Color) {
    self.text = text
    self.color = color
  }

  public init?(feedItemLabel: LinkedItemLabel) {
    guard let color = Color(hex: feedItemLabel.color ?? "") else { return nil }

    self.text = feedItemLabel.name ?? ""
    self.color = color
  }

  let text: String
  let color: Color

  public var body: some View {
    Text(text)
      .padding(.horizontal, 10)
      .padding(.vertical, 5)
      .font(.appFootnote)
      .foregroundColor(color.isDark ? .white : .black)
      .lineLimit(1)
      .background(Capsule().fill(color))
  }
}

public struct TextChipButton: View {
  public static func makeAddLabelButton(onTap: @escaping () -> Void) -> TextChipButton {
    TextChipButton(title: "Labels", color: .systemGray6, actionType: .show, onTap: onTap)
  }

  public static func makeFilterButton(title: String) -> TextChipButton {
    TextChipButton(title: title, color: .systemGray6, actionType: .show, onTap: {})
  }

  public static func makeShowOptionsButton(title: String, onTap: @escaping () -> Void) -> TextChipButton {
    TextChipButton(title: title, color: .appButtonBackground, actionType: .add, onTap: onTap)
  }

  public static func makeRemovableLabelButton(
    feedItemLabel: LinkedItemLabel,
    onTap: @escaping () -> Void
  ) -> TextChipButton {
    TextChipButton(
      title: feedItemLabel.name ?? "",
      color: Color(hex: feedItemLabel.color ?? "") ?? .appButtonBackground,
      actionType: .remove,
      onTap: onTap
    )
  }

  public enum ActionType {
    case remove
    case add
    case show

    var systemIconName: String {
      switch self {
      case .remove:
        return "xmark"
      case .add:
        return "plus"
      case .show:
        return "chevron.down"
      }
    }
  }

  public init(title: String, color: Color, actionType: ActionType, onTap: @escaping () -> Void) {
    self.text = title
    self.color = color
    self.onTap = onTap
    self.actionType = actionType
    self.foregroundColor = {
      if actionType == .show {
        return .appGrayText
      }
      return color.isDark ? .white : .black
    }()
  }

  let text: String
  let color: Color
  let onTap: () -> Void
  let actionType: ActionType
  let foregroundColor: Color

  public var body: some View {
    VStack(spacing: 0) {
      HStack {
        Text(text)
          .padding(.leading, 3)
        Image(systemName: actionType.systemIconName)
      }
      .padding(.horizontal, 10)
      .padding(.vertical, 8)
      .font(.appFootnote)
      .foregroundColor(foregroundColor)
      .lineLimit(1)
      .background(Capsule().fill(color))
    }
    .padding(.vertical, 12)
    .contentShape(Rectangle())
    .onTapGesture { onTap() }
  }
}
