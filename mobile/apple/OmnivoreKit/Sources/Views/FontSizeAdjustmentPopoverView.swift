import SwiftUI
import Utils

public enum WebFont: String, CaseIterable {
  case inter = "Inter"
  case system = "system-ui"
  case merriweather = "Merriweather"
  case lora = "Lora"
  case opensans = "Open Sans"
  case roboto = "Roboto"
  case crimsontext = "Crimson Text"
  case sourceserifpro = "Source Serif Pro"
  case openDyslexic = "OpenDyslexic"
  case georgia = "Georgia"
  case montserrat = "Montserrat"
  case newsreader = "Newsreader"
  case atkinsonHyperlegible = "AtkinsonHyperlegible"
  case lxgWWenKai = "LXGWWenKai"
  case sourceSansPro = "SourceSansPro"
  case lexend = "Lexend"
  case IBMPlexSans
  case literata = "Literata"
  case fraunces = "Fraunces"

  static var sorted: [WebFont] {
    allCases.sorted { left, right in
      left.displayValue <= right.displayValue
    }
  }

  public var registeredName: String {
    switch self {
    case .openDyslexic:
      return "OpenDyslexicAlta"
    case .system:
      return "San Francisco"
    default:
      return rawValue
    }
  }

  public var displayValue: String {
    switch self {
    case .inter,
         .merriweather,
         .lora,
         .opensans,
         .roboto,
         .crimsontext,
         .sourceserifpro,
         .georgia,
         .montserrat,
         .newsreader,
         .lxgWWenKai,
         .lexend,
         .literata,
         .fraunces:
      return rawValue
    case .atkinsonHyperlegible:
      return "Atkinson Hyperlegible"
    case .openDyslexic:
      return "Open Dyslexic"
    case .sourceSansPro:
      return "Source Sans Pro"
    case .IBMPlexSans:
      return "IBM Plex Sans"
    case .system:
      return "System Default"
    }
  }

