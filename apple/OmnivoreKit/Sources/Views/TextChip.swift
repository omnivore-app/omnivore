import Models
import SwiftUI
import Utils

public struct TextChip: View {
  @Environment(\.colorScheme) var colorScheme

  let checked: Bool
  var onTap: ((TextChip) -> Void)?

  public init(text: String, color: Color, negated: Bool = false) {
    self.text = text
    self.color = color
    self.negated = negated
    self.checked = false
  }

  public init?(feedItemLabel: LinkedItemLabel, negated: Bool = false) {
    guard let color = Color(hex: feedItemLabel.color ?? "") else { return nil }

    self.text = feedItemLabel.name ?? ""
    self.color = color
    self.negated = negated
    self.checked = false
  }

  public init?(feedItemLabel: LinkedItemLabel, negated: Bool = false, checked: Bool = false, onTap: ((TextChip) -> Void)?) {
    guard let color = Color(hex: feedItemLabel.color ?? "") else {
      print("RETURNING NUL!")
      return nil
    }

    print("TEXT CHIP", feedItemLabel.name, checked)
    self.text = feedItemLabel.name ?? ""
    self.color = color
    self.negated = negated
    self.onTap = onTap
    self.checked = checked
  }

  public let text: String
  let color: Color
  let negated: Bool

  var textColor: Color {
    guard let luminance = color.luminance else {
      return .white
    }

    if colorScheme == .light {
      return luminance > 0.5 ? .black : .white
    }

    if luminance > 0.2 {
      return color
    }

    // lighten the color by 20%
    return Color.lighten(color: color, by: 20)
  }

  var backgroundColor: Color {
    color.opacity(colorScheme == .dark ? 0.08 : 1)
  }

  var borderColor: Color {
    if colorScheme == .dark {
      return textColor
    } else {
      return color.opacity(0.7)
    }
  }

  public var body: some View {
    ZStack(alignment: .topTrailing) {
      Text(text)
        .strikethrough(color: negated ? textColor : .clear)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .font(.appCaptionBold)
        .foregroundColor(textColor)
        .lineLimit(1)
        .background(Capsule().fill(backgroundColor))
        .overlay(Capsule().stroke(borderColor, lineWidth: 1))
        .padding(1)
        .overlay(alignment: .topTrailing) {
          if checked {
            Image(systemName: "checkmark.circle.fill")
              .font(.appBody)
              .symbolVariant(.circle.fill)
              .foregroundStyle(Color.appBackground, Color.appGreenSuccess)
              .padding([.top, .trailing], -6)
          }
        }
    }.onTapGesture {
      if let onTap = onTap {
        onTap(self)
      }
    }
  }
}

public struct TextChipButton: View {
  public static func makeAddLabelButton(onTap: @escaping () -> Void) -> TextChipButton {
    TextChipButton(title: "Labels", color: .systemGray6, actionType: .show, negated: false, onTap: onTap)
  }

  public static func makeMenuButton(title: String) -> TextChipButton {
    TextChipButton(title: title, color: .systemGray6, actionType: .show, negated: false, onTap: {})
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
