import Utils
import WebKit

/// Describes actions that can be sent from the WebView back to native views.
/// The names on the javascript side must match for an action to be handled.
public enum WebViewAction: String, CaseIterable {
  case highlightAction
  case readingProgressUpdate
}

public final class OmnivoreWebView: WKWebView {
  #if os(iOS)
    private var panGestureRecognizer: UIPanGestureRecognizer?
    private var tapGestureRecognizer: UITapGestureRecognizer?
  #endif

  override init(frame: CGRect, configuration: WKWebViewConfiguration) {
    super.init(frame: frame, configuration: configuration)

    #if os(iOS)
      initNativeIOSMenus()
    #endif
  }

  @available(*, unavailable)
  required init?(coder _: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  public func updateFontFamily() {
    if let fontFamily = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebFont.rawValue) as? String {
      dispatchEvent(.updateFontFamily(family: fontFamily))
    }
  }

  public func updateFontSize() {
    if let fontSize = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebFontSize.rawValue) as? Int {
      dispatchEvent(.updateFontSize(size: fontSize))
    }
  }

  public func updateMaxWidthPercentage() {
    if let maxWidthPercentage = UserDefaults.standard.value(
      forKey: UserDefaultKey.preferredWebMaxWidthPercentage.rawValue
    ) as? Int {
      dispatchEvent(.updateMaxWidthPercentage(maxWidthPercentage: maxWidthPercentage))
    }
  }

  public func updateLineHeight() {
    if let height = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebLineSpacing.rawValue) as? Int {
      dispatchEvent(.updateLineHeight(height: height))
    }
  }

  public func updateTextContrast() {
    let isHighContrast = UserDefaults.standard.value(
      forKey: UserDefaultKey.prefersHighContrastWebFont.rawValue
    ) as? Bool

    if let isHighContrast = isHighContrast {
      dispatchEvent(.handleFontContrastChange(isHighContrast: isHighContrast))
    }
  }

  public func shareOriginalItem() {
    dispatchEvent(.share)
  }

  public func dispatchEvent(_ event: WebViewDispatchEvent) {
    evaluateJavaScript(event.script) { obj, err in
      if let err = err { print(err) }
      if let obj = obj { print(obj) }
    }
  }

  #if os(iOS)
    override public func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
      super.traitCollectionDidChange(previousTraitCollection)
      guard previousTraitCollection?.userInterfaceStyle != traitCollection.userInterfaceStyle else { return }
      dispatchEvent(.updateColorMode(isDark: traitCollection.userInterfaceStyle == .dark))
    }

  #elseif os(macOS)
    override public func viewDidChangeEffectiveAppearance() {
      super.viewDidChangeEffectiveAppearance()
      switch effectiveAppearance.bestMatch(from: [.aqua, .darkAqua]) {
      case .some(.darkAqua):
        dispatchEvent(.updateColorMode(isDark: true))
      default:
        dispatchEvent(.updateColorMode(isDark: false))
      }
    }
  #endif
}

