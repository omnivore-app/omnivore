import SwiftUI

public extension Color {
  static var appBackground: Color { Color("_background", bundle: .module) }
  static var appDeepBackground: Color { Color("_deepBackground", bundle: .module) }
  static var appGreenSuccess: Color { Color("_appGreenSuccess", bundle: .module) }

  // GrayScale -- adapted from Radix Colors
  static var appGrayBorder: Color { Color("_grayBorder", bundle: .module) }
  static var appGraySolid: Color { Color("_graySolid", bundle: .module) }
  static var appGrayText: Color { Color("_grayText", bundle: .module) }
  static var appCtaYellow: Color { Color("_ctaYellow", bundle: .module) }
  static var appGrayTextContrast: Color { Color("_grayTextContrast", bundle: .module) }

  // Catalog Colors
  static var appYellow48: Color { Color("_yellow48", bundle: .module) }
  static var appYellow96: Color { Color("_yellow96", bundle: .module) }

  static var appButtonBackground: Color { Color("_buttonBackground", bundle: .module) }
  static var appTextDefault: Color { Color("_utilityTextDefault", bundle: .module) }
  static var appPrimaryBackground: Color { Color("_appPrimaryBackground", bundle: .module) }
  static var indicatorBlue: Color { Color("_indicatorBlue", bundle: .module) }
  static var webControlButtonBackground: Color { Color("_webControlButtonBackground", bundle: .module) }

  // New theme colors
  static var themeMediumGray: Color { Color("_mediumGray", bundle: .module) }
  static var themeMiddleGray: Color { Color("_middleGray", bundle: .module) }
  static var themeLightGray: Color { Color("_lightGray", bundle: .module) }
  static var themeLightestGray: Color { Color("_lightestGray", bundle: .module) }
  static var themeDarkWhiteGray: Color { Color("_darkWhiteGray", bundle: .module) }
  static var themeDarkGray: Color { Color("_darkGray", bundle: .module) }
  static var themeLibraryItemSubtle: Color { Color("_themeLibraryItemSubtle", bundle: .module) }
  static var themeFeatureBackground: Color { Color("_themeFeatureBackground", bundle: .module) }

  static var themeLabelOutline: Color { Color("_labelOutline", bundle: .module) }
  static var themeLabelForeground: Color { Color("_labelForeground", bundle: .module) }
  static var themeLabelBackground: Color { Color("_labelBackground", bundle: .module) }

  static var toolbarItemForeground: Color { Color("toolbarItemForeground", bundle: .module) }

  static var themeAudioPlayerGray: Color { Color("_audioPlayerGray", bundle: .module) }
  static var themeGrayBg01: Color { Color("_themeGrayBg01", bundle: .module) }
  static var themeHighlightColor: Color { Color("_highlightColor", bundle: .module) }
  static var themeTTSReadingText: Color { Color("_themeTTSReadingText", bundle: .module) }
  static var themeDisabledBG: Color { Color("_themeDisabledBG", bundle: .module) }
  static var themeSolidBackground: Color { Color("_themeSolidBackground", bundle: .module) }
  static var thBorderColor: Color { Color("thBorderColor", bundle: .module) }
  static var thLibrarySeparator: Color { Color("thLibrarySeparator", bundle: .module) }
  static var thLightWhiteGrey: Color { Color("_themeLightWhiteGrey", bundle: .module) }

  static var thFeatureSeparator: Color { Color("featureSeparator", bundle: .module) }

  static var thFallbackImageForeground: Color { Color("thFallbackImageForeground", bundle: .module) }
  static var thFallbackImageBackground: Color { Color("thFallbackImageBackground", bundle: .module) }

  static var circleButtonBackground: Color { Color("_circleButtonBackground", bundle: .module) }
  static var circleButtonForeground: Color { Color("_circleButtonForeground", bundle: .module) }
  static var extensionBackground: Color { Color("_extensionBackground", bundle: .module) }
  static var extensionPanelBackground: Color { Color("_extensionPanelBackground", bundle: .module) }
  static var extensionTextSubtle: Color { Color("_extensionTextSubtle", bundle: .module) }

  static var noteContainer: Color { Color("_noteContainer", bundle: .module) }
  static var textFieldBackground: Color { Color("_textFieldBackground", bundle: .module) }
  static var themeTabBarColor: Color { Color("_themeTabBarColor", bundle: .module) }
  static var themeTabButtonColor: Color { Color("_themeTabButtonColor", bundle: .module) }

  // Apple system UIColor equivalents
  #if os(iOS)
    static var systemBackground: Color { Color(.systemBackground) }
    static var systemPlaceholder: Color { Color(.placeholderText) }
    static var secondarySystemGroupedBackground: Color { Color(.secondarySystemGroupedBackground) }
    static var systemGray6: Color { Color(.systemGray6) }
    static var systemLabel: Color { Color(uiColor: .label) }

  #elseif os(macOS)
    static var systemBackground: Color { Color(.windowBackgroundColor) }
    static var systemPlaceholder: Color { Color(.placeholderTextColor) }
    static var systemLabel: Color { Color(.labelColor) }
    static var systemGray6: Color { Color(NSColor.systemGray) }

    // Just for compilation. secondarySystemGroupedBackground shouldn't be used on macOS
    static var secondarySystemGroupedBackground: Color { Color(.windowBackgroundColor) }
  #endif
}
