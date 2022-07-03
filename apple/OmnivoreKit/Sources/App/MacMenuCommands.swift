import SwiftUI
import Utils
import Views

#if os(macOS)
  public struct MacMenuCommands: Commands {
    @AppStorage(UserDefaultKey.preferredWebFontSize.rawValue) var storedFontSize = Int(
      NSFont.userFont(ofSize: 16)?.pointSize ?? 16
    )
    @AppStorage(UserDefaultKey.preferredWebLineSpacing.rawValue) var storedLineSpacing = 150
    @AppStorage(UserDefaultKey.preferredWebMaxWidthPercentage.rawValue) var storedMaxWidthPercentage = 100
    @AppStorage(UserDefaultKey.preferredWebFont.rawValue) var preferredFont = WebFont.inter.rawValue
    @AppStorage(UserDefaultKey.prefersHighContrastWebFont.rawValue) var prefersHighContrastText = true

    public var fontSizeButtons: some View {
      Group {
        Button(
          action: { storedFontSize = min(storedFontSize + 2, 28) },
          label: { Text("Increase Reader Font Size") }
        )

        Button(
          action: { storedFontSize = max(storedFontSize - 2, 10) },
          label: { Text("Decrease Reader Font Size")
          }
        )
      }
    }

    public var marginSizeButtons: some View {
      Group {
        Button(
          action: { storedMaxWidthPercentage = max(storedMaxWidthPercentage - 10, 40) },
          label: { Text("Increase Reader Margin")
          }
        )

        Button(
          action: { storedMaxWidthPercentage = min(storedMaxWidthPercentage + 10, 100) },
          label: { Text("Decrease Reader Margin")
          }
        )
      }
    }

    public var lineSpacingButtons: some View {
      Group {
        Button(
          action: { storedLineSpacing = min(storedLineSpacing + 25, 300) },
          label: { Text("Increase Reader Line Spacing") }
        )

        Button(
          action: { storedLineSpacing = max(storedLineSpacing - 25, 100) },
          label: { Text("Decrease Reader Line Spacing") }
        )
//          .keyboardShortcut("l")
      }
    }

    public init() {}

    public var body: some Commands {
      CommandMenu("Reader Settings") {
        fontSizeButtons

        Divider()

        marginSizeButtons

        Divider()

        lineSpacingButtons

        Divider()

        Picker(selection: $preferredFont, label: Text("Font Family")) {
          ForEach(WebFont.allCases, id: \.self) { font in
            Text(font.displayValue).tag(font.rawValue)
          }
        }

        Toggle(
          isOn: $prefersHighContrastText,
          label: { Text("High Contrast Text") }
        )
      }
    }
  }
#endif