#if os(iOS)
  extension OmnivoreWebView: UIGestureRecognizerDelegate, WKScriptMessageHandler {
    func initNativeIOSMenus() {
      isUserInteractionEnabled = true

      NotificationCenter.default
        .addObserver(self,
                     selector: #selector(menuDidHide),
                     name: UIMenuController.didHideMenuNotification,
                     object: nil)

      setDefaultMenu()
    }

    public func userContentController(_: WKUserContentController, didReceive message: WKScriptMessage) {
      guard let messageBody = message.body as? [String: Any] else { return }
      guard let actionID = messageBody["actionID"] as? String else { return }

      switch actionID {
      case "showMenu":
        if let rectX = messageBody["rectX"] as? Double,
           let rectY = messageBody["rectY"] as? Double,
           let rectWidth = messageBody["rectWidth"] as? Double,
           let rectHeight = messageBody["rectHeight"] as? Double
        { // swiftlint:disable:this opening_brace
          showHighlightMenu(CGRect(x: rectX, y: rectY, width: rectWidth, height: rectHeight))
        }
      default:
        break
      }
    }

    private func setDefaultMenu() {
      let annotate = UIMenuItem(title: "Annotate", action: #selector(annotateSelection))
      let highlight = UIMenuItem(title: "Highlight", action: #selector(highlightSelection))
      //     let share = UIMenuItem(title: "Share", action: #selector(shareSelection))

      UIMenuController.shared.menuItems = [highlight, /* share, */ annotate]
    }

    private func setHighlightMenu() {
      let annotate = UIMenuItem(title: "Annotate", action: #selector(annotateSelection))
      let remove = UIMenuItem(title: "Remove", action: #selector(removeSelection))
      //     let share = UIMenuItem(title: "Share", action: #selector(shareSelection))

      UIMenuController.shared.menuItems = [remove, /* share, */ annotate]
    }

    override public var canBecomeFirstResponder: Bool {
      true
    }

    @objc func menuDidHide() {
      setDefaultMenu()
    }

    // swiftlint:disable:next line_length
    public func gestureRecognizer(_: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith _: UIGestureRecognizer) -> Bool {
      true
    }

    override public func canPerformAction(_ action: Selector, withSender _: Any?) -> Bool {
      switch action {
      case #selector(annotateSelection): return true
      case #selector(highlightSelection): return true
      case #selector(shareSelection): return true
      case #selector(removeSelection): return true
      case #selector(copy(_:)): return true
      case Selector(("_lookup:")): return true
      default: return false
      }
    }

    @objc private func gestureHandled() {
      hideMenuAndDismissHighlight()
    }

    @objc private func annotateSelection() {
      dispatchEvent(.annotate)
      hideMenu()
    }

    @objc private func highlightSelection() {
      dispatchEvent(.highlight)
      hideMenu()
    }

    @objc private func shareSelection() {
      dispatchEvent(.share)
      hideMenu()
    }

    @objc private func removeSelection() {
      dispatchEvent(.remove)
      hideMenu()
    }

    @objc override public func copy(_ sender: Any?) {
      super.copy(sender)
      dispatchEvent(.copyHighlight)
      hideMenu()
    }

    private func hideMenu() {
      UIMenuController.shared.hideMenu()
      if let tapGestureRecognizer = tapGestureRecognizer {
        removeGestureRecognizer(tapGestureRecognizer)
        self.tapGestureRecognizer = nil
      }
      if let panGestureRecognizer = panGestureRecognizer {
        removeGestureRecognizer(panGestureRecognizer)
        self.panGestureRecognizer = nil
      }
      setDefaultMenu()
    }

    private func hideMenuAndDismissHighlight() {
      hideMenu()
      dispatchEvent(.dismissHighlight)
    }

    private func showHighlightMenu(_ rect: CGRect) {
      setHighlightMenu()

      // When the highlight menu is displayed we set up gesture recognizers so it
      // can be dismissed if the user interacts with another part of the view.
      // This isn't needed for the default menu as the system will handle that.
      if tapGestureRecognizer == nil {
        let tap = UITapGestureRecognizer(target: self, action: #selector(gestureHandled))
        tap.delegate = self
        addGestureRecognizer(tap)
        tapGestureRecognizer = tap
      }
      if panGestureRecognizer == nil {
        let pan = UIPanGestureRecognizer(target: self, action: #selector(gestureHandled))
        pan.delegate = self
        addGestureRecognizer(pan)
        panGestureRecognizer = pan
      }

      UIMenuController.shared.showMenu(from: self, rect: rect)
    }
  }
#endif

public enum WebViewDispatchEvent {
  case handleFontContrastChange(isHighContrast: Bool)
  case updateLineHeight(height: Int)
  case updateMaxWidthPercentage(maxWidthPercentage: Int)
  case updateFontSize(size: Int)
  case updateColorMode(isDark: Bool)
  case updateFontFamily(family: String)
  case saveAnnotation(annotation: String)
  case annotate
  case highlight
  case share
  case remove
  case copyHighlight
  case dismissHighlight

  var script: String {
    "var event = new Event('\(eventName)');\(scriptPropertyLine)document.dispatchEvent(event);"
  }

  private var eventName: String {
    switch self {
    case .handleFontContrastChange:
      return "handleFontContrastChange"
    case .updateLineHeight:
      return "updateLineHeight"
    case .updateMaxWidthPercentage:
      return "updateMaxWidthPercentage"
    case .updateFontSize:
      return "updateFontSize"
    case .updateColorMode:
      return "updateColorMode"
    case .updateFontFamily:
      return "updateFontFamily"
    case .saveAnnotation:
      return "saveAnnotation"
    case .annotate:
      return "annotate"
    case .highlight:
      return "highlight"
    case .share:
      return "share"
    case .remove:
      return "remove"
    case .copyHighlight:
      return "copyHighlight"
    case .dismissHighlight:
      return "dismissHighlight"
    }
  }

  private var scriptPropertyLine: String {
    switch self {
    case let .handleFontContrastChange(isHighContrast: isHighContrast):
      return "event.fontContrast = '\(isHighContrast ? "high" : "normal")';"
    case let .updateLineHeight(height: height):
      return "event.lineHeight = '\(height)';"
    case let .updateMaxWidthPercentage(maxWidthPercentage: maxWidthPercentage):
      return "event.maxWidthPercentage = '\(maxWidthPercentage)';"
    case let .updateFontSize(size: size):
      return "event.fontSize = '\(size)';"
    case let .updateColorMode(isDark: isDark):
      return "event.isDarkMode = '\(isDark)';"
    case let .updateFontFamily(family: family):
      return "event.fontFamily = '\(family)';"
    case let .saveAnnotation(annotation: annotation):
      return "event.annotation = '\(annotation)';"
    case .annotate, .highlight, .share, .remove, .copyHighlight, .dismissHighlight:
      return ""
    }
  }
}
