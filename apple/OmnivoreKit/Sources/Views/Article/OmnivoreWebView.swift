import Models
import Utils
import WebKit

// swiftlint:disable file_length

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
    private var menuDisplayed = false
    private var panGestureRecognizer: UIPanGestureRecognizer?
  #endif

  public var tapHandler: (() -> Void)?
  public var explainHandler: ((String) -> Void)?

  private var currentMenu: ContextMenu = .defaultMenu

  private var explainEnabled = false

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
      try dispatchEvent(.updateTheme(themeName: ThemeManager.currentTheme.themeKey))
    } catch {
      showInReaderSnackbar("Error updating theme")
    }
  }

  public func updateFontFamily() {
    do {
      if let fontFamily = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebFont.rawValue) as? String {
        try dispatchEvent(.updateFontFamily(family: fontFamily))
      }
    } catch {
      showInReaderSnackbar("Error updating font")
    }
  }

  public func updateFontSize() {
    do {
      if let fontSize = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebFontSize.rawValue) as? Int {
        try dispatchEvent(.updateFontSize(size: fontSize))
      }
    } catch {
      showInReaderSnackbar("Error updating font")
    }
  }

  public func updateMaxWidthPercentage() {
    if let maxWidthPercentage = UserDefaults.standard.value(
      forKey: UserDefaultKey.preferredWebMaxWidthPercentage.rawValue
    ) as? Int {
      do {
        try dispatchEvent(.updateMaxWidthPercentage(maxWidthPercentage: maxWidthPercentage))
      } catch {
        showInReaderSnackbar("Error updating max width")
      }
    }
  }

  public func updateLineHeight() {
    if let height = UserDefaults.standard.value(forKey: UserDefaultKey.preferredWebLineSpacing.rawValue) as? Int {
      do {
        try dispatchEvent(.updateLineHeight(height: height))
      } catch {
        showInReaderSnackbar("Error updating line height")
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
        showInReaderSnackbar("Error updating text contrast")
      }
    }
  }

  public func updateAutoHighlightMode() {
    let isEnabled = UserDefaults.standard.value(
      forKey: UserDefaultKey.enableHighlightOnRelease.rawValue
    ) as? Bool

    if let isEnabled = isEnabled {
      do {
        try dispatchEvent(.handleAutoHighlightModeChange(isEnabled: isEnabled))
      } catch {
        showInReaderSnackbar("Error updating text contrast")
      }
    }
  }

  public func updateJustifyText() {
    do {
      if let justify = UserDefaults.standard.value(forKey: UserDefaultKey.justifyText.rawValue) as? Bool {
        try dispatchEvent(.updateJustifyText(justify: justify))
      }
    } catch {
      showInReaderSnackbar("Error updating justify-text")
    }
  }

  public func updateTitle(title: String) {
    do {
      try dispatchEvent(.updateTitle(title: title))
    } catch {
      showInReaderSnackbar("Error updating title")
    }
  }

  public func updateLabels(labelsJSON: String) {
    do {
      try dispatchEvent(.updateLabels(labels: labelsJSON))
    } catch {
      showInReaderSnackbar("Error updating labels")
    }
  }

  public func shareOriginalItem() {
    do {
      try dispatchEvent(.share)
    } catch {
      showInReaderSnackbar("Error updating line height")
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
        if ThemeManager.currentTheme == .system {
          try dispatchEvent(.updateTheme(themeName: ThemeManager.currentTheme.themeKey))
        }
      } catch {
        showInReaderSnackbar("Error updating theme due to colormode change")
      }
    }

  #elseif os(macOS)
    override public func viewDidChangeEffectiveAppearance() {
      super.viewDidChangeEffectiveAppearance()
      if ThemeManager.currentTheme == .system {
        try? dispatchEvent(.updateTheme(themeName: ThemeManager.currentTheme.themeKey))
      }
    }
  #endif
  
  // Because all the snackbar stuff lives in app we just use notifications here
  func showInReaderSnackbar(_ message: String) {
    NotificationCenter.default.post(name: Notification.Name("SnackBar"),
                                    object: nil,
                                    userInfo: ["message": message,
                                               "dismissAfter": 2000 as Any])
  }
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

      case "pageTapped":
        if menuDisplayed {
          hideMenuAndDismissHighlight()
          break
        }
        if let tapHandler = self.tapHandler {
          tapHandler()
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
        let highlight = UIMenuItem(title: LocalText.genericHighlight, action: #selector(highlightSelection))
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
        let labels = UIMenuItem(title: LocalText.labelsGeneric, action: #selector(setLabels))

        let remove = UIMenuItem(title: "Remove", action: #selector(removeSelection))
        //     let share = UIMenuItem(title: "Share", action: #selector(shareSelection))

        UIMenuController.shared.menuItems = [remove, labels, annotate]
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

    // swiftlint:disable:next cyclomatic_complexity
    override public func canPerformAction(_ action: Selector, withSender _: Any?) -> Bool {
      switch action {
      case #selector(annotateSelection): return true
      case #selector(highlightSelection): return true
      case #selector(shareSelection): return true
      case #selector(removeSelection): return true
      case #selector(copy(_:)): return true
      case #selector(setLabels(_:)): return true
      case #selector(explainSelection): return true

      case Selector(("_lookup:")): return (currentMenu == .defaultMenu)
      case Selector(("_define:")): return (currentMenu == .defaultMenu)
      case Selector(("_translate:")): return (currentMenu == .defaultMenu)
      case Selector(("_findSelected:")): return (currentMenu == .defaultMenu)

      case Selector(("lookup:")): return (currentMenu == .defaultMenu)
      case Selector(("define:")): return (currentMenu == .defaultMenu)
      case Selector(("translate:")): return (currentMenu == .defaultMenu)
      case Selector(("findSelected:")): return (currentMenu == .defaultMenu)
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
        showInReaderSnackbar("Error creating highlight")
      }
      hideMenu()
    }

    @objc private func highlightSelection() {
      do {
        try dispatchEvent(.highlight)
      } catch {
        showInReaderSnackbar("Error creating highlight")
      }
      hideMenu()
    }

    @objc private func explainSelection() {
      Task {
        let selection = try? await self.evaluateJavaScript("window.getSelection().toString()")
        if let selection = selection as? String, let explainHandler = explainHandler {
          explainHandler(selection)
        } else {
          showInReaderSnackbar("Error getting text to explain")
        }
      }
    }

    @objc private func shareSelection() {
      do {
        try dispatchEvent(.share)
      } catch {
        showInReaderSnackbar("Error sharing highlight")
      }
      hideMenu()
    }

    @objc private func removeSelection() {
      do {
        try dispatchEvent(.remove)
      } catch {
        showInReaderSnackbar("Error deleting highlight")
      }
      hideMenu()
    }

    @objc override public func copy(_ sender: Any?) {
      super.copy(sender)
      do {
        try dispatchEvent(.copyHighlight)
      } catch {
        showInReaderSnackbar("Error copying highlight")
      }
      hideMenu()
    }

    @objc public func setLabels(_: Any?) {
      do {
        try dispatchEvent(.setHighlightLabels)
      } catch {
        showInReaderSnackbar("Error setting labels for highlight")
      }
      hideMenu()
    }

    override public func buildMenu(with builder: UIMenuBuilder) {
      if #available(iOS 16.0, *) {
        let annotate = UICommand(title: "Note", action: #selector(annotateSelection))

        let items: [UIMenuElement]
        if currentMenu == .defaultMenu {
          let autoHighlightEnabled = UserDefaults.standard.value(forKey: UserDefaultKey.enableHighlightOnRelease.rawValue)
          if let autoHighlightEnabled = autoHighlightEnabled as? Bool, autoHighlightEnabled  {
            builder.remove(menu: .standardEdit)
            builder.remove(menu: .lookup)
            builder.remove(menu: .find)
            super.buildMenu(with: builder)
            return
          }
          let highlight = UICommand(title: LocalText.genericHighlight, action: #selector(highlightSelection))
          if explainHandler != nil {
            let explain = UICommand(title: "Explain", action: #selector(explainSelection))
            items = [highlight, explain, annotate]
          } else {
            items = [highlight, annotate]
          }
        } else {
          let remove = UICommand(title: "Remove", action: #selector(removeSelection))
          let setLabels = UICommand(title: LocalText.labelsGeneric, action: #selector(setLabels))
          items = [annotate, setLabels, remove]
        }

        let omnivore = UIMenu(title: "", options: .displayInline, children: items)
        builder.insertSibling(omnivore, afterMenu: .standardEdit)
      }

      super.buildMenu(with: builder)
    }

    private func hideMenu() {
      UIMenuController.shared.hideMenu()
      if let panGestureRecognizer = panGestureRecognizer {
        removeGestureRecognizer(panGestureRecognizer)
        self.panGestureRecognizer = nil
      }
      menuDisplayed = false
      setDefaultMenu()
    }

    private func hideMenuAndDismissHighlight() {
      hideMenu()
      try? dispatchEvent(.dismissHighlight)
    }

    private func showHighlightMenu(_ rect: CGRect) {
      setHighlightMenu()

      if panGestureRecognizer == nil {
        let pan = UIPanGestureRecognizer(target: self, action: #selector(gestureHandled))
        pan.delegate = self
        addGestureRecognizer(pan)
        panGestureRecognizer = pan
      }
      menuDisplayed = true

      UIMenuController.shared.showMenu(from: self, rect: rect)
    }
  }
#endif

public enum WebViewDispatchEvent {
  case handleFontContrastChange(isHighContrast: Bool)
  case handleAutoHighlightModeChange(isEnabled: Bool)
  case updateLineHeight(height: Int)
  case updateMaxWidthPercentage(maxWidthPercentage: Int)
  case updateFontSize(size: Int)
  case updateFontFamily(family: String)
  case updateTheme(themeName: String)
  case updateJustifyText(justify: Bool)
  case saveAnnotation(annotation: String)
  case annotate
  case highlight
  case share
  case remove
  case setHighlightLabels
  case copyHighlight
  case dismissHighlight
  case speakingSection(anchorIdx: String)
  case updateLabels(labels: String)
  case updateTitle(title: String)
  case saveReadPosition

  var script: String {
    // swiftlint:disable:next implicit_getter
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
    case .updateFontFamily:
      return "updateFontFamily"
    case .updateTheme:
      return "updateTheme"
    case .updateJustifyText:
      return "updateJustifyText"
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
    case .setHighlightLabels:
      return "setHighlightLabels"
    case .copyHighlight:
      return "copyHighlight"
    case .dismissHighlight:
      return "dismissHighlight"
    case .speakingSection:
      return "speakingSection"
    case .updateLabels:
      return "updateLabels"
    case .updateTitle:
      return "updateTitle"
    case .handleAutoHighlightModeChange:
      return "handleAutoHighlightModeChange"
    case .saveReadPosition:
      return "saveReadPosition"
    }
  }

  private var scriptPropertyLine: String {
    // swiftlint:disable:next implicit_getter
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
      case let .updateJustifyText(justify: justify):
        return "event.justifyText = \(justify);"
      case let .updateFontFamily(family: family):
        return "event.fontFamily = '\(family)';"
      case let .updateLabels(labels):
        return "event.labels = \(labels);"
      case let .updateTitle(title):
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(title) {
          let str = String(decoding: encoded, as: UTF8.self)
          return "event.title = \(str);"
        } else {
          throw BasicError.message(messageText: "Unable to serialize title.")
        }
      case let .saveAnnotation(annotation: annotation):
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(annotation) {
          let str = String(decoding: encoded, as: UTF8.self)
          return "event.annotation = \(str);"
        } else {
          throw BasicError.message(messageText: "Unable to serialize highlight note.")
        }
      case let .speakingSection(anchorIdx: anchorIdx):
        return "event.anchorIdx = '\(anchorIdx)';"
      case let .handleAutoHighlightModeChange(isEnabled: isEnabled):
        return "event.enableHighlightOnRelease = '\(isEnabled ? "on" : "off")';"
      case .annotate,
           .highlight,
           .setHighlightLabels,
           .share,
           .remove,
           .copyHighlight,
           .dismissHighlight,
           .saveReadPosition:
        return ""
      }
    }
  }
}
