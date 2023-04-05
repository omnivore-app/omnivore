import SwiftUI
#if os(macOS)
  import AppKit
#endif

public extension Font {
  /// 34pt, Inter-Regular
  static var appLargeTitle: Font {
    .customFont(InterFont.bold.rawValue, size: 34, relativeTo: .largeTitle)
  }

  /// 28pt, Inter-Regular
  static var appTitle: Font {
    .customFont(InterFont.regular.rawValue, size: 28, relativeTo: .title)
  }

  static var appIconLarge: Font {
    Font.custom(InterFont.regular.rawValue, size: 52, relativeTo: .title2)
  }

  static var appTitleTwo: Font {
    Font.custom(InterFont.regular.rawValue, size: 28, relativeTo: .title2)
  }

  static var textToSpeechRead: Font {
    Font.system(size: 24, weight: .bold)
  }

  static var appNavbarIcon: Font {
    Font.custom(InterFont.regular.rawValue, size: 22, relativeTo: .title2)
  }

  /// 20pt, Inter-Regular
  static var appTitleThree: Font {
    Font.custom(InterFont.regular.rawValue, size: 20, relativeTo: .title3)
  }

  /// 17pt, Inter-Semibold
  static var appHeadline: Font {
    .customFont(InterFont.semiBold.rawValue, size: 17, relativeTo: .headline)
  }

  /// 17pt, Inter-Regular
  static var appBody: Font {
    .customFont(InterFont.regular.rawValue, size: 17, relativeTo: .body)
  }

  /// 16pt, Inter-Regular
  static var appCallout: Font {
    .customFont(InterFont.regular.rawValue, size: 16, relativeTo: .callout)
  }

  static var appTextToSpeechCurrent: Font {
    .customFont(InterFont.medium.rawValue, size: 16, relativeTo: .callout)
  }

  /// 15pt, Inter-Regular
  static var appSubheadline: Font {
    .customFont(InterFont.regular.rawValue, size: 15, relativeTo: .subheadline)
  }

  /// 13pt, Inter-Regular
  static var appFootnote: Font {
    .customFont(InterFont.regular.rawValue, size: 13, relativeTo: .footnote)
  }

  /// 12pt, Inter-Regular
  static var appCaption: Font {
    .customFont(InterFont.regular.rawValue, size: 12, relativeTo: .caption)
  }

  /// 12pt, Inter-Regular
  static var appCaptionMedium: Font {
    .customFont(InterFont.medium.rawValue, size: 12, relativeTo: .caption)
  }

  /// 11pt, Inter-Regular
  static var appCaptionTwo: Font {
    Font.custom(InterFont.regular.rawValue, size: 11, relativeTo: .caption2)
  }
}

extension Font {
  static func customFont(_ fontName: String, size: CGFloat, relativeTo style: Font.TextStyle) -> Font {
    Font.custom(fontName, size: size, relativeTo: style)
  }
}

private enum InterFont: String {
  case black = "Inter-Black"
  case extraBold = "Inter-ExtraBold"
  case bold = "Inter-Bold"
  case semiBold = "Inter-SemiBold"
  case medium = "Inter-Medium"
  case regular = "Inter-Regular"
  case light = "Inter-Light"
  case extraLight = "Inter-ExtraLight"
  case thin = "Inter-Thin"
}
