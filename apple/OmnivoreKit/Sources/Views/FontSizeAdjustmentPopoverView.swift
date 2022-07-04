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
    let updateFontFamilyAction: () -> Void
    let updateFontAction: () -> Void
    let updateTextContrastAction: () -> Void
    let updateMaxWidthAction: () -> Void
    let updateLineHeightAction: () -> Void
    let dismissAction: () -> Void

    @AppStorage(UserDefaultKey.preferredWebFontSize.rawValue) var storedFontSize: Int =
      UITraitCollection.current.preferredWebFontSize
    @AppStorage(UserDefaultKey.preferredWebLineSpacing.rawValue) var storedLineSpacing = 150
    @AppStorage(UserDefaultKey.preferredWebMaxWidthPercentage.rawValue) var storedMaxWidthPercentage = 100
    @AppStorage(UserDefaultKey.preferredWebFont.rawValue) var preferredFont = WebFont.inter.rawValue
    @AppStorage(UserDefaultKey.prefersHighContrastWebFont.rawValue) var prefersHighContrastText = true

    public init(
      updateFontFamilyAction: @escaping () -> Void,
      updateFontAction: @escaping () -> Void,
      updateTextContrastAction: @escaping () -> Void,
      updateMaxWidthAction: @escaping () -> Void,
      updateLineHeightAction: @escaping () -> Void,
      dismissAction: @escaping () -> Void
    ) {
      self.updateFontFamilyAction = updateFontFamilyAction
      self.updateFontAction = updateFontAction
      self.updateTextContrastAction = updateTextContrastAction
      self.updateMaxWidthAction = updateMaxWidthAction
      self.updateLineHeightAction = updateLineHeightAction
      self.dismissAction = dismissAction
    }

    var fontList: some View {
      List {
        ForEach(WebFont.allCases, id: \.self) { font in
          Button(
            action: {
              preferredFont = font.rawValue
              updateFontFamilyAction()
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

    public var body: some View {
      NavigationView {
        ScrollView(showsIndicators: false) {
          VStack(alignment: .center) {
            VStack {
              LabelledStepper(
                labelText: "Font Size:",
                onIncrement: {
                  storedFontSize = min(storedFontSize + 2, 28)
                  updateFontAction()
                },
                onDecrement: {
                  storedFontSize = max(storedFontSize - 2, 10)
                  updateFontAction()
                }
              )

              LabelledStepper(
                labelText: "Margin:",
                onIncrement: {
                  storedMaxWidthPercentage = max(storedMaxWidthPercentage - 10, 40)
                  updateMaxWidthAction()
                },
                onDecrement: {
                  storedMaxWidthPercentage = min(storedMaxWidthPercentage + 10, 100)
                  updateMaxWidthAction()
                }
              )

              LabelledStepper(
                labelText: "Line Spacing:",
                onIncrement: {
                  storedLineSpacing = min(storedLineSpacing + 25, 300)
                  updateLineHeightAction()
                },
                onDecrement: {
                  storedLineSpacing = max(storedLineSpacing - 25, 100)
                  updateLineHeightAction()
                }
              )

              Toggle("High Contrast Text:", isOn: $prefersHighContrastText)
                .frame(height: 40)
                .padding(.trailing, 6)
                .onChange(of: prefersHighContrastText) { _ in
                  updateTextContrastAction()
                }

              HStack {
                NavigationLink(destination: fontList) {
                  Text("Change Reader Font")
                }
                Image(systemName: "chevron.right")
                Spacer()
              }
              .frame(height: 40)

              Spacer()
            }
          }
        }
        .padding()
        .navigationTitle("Reader Preferences")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .barTrailing) {
            Button(
              action: dismissAction,
              label: { Text("Done").foregroundColor(.appGrayTextContrast).padding() }
            )
          }
        }
      }
      .navigationViewStyle(.stack)
      .accentColor(.appGrayTextContrast)
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
