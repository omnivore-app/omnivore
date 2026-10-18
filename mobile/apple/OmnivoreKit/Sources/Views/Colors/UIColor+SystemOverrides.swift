#if os(iOS)
  import UIKit

  public extension UIColor {
    static let classInit: Void = {
      swizzleSystemColor(
        uiKitselector: #selector(getter: label),
        customSelector: #selector(getter: customSystemLabel)
      )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: secondaryLabel),
//      customSelector: #selector(getter: customSystemSecondaryLabel)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: tertiaryLabel),
//      customSelector: #selector(getter: customSystemTertiaryLabel)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: quaternaryLabel),
//      customSelector: #selector(getter: customSystemQuaternaryLabel)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: systemFill),
//      customSelector: #selector(getter: customSystemFill)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: secondarySystemFill),
//      customSelector: #selector(getter: customSystemSecondaryFill)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: tertiarySystemFill),
//      customSelector: #selector(getter: customSystemTertiaryFill)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: quaternarySystemFill),
//      customSelector: #selector(getter: customSystemQuaternaryFill)
//    )

      swizzleSystemColor(
        uiKitselector: #selector(getter: placeholderText),
        customSelector: #selector(getter: customSystemPlaceholderText)
      )

      swizzleSystemColor(
        uiKitselector: #selector(getter: systemBackground),
        customSelector: #selector(getter: customSystemBackground)
      )

      swizzleSystemColor(
        uiKitselector: #selector(getter: secondarySystemBackground),
        customSelector: #selector(getter: customSystemSecondaryBackground)
      )

      swizzleSystemColor(
        uiKitselector: #selector(getter: tertiarySystemBackground),
        customSelector: #selector(getter: customSystemTertiaryBackground)
      )

      swizzleSystemColor(
        uiKitselector: #selector(getter: systemGroupedBackground),
        customSelector: #selector(getter: customSystemGroupedBackground)
      )

      swizzleSystemColor(
        uiKitselector: #selector(getter: secondarySystemGroupedBackground),
        customSelector: #selector(getter: customSecondarySystemGroupedBackground)
      )

      swizzleSystemColor(
        uiKitselector: #selector(getter: tertiarySystemGroupedBackground),
        customSelector: #selector(getter: customSystemTertiaryGroupedBackground)
      )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: separator),
//      customSelector: #selector(getter: customSeparator)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: opaqueSeparator),
//      customSelector: #selector(getter: customOpaqueSeparator)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: link),
//      customSelector: #selector(getter: customLink)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: lightText),
//      customSelector: #selector(getter: customLightText)
//    )

//    swizzleSystemColor(
//      uiKitselector: #selector(getter: darkText),
//      customSelector: #selector(getter: customDarkText)
//    )
    }()

    @objc class var customSystemLabel: UIColor {
      UIColor(named: "_grayTextContrast", in: .module, compatibleWith: .current) ?? .label
    }

    @objc class var customSystemSecondaryLabel: UIColor {
      UIColor(named: "_grayText", in: .module, compatibleWith: .current) ?? .secondaryLabel
    }

    @objc class var customSystemTertiaryLabel: UIColor {
      UIColor(named: "_grayTextContrast", in: .module, compatibleWith: .current) ?? .tertiaryLabel
    }

    @objc class var customSystemQuaternaryLabel: UIColor {
      UIColor(named: "_grayTextContrast", in: .module, compatibleWith: .current) ?? .quaternaryLabel
    }

    @objc class var customSystemFill: UIColor {
      UIColor(named: "_grayTextContrast", in: .module, compatibleWith: .current) ?? .systemFill
    }

    @objc class var customSystemSecondaryFill: UIColor {
      UIColor(named: "_grayText", in: .module, compatibleWith: .current) ?? .secondarySystemFill
    }

    @objc class var customSystemTertiaryFill: UIColor {
      UIColor(named: "_grayTextContrast", in: .module, compatibleWith: .current) ?? .tertiarySystemFill
    }

    @objc class var customSystemQuaternaryFill: UIColor {
      UIColor(named: "_grayTextContrast", in: .module, compatibleWith: .current) ?? .quaternarySystemFill
    }

    @objc class var customSystemPlaceholderText: UIColor {
      UIColor(named: "_grayTextContrast", in: .module, compatibleWith: .current) ?? .placeholderText
    }

    @objc class var customSystemBackground: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .systemBackground
    }

    @objc class var customSystemSecondaryBackground: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .secondarySystemBackground
    }

    @objc class var customSystemTertiaryBackground: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .tertiarySystemBackground
    }

    @objc class var customSystemGroupedBackground: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .systemGroupedBackground
    }

    @objc class var customSecondarySystemGroupedBackground: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current)
        ?? .secondarySystemGroupedBackground
    }

    @objc class var customSystemTertiaryGroupedBackground: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current)
        ?? .customSystemTertiaryGroupedBackground
    }

    @objc class var customSeparator: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .separator
    }

    @objc class var customOpaqueSeparator: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .opaqueSeparator
    }

    @objc class var customLink: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .link
    }

    @objc class var customLightText: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .lightText
    }

    @objc class var customDarkText: UIColor {
      UIColor(named: "_appPrimaryBackground", in: .module, compatibleWith: .current) ?? .darkText
    }

    private static func swizzleSystemColor(uiKitselector: Selector, customSelector: Selector) {
      let uiKitMethod = class_getClassMethod(UIColor.self, uiKitselector)
      let customMethod = class_getClassMethod(UIColor.self, customSelector)
      if let uiKitMethod = uiKitMethod, let customMethod = customMethod {
        method_exchangeImplementations(uiKitMethod, customMethod)
      }
    }
  }
#endif
