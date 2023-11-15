import Models
import SwiftUI
import Utils

public struct TextChip: View {
  @Environment(\.colorScheme) var colorScheme

  let checked: Bool
  let padded: Bool
  var onTap: ((TextChip) -> Void)?

  public init(text: String, color: Color, negated: Bool = false) {
    self.text = text
    self.color = color
    self.negated = negated
    self.checked = false
    self.padded = false
  }

  public init?(feedItemLabel: LinkedItemLabel, negated: Bool = false) {
    guard let color = Color(hex: feedItemLabel.color ?? "") else { return nil }

    self.text = feedItemLabel.name ?? ""
    self.color = color
    self.negated = negated
    self.checked = false
    self.padded = false
  }

  // swiftlint:disable:next line_length
  public init?(feedItemLabel: LinkedItemLabel, negated: Bool = false, checked: Bool = false, padded: Bool = false, onTap: ((TextChip) -> Void)?) {
    guard let color = Color(hex: feedItemLabel.color ?? "") else {
      return nil
    }

    self.text = feedItemLabel.name ?? ""
    self.color = color
    self.negated = negated
    self.onTap = onTap
    self.checked = checked
    self.padded = padded
  }

  public let text: String
  let color: Color
  let negated: Bool

  var textColor: Color {
    guard let luminance = color.luminance else {
      return .white
    }

    return luminance > 0.35 ? .black : .white
  }

  var backgroundColor: Color {
    color.opacity(0.9)
  }

  var checkedBorderColor: Color {
    colorScheme == .dark ? Color.white : Color.black
  }

  var borderColor: Color {
    checked ? checkedBorderColor : Color.clear
  }

  public var body: some View {
    ZStack(alignment: .topTrailing) {
      Text(text)
        .strikethrough(color: negated ? textColor : .clear)
        .padding(.horizontal, padded ? 10 : 8)
        .padding(.vertical, padded ? 8 : 5)
        .font(.appCaptionMedium)
        .foregroundColor(textColor)
        .lineLimit(1)
        .background(
          RoundedRectangle(cornerRadius: 4)
            .fill(backgroundColor)
        )
        .overlay(
          RoundedRectangle(cornerRadius: 4)
            .stroke(borderColor, lineWidth: 2)
        )
        .padding(1)
    }.onTapGesture {
      if let onTap = onTap {
        onTap(self)
      }
    }
  }
}

public struct TextChipButton: View {
  public static func makeAddLabelButton(color: Color, onTap: @escaping () -> Void) -> TextChipButton {
    TextChipButton(title: LocalText.labelsGeneric, color: color, actionType: .show, negated: false, onTap: onTap)
  }

  public static func makeMenuButton(title: String, color: Color) -> TextChipButton {
    TextChipButton(title: title, color: color, actionType: .show, negated: false, onTap: {})
  }

  public static func makeSearchFilterButton(title: String, onTap: @escaping () -> Void) -> TextChipButton {
    TextChipButton(title: title, color: .appCtaYellow, actionType: .filter, negated: false, onTap: onTap)
  }

  public static func makeShowOptionsButton(title: String, onTap: @escaping () -> Void) -> TextChipButton {
    TextChipButton(title: title, color: .appButtonBackground, actionType: .add, negated: false, onTap: onTap)
  }

  public static func makeRemovableLabelButton(
    feedItemLabel: LinkedItemLabel,
    negated: Bool,
    onTap: @escaping () -> Void
  ) -> TextChipButton {
    TextChipButton(
      title: feedItemLabel.name ?? "",
      color: Color(hex: feedItemLabel.color ?? "") ?? .appButtonBackground,
      actionType: .remove,
      negated: negated,
      onTap: onTap
    )
  }

  public enum ActionType {
    case remove
    case add
    case show
    case filter

    var systemIconName: String {
      switch self {
      case .filter, .remove:
        return "xmark"
      case .add:
        return "plus"
      case .show:
        return "chevron.down"
      }
    }
  }

  public init(title: String, color: Color, actionType: ActionType, negated: Bool, onTap: @escaping () -> Void) {
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
    self.negated = negated
  }

  let text: String
  let negated: Bool
  let color: Color
  let onTap: () -> Void
  let actionType: ActionType
  let foregroundColor: Color

  public var body: some View {
    VStack(spacing: 0) {
      HStack {
        if actionType == .filter {
          Image(systemName: "line.3.horizontal.decrease")
        }

        Text(text)
          .strikethrough(color: negated ? foregroundColor : .clear)
          .padding(.leading, 3)
        Image(systemName: actionType.systemIconName)
      }
      .padding(.horizontal, 10)
      .padding(.vertical, 8)
      .font(.appFootnote)
      .foregroundColor(foregroundColor)
      .lineLimit(1)
      .background(Rectangle().fill(color))
      .cornerRadius(8)
    }
    .padding(.vertical, 0)
    .contentShape(Rectangle())
    .onTapGesture { onTap() }
  }
}
