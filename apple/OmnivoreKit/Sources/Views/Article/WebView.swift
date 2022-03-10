import WebKit

/// Describes actions that can be sent from the WebView back to native views.
/// The names on the javascript side must match for an action to be handled.
enum WebViewAction: String, CaseIterable {
  case highlightAction
  case readingProgressUpdate
}

final class WebView: WKWebView {
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

  func increaseFontSize() {
    dispatchEvent("increaseFontSize")
  }

  func decreaseFontSize() {
    dispatchEvent("decreaseFontSize")
  }

  func dispatchEvent(_ name: String) {
    let dispatch = "document.dispatchEvent(new Event('\(name)'));"
    evaluateJavaScript(dispatch) { obj, err in
      if let err = err { print(err) }
      if let obj = obj { print(obj) }
    }
  }

  #if os(iOS)
    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
      super.traitCollectionDidChange(previousTraitCollection)
      guard previousTraitCollection?.userInterfaceStyle != traitCollection.userInterfaceStyle else { return }

      if traitCollection.userInterfaceStyle == .dark {
        dispatchEvent("switchToDarkMode")
      } else {
        dispatchEvent("switchToLightMode")
      }
    }

  #elseif os(macOS)
    override func viewDidChangeEffectiveAppearance() {
      super.viewDidChangeEffectiveAppearance()
      switch effectiveAppearance.bestMatch(from: [.aqua, .darkAqua]) {
      case .some(.darkAqua):
        dispatchEvent("switchToDarkMode")
      default:
        dispatchEvent("switchToLightMode")
      }
    }
  #endif
}

#if os(iOS)
  extension WebView: UIGestureRecognizerDelegate, WKScriptMessageHandler {
    func initNativeIOSMenus() {
      isUserInteractionEnabled = true

      NotificationCenter.default
        .addObserver(self,
                     selector: #selector(menuDidHide),
                     name: UIMenuController.didHideMenuNotification,
                     object: nil)

      setDefaultMenu()
    }

    func userContentController(_: WKUserContentController, didReceive message: WKScriptMessage) {
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

    override var canBecomeFirstResponder: Bool {
      true
    }

    @objc func menuDidHide() {
      setDefaultMenu()
    }

    func gestureRecognizer(_: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith _: UIGestureRecognizer) -> Bool {
      true
    }

    override func canPerformAction(_ action: Selector, withSender _: Any?) -> Bool {
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
      dispatchEvent("annotate")
      hideMenu()
    }

    @objc private func highlightSelection() {
      dispatchEvent("highlight")
      hideMenu()
    }

    @objc private func shareSelection() {
      dispatchEvent("share")
      hideMenu()
    }

    @objc private func removeSelection() {
      dispatchEvent("remove")
      hideMenu()
    }

    @objc override func copy(_ sender: Any?) {
      super.copy(sender)
      dispatchEvent("copyHighlight")
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
      dispatchEvent("dismissHighlight")
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

    func saveAnnotation(annotation: String) {
      // swiftlint:disable:next line_length
      let dispatch = "var event = new Event('saveAnnotation');event.annotation = '\(annotation)';document.dispatchEvent(event);"
      evaluateJavaScript(dispatch) { obj, err in
        if let err = err { print(err) }
        if let obj = obj { print(obj) }
      }
    }
  }
#endif
