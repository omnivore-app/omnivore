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

    @Binding var preferredFont: String
    @Binding var prefersHighContrastText: Bool

    public var fontSizeButtons: some View {
      Group {
        Button(
          action: {
            storedFontSize = max(storedFontSize - 2, 10)
            NSNotification.readerSettingsChanged()
          },
          label: { Text("Decrease Font Size")
          }
        )
        .keyboardShortcut("-")

        Button(
          action: {
            storedFontSize = min(storedFontSize + 2, 28)
            NSNotification.readerSettingsChanged()
          },
          label: { Text("Increase Font Size") }
        )
        .keyboardShortcut("+")
      }
    }

    public var marginSizeButtons: some View {
      Group {
        Button(
          action: {
            storedMaxWidthPercentage = min(storedMaxWidthPercentage + 10, 100)
            NSNotification.readerSettingsChanged()
          },
          label: { Text("Decrease Margin")
          }
        )
        .keyboardShortcut("[")

        Button(
          action: {
            storedMaxWidthPercentage = max(storedMaxWidthPercentage - 10, 40)
            NSNotification.readerSettingsChanged()
          },
          label: { Text("Increase Margin")
          }
        )
        .keyboardShortcut("]")
      }
    }

    public var lineSpacingButtons: some View {
      Group {
        Button(
          action: {
            storedLineSpacing = max(storedLineSpacing - 25, 100)
            NSNotification.readerSettingsChanged()
          },
          label: { Text("Decrease Line Spacing") }
        )
        .keyboardShortcut("k")

        Button(
          action: {
            storedLineSpacing = min(storedLineSpacing + 25, 300)
            NSNotification.readerSettingsChanged()
          },
          label: { Text("Increase Line Spacing") }
        )
        .keyboardShortcut("l")
      }
    }

    public init(
      preferredFont: Binding<String>,
      prefersHighContrastText: Binding<Bool>
    ) {
      self._preferredFont = preferredFont
      self._prefersHighContrastText = prefersHighContrastText
    }

    public var body: some Commands {
      CommandMenu("Reader Display") {
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
