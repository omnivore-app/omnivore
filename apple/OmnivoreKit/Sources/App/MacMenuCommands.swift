import SwiftUI
import Utils
import Views

#if os(macOS)
  public struct MacMenuCommands: Commands {
    @AppStorage(UserDefaultKey.preferredWebFontSize.rawValue) var storedFontSize = Int(
      NSFont.userFont(ofSize: 16)?.pointSize ?? 16
    )
    @AppStorage(UserDefaultKey.preferredWebLineSpacing.rawValue) var storedLineSpacing = 150
    @AppStorage(UserDefaultKey.preferredWebMaxWidthPercentage.rawValue) var storedMaxWidthPercentage = 80

    @Binding var preferredFont: String
    @Binding var prefersHighContrastText: Bool
    @Binding var justifyText: Bool
    @Binding var currentThemeName: String

    public var fontSizeButtons: some View {
      Group {
        Button(
          action: {
            storedFontSize = max(storedFontSize - 2, 10)
            NSNotification.readerSettingsChanged()
          },
          label: { Text(LocalText.keyboardCommandDecreaseFont)
          }
        )
        .keyboardShortcut("-")

        Button(
          action: {
            storedFontSize = min(storedFontSize + 2, 28)
            NSNotification.readerSettingsChanged()
          },
          label: { Text(LocalText.keyboardCommandIncreaseFont) }
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
          label: { Text(LocalText.keyboardCommandDecreaseMargin)
          }
        )
        .keyboardShortcut("[")

        Button(
          action: {
            storedMaxWidthPercentage = max(storedMaxWidthPercentage - 10, 40)
            NSNotification.readerSettingsChanged()
          },
          label: { Text(LocalText.keyboardCommandIncreaseMargin)
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
          label: { Text(LocalText.keyboardCommandDecreaseLineSpacing) }
        )
        .keyboardShortcut("k")

        Button(
          action: {
            storedLineSpacing = min(storedLineSpacing + 25, 300)
            NSNotification.readerSettingsChanged()
          },
          label: { Text(LocalText.keyboardCommandIncreaseLineSpacing) }
        )
        .keyboardShortcut("l")
      }
    }

    public var resetButton: some View {
      Group {
        Button(
          action: {
            storedLineSpacing = max(storedLineSpacing - 25, 100)

            ThemeManager.currentThemeName = Theme.system.rawValue
            storedFontSize = 16
            storedLineSpacing = 150
            storedMaxWidthPercentage = 80
            preferredFont = WebFont.inter.rawValue
            prefersHighContrastText = true

            NSNotification.readerSettingsChanged()
          },
          label: { Text("Reset") }
        )
      }
    }

    public init(
      preferredFont: Binding<String>,
      prefersHighContrastText: Binding<Bool>,
      justifyText: Binding<Bool>,
      currentThemeName: Binding<String>
    ) {
      self._preferredFont = preferredFont
      self._prefersHighContrastText = prefersHighContrastText
      self._justifyText = justifyText
      self._currentThemeName = currentThemeName
    }

    var spacingButtons: some View {
      Group {
        fontSizeButtons

        Divider()

        marginSizeButtons

        Divider()

        lineSpacingButtons

        Divider()
      }
    }

    public var body: some Commands {
      CommandMenu("Reader Display") {
        spacingButtons

        Picker(selection: $preferredFont, label: Text(LocalText.genericFontFamily)) {
          ForEach(WebFont.allCases, id: \.self) { font in
            Text(font.displayValue).tag(font.rawValue)
          }
        }

        Picker(selection: $currentThemeName, label: Text("Theme")) {
          ForEach(Theme.allCases, id: \.self) { theme in
            Text(theme.rawValue).tag(theme.rawValue).tag(theme.rawValue)
          }
        }

        Toggle(
          isOn: $prefersHighContrastText,
          label: { Text(LocalText.genericHighContrastText) }
        )

        Toggle(
          isOn: $justifyText,
          label: { Text(LocalText.enableJustifyText) }
        )

        Divider()

        resetButton
      }
    }
  }
#endif
