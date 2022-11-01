import Models
import Utils
import WebKit

/// Describes actions that can be sent from the WebView back to native views.
/// The names on the javascript side must match for an action to be handled.
public enum WebViewAction: String, CaseIterable {
  case highlightAction
  case readingProgressUpdate
}

enum ContextMenu {
  case defaultMenu
  case highlightMenu
}

public final class OmnivoreWebView: WKWebView {
  #if os(iOS)
    private var panGestureRecognizer: UIPanGestureRecognizer?
    private var tapGestureRecognizer: UITapGestureRecognizer?
  #endif

  private var currentMenu: ContextMenu = .defaultMenu

  override init(frame: CGRect, configuration: WKWebViewConfiguration) {
    super.init(frame: frame, configuration: configuration)

    #if os(iOS)
      initNativeIOSMenus()

      if #available(iOS 16.0, *) {
        self.isFindInteractionEnabled = true
      }
    #endif
  }

  @available(*, unavailable)
  required init?(coder _: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  public func updateTheme() {
    do {
      if let themeName = UserDefaults.standard.value(forKey: UserDefaultKey.themeName.rawValue) as? String {
        try dispatchEvent(.updateTheme(themeName: "Gray" /* themeName */ ))
      }
    } catch {
      showErrorInSnackbar("Error updating theme")
    }
  }

  public func updateFontFamily() {
    do {
      if let fontFamily = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebFont.rawValue) as? String {
        try dispatchEvent(.updateFontFamily(family: fontFamily))
      }
    } catch {
      showErrorInSnackbar("Error updating font")
    }
  }

  public func updateFontSize() {
    do {
      if let fontSize = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebFontSize.rawValue) as? Int {
        try dispatchEvent(.updateFontSize(size: fontSize))
      }
    } catch {
      showErrorInSnackbar("Error updating font")
    }
  }

  public func updateMaxWidthPercentage() {
    if let maxWidthPercentage = UserDefaults.standard.value(
      forKey: UserDefaultKey.preferredWebMaxWidthPercentage.rawValue
    ) as? Int {
      do {
        try dispatchEvent(.updateMaxWidthPercentage(maxWidthPercentage: maxWidthPercentage))
      } catch {
        showErrorInSnackbar("Error updating max width")
      }
    }
  }

  public func updateLineHeight() {
    if let height = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebLineSpacing.rawValue) as? Int {
      do {
        try dispatchEvent(.updateLineHeight(height: height))
      } catch {
        showErrorInSnackbar("Error updating line height")
      }
    }
  }

  public func updateTextContrast() {
    let isHighContrast = UserDefaults.standard.value(
      forKey: UserDefaultKey.prefersHighContrastWebFont.rawValue
    ) as? Bool

    if let isHighContrast = isHighContrast {
      do {
        try dispatchEvent(.handleFontContrastChange(isHighContrast: isHighContrast))
      } catch {
        showErrorInSnackbar("Error updating text contrast")
      }
    }
  }

  public func shareOriginalItem() {
    do {
      try dispatchEvent(.share)
    } catch {
      showErrorInSnackbar("Error updating line height")
    }
  }

  public func dispatchEvent(_ event: WebViewDispatchEvent) throws {
    let script = try event.script
    var errResult: Error?

    evaluateJavaScript(script) { _, err in
      if let err = err {
        print("evaluateJavaScript error", err)
        errResult = err
      }
    }

    if let errResult = errResult {
      throw errResult
    }
  }

  #if os(iOS)
    override public func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
      super.traitCollectionDidChange(previousTraitCollection)
      guard previousTraitCollection?.userInterfaceStyle != traitCollection.userInterfaceStyle else { return }
      do {
        try dispatchEvent(.updateColorMode(isDark: traitCollection.userInterfaceStyle == .dark))
      } catch {
        showErrorInSnackbar("Error updating theme")
      }
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
      currentMenu = .defaultMenu

      if #available(iOS 16.0, *) {
        // on iOS16 we use menuBuilder to create these items
      } else {
        let annotate = UIMenuItem(title: "Annotate", action: #selector(annotateSelection))
        let highlight = UIMenuItem(title: "Highlight", action: #selector(highlightSelection))
        //     let share = UIMenuItem(title: "Share", action: #selector(shareSelection))

        UIMenuController.shared.menuItems = [highlight, /* share, */ annotate]
      }
    }

    private func setHighlightMenu() {
      currentMenu = .highlightMenu

      if #available(iOS 16.0, *) {
        // on iOS16 we use menuBuilder to create these items
      } else {
        // on iOS16 we use menuBuilder to create these items
        currentMenu = .defaultMenu
        let annotate = UIMenuItem(title: "Annotate", action: #selector(annotateSelection))
        let remove = UIMenuItem(title: "Remove", action: #selector(removeSelection))
        //     let share = UIMenuItem(title: "Share", action: #selector(shareSelection))

        UIMenuController.shared.menuItems = [remove, /* share, */ annotate]
      }
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
      case Selector(("_define:")): return true
      case Selector(("_findSelected:")): return true
      default: return false
      }
    }

    @objc private func gestureHandled() {
      hideMenuAndDismissHighlight()
    }

    @objc private func annotateSelection() {
      do {
        try dispatchEvent(.annotate)
      } catch {
        showErrorInSnackbar("Error creating highlight")
      }
      hideMenu()
    }

    @objc private func highlightSelection() {
      do {
        try dispatchEvent(.highlight)
      } catch {
        showErrorInSnackbar("Error creating highlight")
      }
      hideMenu()
    }

    @objc private func shareSelection() {
      do {
        try dispatchEvent(.share)
      } catch {
        showErrorInSnackbar("Error sharing highlight")
      }
      hideMenu()
    }

    @objc private func removeSelection() {
      do {
        try dispatchEvent(.remove)
      } catch {
        showErrorInSnackbar("Error deleting highlight")
      }
      hideMenu()
    }

    @objc override public func copy(_ sender: Any?) {
      super.copy(sender)
      do {
        try dispatchEvent(.copyHighlight)
      } catch {
        showErrorInSnackbar("Error copying highlight")
      }
      hideMenu()
    }

    override public func buildMenu(with builder: UIMenuBuilder) {
      if #available(iOS 16.0, *) {
        let annotate = UICommand(title: "Note", action: #selector(annotateSelection))
        let highlight = UICommand(title: "Highlight", action: #selector(highlightSelection))
        let remove = UICommand(title: "Remove", action: #selector(removeSelection))

        let omnivore = UIMenu(title: "",
                              options: .displayInline,
                              children: currentMenu == .defaultMenu ? [highlight, annotate] : [annotate, remove])
        builder.insertSibling(omnivore, beforeMenu: .lookup)
      }

      super.buildMenu(with: builder)
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
      try? dispatchEvent(.dismissHighlight)
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
  case updateTheme(themeName: String)
  case saveAnnotation(annotation: String)
  case annotate
  case highlight
  case share
  case remove
  case copyHighlight
  case dismissHighlight
  case speakingSection(anchorIdx: String)

  var script: String {
    get throws {
      let propertyLine = try scriptPropertyLine
      return "var event = new Event('\(eventName)');\(propertyLine)document.dispatchEvent(event);"
    }
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
    case .updateTheme:
      return "updateTheme"
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
    case .speakingSection:
      return "speakingSection"
    }
  }

  private var scriptPropertyLine: String {
    get throws {
      switch self {
      case let .handleFontContrastChange(isHighContrast: isHighContrast):
        return "event.fontContrast = '\(isHighContrast ? "high" : "normal")';"
      case let .updateLineHeight(height: height):
        return "event.lineHeight = '\(height)';"
      case let .updateMaxWidthPercentage(maxWidthPercentage: maxWidthPercentage):
        return "event.maxWidthPercentage = '\(maxWidthPercentage)';"
      case let .updateTheme(themeName: themeName):
        return "event.themeName = '\(themeName)';"
      case let .updateFontSize(size: size):
        return "event.fontSize = '\(size)';"
      case let .updateColorMode(isDark: isDark):
        return "event.isDark = '\(isDark)';"
      case let .updateFontFamily(family: family):
        return "event.fontFamily = '\(family)';"
      case let .saveAnnotation(annotation: annotation):
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(annotation) {
          let str = String(decoding: encoded, as: UTF8.self)
          return "event.annotation = '\(str)';"
        } else {
          throw BasicError.message(messageText: "Unable to serialize highlight note.")
        }
      case let .speakingSection(anchorIdx: anchorIdx):
        return "event.anchorIdx = '\(anchorIdx)';"
      case .annotate, .highlight, .share, .remove, .copyHighlight, .dismissHighlight:
        return ""
      }
    }
  }
}
