import SwiftUI
import Utils

public enum WebFont: String, CaseIterable {
  case inter = "Inter"
  case system = "unset"
  case merriweather = "Merriweather"
  case lora = "Lora"
  case opensans = "Open Sans"
  case roboto = "Roboto"
  case crimsontext = "Crimson Text"
  case sourceserifpro = "Source Serif Pro"
  case openDyslexic = "OpenDyslexic"

  public var displayValue: String {
    switch self {
    case .inter, .merriweather, .lora, .opensans, .roboto, .crimsontext, .sourceserifpro:
      return rawValue
    case .openDyslexic:
      return "Open Dyslexic"
    case .system:
      return "System Default"
    }
  }
}

#if os(iOS)
  public struct WebPreferencesPopoverView: View {
    let updateReaderPreferences: () -> Void
    let dismissAction: () -> Void

    @AppStorage(UserDefaultKey.preferredWebFontSize.rawValue) var storedFontSize: Int =
      UITraitCollection.current.preferredWebFontSize
    @AppStorage(UserDefaultKey.preferredWebLineSpacing.rawValue) var storedLineSpacing = 150
    @AppStorage(UserDefaultKey.preferredWebMaxWidthPercentage.rawValue) var storedMaxWidthPercentage = 100
    @AppStorage(UserDefaultKey.preferredWebFont.rawValue) var preferredFont = WebFont.inter.rawValue
    @AppStorage(UserDefaultKey.prefersHighContrastWebFont.rawValue) var prefersHighContrastText = true

    public init(
      updateReaderPreferences: @escaping () -> Void,
      dismissAction: @escaping () -> Void
    ) {
      self.updateReaderPreferences = updateReaderPreferences
      self.dismissAction = dismissAction
    }

    var fontList: some View {
      List {
        ForEach(WebFont.allCases, id: \.self) { font in
          Button(
            action: {
              preferredFont = font.rawValue
              updateReaderPreferences()
            },
            label: {
              HStack {
                Text(font.displayValue).foregroundColor(.appGrayTextContrast)
                Spacer()
                if font.rawValue == preferredFont {
                  Image(systemName: "checkmark").foregroundColor(.appGrayTextContrast)
                }
              }
            }
          )
        }
      }
      .listStyle(.plain)
      .navigationBarTitleDisplayMode(.inline)
      .navigationTitle("Reader Font")
    }

    var themePicker: some View {
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 16) {
          ForEach(Theme.allCases, id: \.self) { theme in
            VStack {
              ZStack {
                Circle()
                  .foregroundColor(theme.bgColor)
                  .frame(minWidth: 32, minHeight: 32)
                  .padding(8)
              }

              Text(theme.rawValue).font(.appCaption)
            }
            .padding(8)
            .background(Color(red: 248 / 255.0, green: 248 / 255.0, blue: 248 / 255.0))
            .onTapGesture {
              ThemeManager.currentThemeName = theme.rawValue
              updateReaderPreferences()
            }
            .cornerRadius(8)
            .overlay(
              RoundedRectangle(cornerRadius: 8)
                .stroke(ThemeManager.currentThemeName == theme.rawValue ? Color.appCtaYellow : .clear, lineWidth: 2)
            )
            .padding(2)
          }
        }
      }
    }

    public var body: some View {
      NavigationView {
        VStack(alignment: .center) {
//          themePicker
//            .padding(.bottom, 16)

          LabelledStepper(
            labelText: "Font Size",
            onIncrement: {
              storedFontSize = min(storedFontSize + 2, 28)
              updateReaderPreferences()
            },
            onDecrement: {
              storedFontSize = max(storedFontSize - 2, 10)
              updateReaderPreferences()
            }
          )

          LabelledStepper(
            labelText: "Margin",
            onIncrement: {
              storedMaxWidthPercentage = max(storedMaxWidthPercentage - 10, 40)
              updateReaderPreferences()
            },
            onDecrement: {
              storedMaxWidthPercentage = min(storedMaxWidthPercentage + 10, 100)
              updateReaderPreferences()
            }
          )

          LabelledStepper(
            labelText: "Line Spacing",
            onIncrement: {
              storedLineSpacing = min(storedLineSpacing + 25, 300)
              updateReaderPreferences()
            },
            onDecrement: {
              storedLineSpacing = max(storedLineSpacing - 25, 100)
              updateReaderPreferences()
            }
          )

          HStack {
            NavigationLink(destination: fontList) {
              Text("Font")
            }
            Spacer()
            Button(action: {}, label: { Text("Crimson Text").frame(width: 91) })
              .buttonStyle(RoundedRectButtonStyle())
          }
          .frame(height: 40)

          Toggle("High Contrast Text:", isOn: $prefersHighContrastText)
            .frame(height: 40)
            .padding(.trailing, 6)
            .onChange(of: prefersHighContrastText) { _ in
              updateReaderPreferences()
            }

          Spacer()
        }
        .padding()
        .navigationTitle("Reader Preferences")
        .navigationBarTitleDisplayMode(.inline)
//        .toolbar {
//          ToolbarItem(placement: .barTrailing) {
//            Button(
//              action: dismissAction,
//              label: { Text("Done").foregroundColor(.appGrayTextContrast).padding() }
//            )
//          }
//        }
      }
      // .navigationViewStyle(.stack)
      // .accentColor(.appGrayTextContrast)
    }
  }

  struct LabelledStepper: View {
    let labelText: String
    let onIncrement: () -> Void
    let onDecrement: () -> Void

    var body: some View {
      HStack(alignment: .center, spacing: 0) {
        Text(labelText)
        Spacer()
        HStack(spacing: 0) {
          Button(
            action: onDecrement,
            label: {
              Image(systemName: "minus")
                .foregroundColor(.systemLabel)
                .padding()
            }
          )
          .frame(width: 55, height: 40, alignment: .center)
          Divider()
            .frame(height: 30)
            .background(Color.systemLabel)
          Button(
            action: onIncrement,
            label: {
              Image(systemName: "plus")
                .foregroundColor(.systemLabel)
                .padding()
            }
          )
          .frame(width: 55, height: 40, alignment: .center)
        }
        .background(Color.appButtonBackground)
        .cornerRadius(8)
      }
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

    @AppStorage(UserDefaultKey.preferredWebFontSize.rawValue) var storedFontSize: Int =
      UITraitCollection.current.preferredWebFontSize

    public var body: some View {
      HStack(alignment: .center, spacing: 0) {
        Button(
          action: {
            storedFontSize = max(storedFontSize - 2, 10)
            decreaseFontAction()
          },
          label: {
            Image(systemName: "minus")
              .foregroundColor(.systemLabel)
              .padding()
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
              .foregroundColor(.systemLabel)
              .padding()
          }
        )
        .frame(width: 55, height: 40, alignment: .center)
      }
    }
  }
#endif
