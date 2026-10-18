#if os(iOS)
  import UIKit

  public extension UITraitCollection {
    var preferredWebFontSize: Int {
      switch preferredContentSizeCategory {
      case .extraSmall:
        return 14
      case .small:
        return 15
      case .medium:
        return 16
      case .large:
        return 17
      case .extraLarge:
        return 19
      case .extraExtraLarge:
        return 21
      case .extraExtraExtraLarge:
        return 23
      case .accessibilityMedium:
        return 28
      case .accessibilityLarge:
        return 33
      case .accessibilityExtraLarge:
        return 40
      case .accessibilityExtraExtraLarge:
        return 47
      case .accessibilityExtraExtraExtraLarge:
        return 53
      default:
        return 17
      }
    }
  }

#endif
