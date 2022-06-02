import SwiftUI
import Utils

public struct WebPreferencesPopoverView: View {
  @State private var renderCount = 0

  let increaseFontAction: () -> Void
  let decreaseFontAction: () -> Void
  let increaseMarginAction: () -> Void
  let decreaseMarginAction: () -> Void
  let increaseLineHeightAction: () -> Void
  let decreaseLineHeightAction: () -> Void

  static let preferredWebFontSizeKey = UserDefaultKey.preferredWebFontSize.rawValue
  #if os(macOS)
    @AppStorage(preferredWebFontSizeKey) var storedFontSize = Int(NSFont.userFont(ofSize: 16)?.pointSize ?? 16)
  #else
    @AppStorage(preferredWebFontSizeKey) var storedFontSize: Int = UITraitCollection.current.preferredWebFontSize
  #endif

  @AppStorage(UserDefaultKey.preferredWebLineSpacing.rawValue) var storedLineSpacing = 150
  @AppStorage(UserDefaultKey.preferredWebMargin.rawValue) var storedMargin = 360

  public init(
    increaseFontAction: @escaping () -> Void,
    decreaseFontAction: @escaping () -> Void,
    increaseMarginAction: @escaping () -> Void,
    decreaseMarginAction: @escaping () -> Void,
    increaseLineHeightAction: @escaping () -> Void,
    decreaseLineHeightAction: @escaping () -> Void
  ) {
    self.increaseFontAction = increaseFontAction
    self.decreaseFontAction = decreaseFontAction
    self.increaseMarginAction = increaseMarginAction
    self.decreaseMarginAction = decreaseMarginAction
    self.increaseLineHeightAction = increaseLineHeightAction
    self.decreaseLineHeightAction = decreaseLineHeightAction
  }

  public var body: some View {
    VStack {
      Stepper(
        "Font Size (\(storedFontSize):",
        onIncrement: {
          storedFontSize = min(storedFontSize + 2, 28)
          increaseFontAction()
        },
        onDecrement: {
          storedFontSize = max(storedFontSize - 2, 10)
          decreaseFontAction()
        }
      )

      Stepper(
        "Margin (\(storedMargin):",
        onIncrement: {
          storedMargin = min(storedMargin + 45, 560)
          increaseMarginAction()
        },
        onDecrement: {
          storedMargin = max(storedMargin - 45, 200)
          decreaseMarginAction()
        }
      )

      Stepper(
        "Line Spacing (\(storedLineSpacing):",
        onIncrement: {
          storedLineSpacing = min(storedLineSpacing + 25, 300)
          increaseLineHeightAction()
        },
        onDecrement: {
          storedLineSpacing = max(storedLineSpacing - 25, 100)
          decreaseLineHeightAction()
        }
      )

      Text(String(renderCount))
    }
    .padding()
  }
}

public struct FontSizeAdjustmentPopoverView: View {
  let increaseFontAction: () -> Void
  let decreaseFontAction: () -> Void

  public init(
    increaseFontAction: @escaping () -> Void,
    decreaseFontAction: @escaping () -> Void
  ) {
    self.increaseFontAction = increaseFontAction
    self.decreaseFontAction = decreaseFontAction
  }

  static let preferredWebFontSizeKey = UserDefaultKey.preferredWebFontSize.rawValue
  #if os(macOS)
    @AppStorage(preferredWebFontSizeKey) var storedFontSize = Int(NSFont.userFont(ofSize: 16)?.pointSize ?? 16)
  #else
    @AppStorage(preferredWebFontSizeKey) var storedFontSize: Int = UITraitCollection.current.preferredWebFontSize
  #endif

  public var body: some View {
    HStack(alignment: .center, spacing: 0) {
      Button(
        action: {
          storedFontSize = max(storedFontSize - 2, 10)
          decreaseFontAction()
        },
        label: {
          Image(systemName: "minus")
          #if os(iOS)
            .foregroundColor(.systemLabel)
            .padding()
          #endif
        }
      )
      .frame(width: 55, height: 40, alignment: .center)
      Divider()
        .frame(height: 30)
        .background(Color.systemLabel)
      Button(
        action: {
          storedFontSize = min(storedFontSize + 2, 28)
          increaseFontAction()
        },
        label: {
          Image(systemName: "plus")
          #if os(iOS)
            .foregroundColor(.systemLabel)
            .padding()
          #endif
        }
      )
      .frame(width: 55, height: 40, alignment: .center)
    }
  }
}
