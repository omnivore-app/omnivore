import SwiftUI
import Utils

public enum WebFont: String, CaseIterable {
  case inter = "Inter"
  case merriweather = "Merriweather"
  case lyon = "Lyon"
  case sfmono = "SF Mono"
  case tisa = "Tisa"
}

public struct WebPreferencesPopoverView: View {
  let updateFontFamilyAction: () -> Void
  let updateFontAction: () -> Void
  let updateMarginAction: () -> Void
  let updateLineHeightAction: () -> Void
  let dismissAction: () -> Void

  static let preferredWebFontSizeKey = UserDefaultKey.preferredWebFontSize.rawValue
  #if os(macOS)
    @AppStorage(preferredWebFontSizeKey) var storedFontSize = Int(NSFont.userFont(ofSize: 16)?.pointSize ?? 16)
  #else
    @AppStorage(preferredWebFontSizeKey) var storedFontSize: Int = UITraitCollection.current.preferredWebFontSize
  #endif

  @AppStorage(UserDefaultKey.preferredWebLineSpacing.rawValue) var storedLineSpacing = 150
  @AppStorage(UserDefaultKey.preferredWebMargin.rawValue) var storedMargin = 360
  @AppStorage(UserDefaultKey.preferredWebFont.rawValue) var preferredFont = WebFont.inter.rawValue

  public init(
    updateFontFamilyAction: @escaping () -> Void,
    updateFontAction: @escaping () -> Void,
    updateMarginAction: @escaping () -> Void,
    updateLineHeightAction: @escaping () -> Void,
    dismissAction: @escaping () -> Void
  ) {
    self.updateFontFamilyAction = updateFontFamilyAction
    self.updateFontAction = updateFontAction
    self.updateMarginAction = updateMarginAction
    self.updateLineHeightAction = updateLineHeightAction
    self.dismissAction = dismissAction
  }

  public var body: some View {
    VStack(alignment: .center) {
      ZStack {
        Text("Preferences").font(.appTitleThree)
        HStack {
          Spacer()
          Button(
            action: dismissAction,
            label: { Image(systemName: "xmark").foregroundColor(.appGrayTextContrast) }
          )
        }
      }

      List {
        Section("Sizing") {
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

          if UIDevice.isIPad {
            LabelledStepper(
              labelText: "Margin:",
              onIncrement: {
                storedMargin = min(storedMargin + 45, 560)
                updateMarginAction()
              },
              onDecrement: {
                storedMargin = max(storedMargin - 45, 200)
                updateMarginAction()
              }
            )
          }

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
        }
        Section("Font Family") {
          ForEach(WebFont.allCases, id: \.self) { font in
            Button(
              action: {
                preferredFont = font.rawValue
                updateFontFamilyAction()
              },
              label: {
                HStack {
                  Text(font.rawValue).foregroundColor(.appGrayTextContrast)
                  Spacer()
                  if font.rawValue == preferredFont {
                    Image(systemName: "checkmark").foregroundColor(.appGrayTextContrast)
                  }
                }
              }
            )
          }
        }
      }
    }
    .padding()
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
          action: onIncrement,
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
