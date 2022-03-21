import SwiftUI
#if os(macOS)
  import AppKit
#endif

public extension Font {
  /// 34pt, Inter-Regular
  static var appLargeTitle: Font {
    .customFont(InterFont.regular.rawValue, size: 34, relativeTo: .largeTitle)
  }

  /// 28pt, Inter-Regular
  static var appTitle: Font {
    .customFont(InterFont.regular.rawValue, size: 28, relativeTo: .title)
  }

  /// 22pt, Inter-Regular
  static var appTitleTwo: Font {
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
  case black = "Inter-Black-900"
  case extraBold = "Inter-ExtraBold-800"
  case bold = "Inter-Bold-700"
  case semiBold = "Inter-SemiBold-600"
  case medium = "Inter-Medium-500"
  case regular = "Inter-Regular-400"
  case light = "Inter-Light-300"
  case extraLight = "Inter-ExtraLight-200"
  case thin = "Inter-Thin"
}