  public func font(size: CGFloat = 22) -> Font? {
    #if os(iOS)
      if let uiFont = UIFont(name: registeredName, size: size) {
        return Font(uiFont as CTFont)
      }
    #else
      if let nsFont = NSFont(name: registeredName, size: size) {
        return Font(nsFont as CTFont)
      }
    #endif
    return Font.system(size: size)
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
    @AppStorage(UserDefaultKey.enableHighlightOnRelease.rawValue) var enableHighlightOnRelease = false
    @AppStorage(UserDefaultKey.preferredWebFont.rawValue) var preferredFont = WebFont.inter.rawValue
    @AppStorage(UserDefaultKey.prefersHighContrastWebFont.rawValue) var prefersHighContrastText = true
    @AppStorage(UserDefaultKey.justifyText.rawValue) var justifyText = false
    @AppStorage(UserDefaultKey.prefersHideStatusBarInReader.rawValue) var prefersHideStatusBar = false

    public init(
      updateReaderPreferences: @escaping () -> Void,
      dismissAction: @escaping () -> Void
    ) {
      self.updateReaderPreferences = updateReaderPreferences
      self.dismissAction = dismissAction
    }

    var fontList: some View {
      List {
        ForEach(WebFont.sorted, id: \.self) { font in
          Button(
            action: {
              preferredFont = font.rawValue
              updateReaderPreferences()
            },
            label: {
              HStack {
                Text(font.displayValue)
                  .font(font.font(size: 22))
                  .foregroundColor(.appGrayTextContrast)
                Spacer()
                if font.rawValue == preferredFont {
                  Image(systemName: "checkmark")
                    .font(Font.system(size: 18))
                    .foregroundColor(.appGrayTextContrast)
                }
              }
            }
          ).frame(minHeight: 44)
        }
      }
      .listStyle(.plain)
      .navigationBarTitleDisplayMode(.inline)
      .navigationTitle("Reader Font")
    }

    var advancedSettings: some View {
      VStack {
        Toggle("High Contrast Text:", isOn: $prefersHighContrastText)
          .frame(height: 40)
          .padding(.trailing, 6)
          .onChange(of: prefersHighContrastText) { _ in
            updateReaderPreferences()
          }

        Toggle(LocalText.enableHighlightOnReleaseText, isOn: $enableHighlightOnRelease)
          .frame(height: 40)
          .padding(.trailing, 6)
          .onChange(of: enableHighlightOnRelease) { _ in
            updateReaderPreferences()
          }

        Toggle("Justify Text", isOn: $justifyText)
          .frame(height: 40)
          .padding(.trailing, 6)
          .onChange(of: justifyText) { _ in
            updateReaderPreferences()
          }

        Toggle("Hide Status Bar", isOn: $prefersHideStatusBar)
          .frame(height: 40)
          .padding(.trailing, 6)
          .onChange(of: prefersHideStatusBar) { _ in
            updateReaderPreferences()
          }

        Spacer()
      }
      .padding(.horizontal, 30)
      .listStyle(.plain)
      .navigationBarTitleDisplayMode(.inline)
      .navigationTitle("Advanced Settings")
    }

    var themePicker: some View {
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 25) {
          ForEach(Theme.allCases.filter { $0 != .system }, id: \.self) { theme in
            let isSelected = currentTheme == theme.rawValue
            let selectedColor = currentTheme == Theme.apollo.rawValue ? Color.appCtaYellow : Color(hex: "#6A6968")

            VStack {
              Circle()
                .strokeBorder(isSelected ?
                  Color(hex: "#6A6968") ?? Color.appGrayBorder
                  : .clear, lineWidth: isSelected ? 2 : 0)
                .background(Circle().fill(theme.keyColor))
                .frame(width: 32, height: 32)
            }
            .onTapGesture {
              currentTheme = theme.rawValue
              updateReaderPreferences()
            }
            .cornerRadius(8)
            .overlay(
              Image("checkmark-small", bundle: .module)
                .foregroundColor(isSelected ? selectedColor : .clear)
            )
          }
          Spacer()
        }
      }.onChange(of: currentTheme) { _ in
        ThemeManager.currentThemeName = currentTheme
        isAutoTheme = currentTheme == Theme.system.rawValue
        updateReaderPreferences()
      }.onAppear {
        currentTheme = ThemeManager.currentThemeName
      }
    }

    var fontSizeSlider: some View {
      HStack {
        Button(action: {
          storedFontSize = max(storedFontSize - 2, 10)
          updateReaderPreferences()

        }, label: { Image(systemName: "textformat.size.smaller") })
          .buttonStyle(.plain)
          .frame(width: 25, height: 25, alignment: .center)
          .foregroundColor(.appGrayTextContrast.opacity(0.4))
        CustomSlider(value: $storedFontSize, minValue: 10, maxValue: 48) { _ in
          if storedFontSize % 1 == 0 {
            updateReaderPreferences()
          }
        }
        .padding(.horizontal, 10)
        .tint(Color(hex: "#D9D9D9"))

        Button(action: {
          storedFontSize = min(storedFontSize + 2, 28)
          updateReaderPreferences()

        }, label: { Image(systemName: "textformat.size.larger") })
          .buttonStyle(.plain)
          .frame(width: 25, height: 25, alignment: .center)
          .foregroundColor(.appGrayTextContrast.opacity(0.4))
      }
    }

    var marginSlider: some View {
      HStack {
        let minValue = UIDevice.isIPad ? 40 : 70
        let stepSize = UIDevice.isIPad ? 10 : 2

        Button(action: {
          storedMaxWidthPercentage = max(storedMaxWidthPercentage - stepSize, minValue)
          updateReaderPreferences()

        }, label: { Image("margin-smaller", bundle: .module) })
          .buttonStyle(.plain)
          .frame(width: 25, height: 25, alignment: .center)
          .foregroundColor(.appGrayTextContrast.opacity(0.4))
        CustomSlider(value: $storedMaxWidthPercentage, minValue: minValue, maxValue: 100) { _ in
          updateReaderPreferences()
        }
        .padding(.horizontal, 10)
        .tint(Color(hex: "#D9D9D9"))

        Button(action: {
          storedMaxWidthPercentage = min(storedMaxWidthPercentage + stepSize, 100)
          updateReaderPreferences()

        }, label: { Image("margin-larger", bundle: .module) })
          .buttonStyle(.plain)
          .frame(width: 25, height: 25, alignment: .center)
          .foregroundColor(.appGrayTextContrast.opacity(0.4))
      }
    }

    var lineHeightSlider: some View {
      HStack {
        Button(action: {
          storedLineSpacing = max(storedLineSpacing - 25, 100)
          updateReaderPreferences()

        }, label: { Image("lineheight-smaller", bundle: .module) })
          .buttonStyle(.plain)
          .frame(width: 25, height: 25, alignment: .center)
          .foregroundColor(.appGrayTextContrast.opacity(0.4))
        CustomSlider(value: $storedLineSpacing, minValue: 100, maxValue: 300) { _ in
          updateReaderPreferences()
        }
        .padding(.horizontal, 10)
        .tint(Color(hex: "#D9D9D9"))

        Button(action: {
          storedLineSpacing = min(storedLineSpacing + 25, 300)
          updateReaderPreferences()

        }, label: { Image("lineheight-larger", bundle: .module) })
          .buttonStyle(.plain)
          .frame(width: 25, height: 25, alignment: .center)
          .foregroundColor(.appGrayTextContrast.opacity(0.4))
      }
    }

    var brightnessSlider: some View {
      HStack {
        Button(action: {
          storedFontSize = min(storedFontSize + 2, 28)
        }, label: { Image("brightness-lower", bundle: .module) })
          .buttonStyle(.plain)
          .frame(width: 25, height: 25, alignment: .center)
          .foregroundColor(.appGrayTextContrast.opacity(0.4))
        CustomSlider(value: $storedFontSize, minValue: 10, maxValue: 28) { _ in
          updateReaderPreferences()
        }
        .padding(.horizontal, 10)

        Button(action: {
          storedFontSize = max(storedFontSize - 2, 10)
        }, label: { Image("brightness-higher", bundle: .module) })
          .buttonStyle(.plain)
          .frame(width: 25, height: 25, alignment: .center)
          .foregroundColor(.appGrayTextContrast.opacity(0.4))
      }
    }

    var preferredFontFont: Font? {
      let webFont = WebFont.allCases.first(where: { $0.rawValue == preferredFont })
      return webFont?.font(size: 14)
    }

    var preferredFontDisplayName: String {
      let webFont = WebFont.allCases.first(where: { $0.rawValue == preferredFont })
      return webFont?.displayValue ?? ""
    }

    @State var isAutoTheme = true
    @State var currentTheme = ThemeManager.currentThemeName

    var systemThemeCheckbox: some View {
      Toggle(isOn: $isAutoTheme) {
        Text("Auto")
          .font(Font.system(size: 12))
          .foregroundColor(Color(hex: "#999999"))
      }
      .toggleStyle(CheckboxToggleStyle())
      .onChange(of: isAutoTheme, perform: { _ in
        if isAutoTheme {
          currentTheme = Theme.system.rawValue
        } else if currentTheme == Theme.system.rawValue {
          // This else if block handles the case where the user toggles off auto
          // but not when they click on another theme to toggle off auto
          let newTheme = Color.isDarkMode ? Theme.dark : Theme.light
          currentTheme = newTheme.rawValue
        }
      })
      .onChange(of: currentTheme, perform: { _ in
        isAutoTheme = (currentTheme == Theme.system.rawValue)
      })
      .onAppear {
        isAutoTheme = ThemeManager.currentTheme == .system
      }
    }

    public var controls: some View {
      Group {
        Group {
          HStack(alignment: .center) {
            Text(LocalText.genericFont)
              .font(Font.system(size: 14, weight: .medium))

            Spacer()
            NavigationLink(destination: fontList) {
              Text(preferredFontDisplayName)
                .font(preferredFontFont)

              Image(systemName: "chevron.right")
                .font(Font.system(size: 10))
            }
          }
          .frame(height: 40)
          .padding(.top, 10)
          .padding(.bottom, 10)
          .foregroundColor(.appGrayTextContrast)

          fontSizeSlider
        }.tint(Color(hex: "#6A6968"))
          .padding(.horizontal, 30)

        Divider()
          .padding(.vertical, 10)

        Group {
          Text("Margin")
            .font(Font.system(size: 14))
            .frame(maxWidth: .infinity, alignment: .leading)
            .foregroundColor(.appGrayTextContrast)

          marginSlider
            .padding(.top, 5)
            .padding(.bottom, 10)

          Text("Line Height")
            .font(Font.system(size: 14))
            .frame(maxWidth: .infinity, alignment: .leading)
            .foregroundColor(.appGrayTextContrast)

          lineHeightSlider
          // .padding(.bottom, 20)

          //            Text("Brightness")
          //              .font(Font.system(size: 14))
          //              .frame(maxWidth: .infinity, alignment: .leading)
          //              .foregroundColor(Color(hex: "#6A6968"))
          //
          //            brightnessSlider

        }.tint(.appGrayTextContrast)
          .padding(.horizontal, 30)

        Divider()
          .padding(.vertical, 10)

        Group {
          HStack(alignment: .center) {
            Text("Theme")
              .font(Font.system(size: 14))
              .frame(maxWidth: .infinity, alignment: .leading)
              .foregroundColor(.appGrayTextContrast)
            Spacer()

            systemThemeCheckbox
          }

          themePicker
        }.tint(Color(hex: "#6A6968"))
          .padding(.horizontal, 30)

        Divider()
          .padding(.vertical, 10)

        Group {
          HStack(alignment: .center) {
            Button(action: {
              currentTheme = Theme.system.rawValue
              storedFontSize = UITraitCollection.current.preferredWebFontSize
              storedLineSpacing = 150
              storedMaxWidthPercentage = 100
              enableHighlightOnRelease = false
              preferredFont = WebFont.inter.rawValue
              prefersHighContrastText = true
              enableHighlightOnRelease = false

              updateReaderPreferences()
            }, label: {
              Text("Reset")
                .font(Font.system(size: 12, weight: .bold))
                .foregroundColor(.appGrayTextContrast)
            })

            Spacer()
            NavigationLink(destination: advancedSettings) {
              Text("Advanced Settings")
                .font(Font.system(size: 12))
              Image(systemName: "chevron.right")
                .font(Font.system(size: 10))
                .foregroundColor(Color(hex: "#A9A9A9"))
            }
          }
          .foregroundColor(Color.appGrayText)
        }
        .padding(.horizontal, 30)
      }
    }

//    updateFontSize(20)
//    setMarginWidth(290)
//    setLineHeight(150)
//    setFontFamily(DEFAULT_FONT)

    public var body: some View {
      NavigationView {
        VStack(alignment: .center) {
          controls
          Spacer()
        }
        .navigationTitle("Reader Preferences")
        .navigationBarTitleDisplayMode(.inline)
      }
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

  struct CheckboxToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
      Button(action: {
        configuration.isOn.toggle()
      }, label: {
        HStack {
          configuration.label

          Image(systemName: configuration.isOn ? "checkmark.square" : "square")
            .foregroundColor(Color(hex: "#D9D9D9"))
        }
      })
        .buttonStyle(.plain)
    }
  }
#endif
