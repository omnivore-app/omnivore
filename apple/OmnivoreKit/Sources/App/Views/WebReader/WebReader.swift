import Models
import SwiftUI
import Utils
import Views
import WebKit

struct WebReader: PlatformViewRepresentable {
  let item: LinkedItem
  let articleContent: ArticleContent
  let openLinkAction: (URL) -> Void
  let webViewActionHandler: (WKScriptMessage, WKScriptMessageReplyHandler?) -> Void
  let navBarVisibilityRatioUpdater: (Double) -> Void

  @Binding var updateFontFamilyActionID: UUID?
  @Binding var updateFontActionID: UUID?
  @Binding var updateTextContrastActionID: UUID?
  @Binding var updateMaxWidthActionID: UUID?
  @Binding var updateLineHeightActionID: UUID?
  @Binding var annotationSaveTransactionID: UUID?
  @Binding var showNavBarActionID: UUID?
  @Binding var shareActionID: UUID?
  @Binding var annotation: String

  func makeCoordinator() -> WebReaderCoordinator {
    WebReaderCoordinator()
  }

  func fontSize() -> Int {
    let storedSize = UserDefaults.standard.integer(forKey: UserDefaultKey.preferredWebFontSize.rawValue)
    #if os(iOS)
      return storedSize <= 1 ? UITraitCollection.current.preferredWebFontSize : storedSize
    #else
      return storedSize <= 1 ? Int(NSFont.userFont(ofSize: 16)?.pointSize ?? 16) : storedSize
    #endif
  }

  func lineHeight() -> Int {
    let storedSize = UserDefaults.standard.integer(forKey: UserDefaultKey.preferredWebLineSpacing.rawValue)
    return storedSize <= 1 ? 150 : storedSize
  }

  func maxWidthPercentage() -> Int {
    let storedSize = UserDefaults.standard.integer(forKey: UserDefaultKey.preferredWebMaxWidthPercentage.rawValue)
    return storedSize <= 1 ? 100 : storedSize
  }

  private func makePlatformView(context: Context) -> WKWebView {
    let webView = WebViewManager.shared()
    let contentController = WKUserContentController()

    webView.navigationDelegate = context.coordinator
    webView.configuration.userContentController = contentController
    webView.configuration.userContentController.removeAllScriptMessageHandlers()

    #if os(iOS)
      webView.isOpaque = false
      webView.backgroundColor = .clear
      webView.scrollView.delegate = context.coordinator
      webView.scrollView.contentInset.top = readerViewNavBarHeight
      webView.scrollView.verticalScrollIndicatorInsets.top = readerViewNavBarHeight
      webView.configuration.userContentController.add(webView, name: "viewerAction")
    #else
      webView.setValue(false, forKey: "drawsBackground")
    #endif

    for action in WebViewAction.allCases {
      webView.configuration.userContentController.add(context.coordinator, name: action.rawValue)
    }

    webView.configuration.userContentController.addScriptMessageHandler(
      context.coordinator, contentWorld: .page, name: "articleAction"
    )

    context.coordinator.linkHandler = openLinkAction
    context.coordinator.webViewActionHandler = webViewActionHandler
    context.coordinator.updateNavBarVisibilityRatio = navBarVisibilityRatioUpdater
    loadContent(webView: webView)

    return webView
  }

  // swiftlint:disable:next cyclomatic_complexity
  private func updatePlatformView(_ webView: WKWebView, context: Context) {
    if annotationSaveTransactionID != context.coordinator.lastSavedAnnotationID {
      context.coordinator.lastSavedAnnotationID = annotationSaveTransactionID
      (webView as? OmnivoreWebView)?.dispatchEvent(.saveAnnotation(annotation: annotation))
    }

    if updateFontFamilyActionID != context.coordinator.previousUpdateFontFamilyActionID {
      context.coordinator.previousUpdateFontFamilyActionID = updateFontFamilyActionID
      (webView as? OmnivoreWebView)?.updateFontFamily()
    }

    if updateFontActionID != context.coordinator.previousUpdateFontActionID {
      context.coordinator.previousUpdateFontActionID = updateFontActionID
      (webView as? OmnivoreWebView)?.updateFontSize()
    }

    if updateTextContrastActionID != context.coordinator.previousUpdateTextContrastActionID {
      context.coordinator.previousUpdateTextContrastActionID = updateTextContrastActionID
      (webView as? OmnivoreWebView)?.updateTextContrast()
    }

    if updateMaxWidthActionID != context.coordinator.previousUpdateMaxWidthActionID {
      context.coordinator.previousUpdateMaxWidthActionID = updateMaxWidthActionID
      (webView as? OmnivoreWebView)?.updateMaxWidthPercentage()
    }

    if updateLineHeightActionID != context.coordinator.previousUpdateLineHeightActionID {
      context.coordinator.previousUpdateLineHeightActionID = updateLineHeightActionID
      (webView as? OmnivoreWebView)?.updateLineHeight()
    }

    if showNavBarActionID != context.coordinator.previousShowNavBarActionID {
      context.coordinator.previousShowNavBarActionID = showNavBarActionID
      context.coordinator.showNavBar()
    }

    if shareActionID != context.coordinator.previousShareActionID {
      context.coordinator.previousShareActionID = shareActionID
      (webView as? OmnivoreWebView)?.shareOriginalItem()
    }

    // If the webview had been terminated `needsReload` will have been set to true
    if context.coordinator.needsReload {
      loadContent(webView: webView)
      context.coordinator.needsReload = false
      return
    }

    if webView.isLoading { return }

    // If the root element is not detected then `WKWebView` may have unloaded the content
    // so we need to load it again.
    webView.evaluateJavaScript("document.getElementById('root') ? true : false") { hasRootElement, _ in
      guard let hasRootElement = hasRootElement as? Bool else { return }

      if !hasRootElement {
        DispatchQueue.main.async {
          loadContent(webView: webView)
        }
      }
    }
  }

  private func loadContent(webView: WKWebView) {
    let fontFamilyValue = UserDefaults.standard.string(forKey: UserDefaultKey.preferredWebFont.rawValue)

    let prefersHighContrastText: Bool = {
      let key = UserDefaultKey.prefersHighContrastWebFont.rawValue
      if UserDefaults.standard.object(forKey: key) != nil {
        return UserDefaults.standard.bool(forKey: key)
      } else {
        return true
      }
    }()

    let fontFamily = fontFamilyValue.flatMap { WebFont(rawValue: $0) } ?? .system

    let htmlString = WebReaderContent(
      item: item,
      articleContent: articleContent,
      isDark: isDarkMode,
      fontSize: fontSize(),
      lineHeight: lineHeight(),
      maxWidthPercentage: maxWidthPercentage(),
      fontFamily: fontFamily,
      prefersHighContrastText: prefersHighContrastText
    )
    .styledContent

    webView.loadHTMLString(htmlString, baseURL: ViewsPackage.resourceURL)
  }

  var isDarkMode: Bool {
    #if os(iOS)
      UITraitCollection.current.userInterfaceStyle == .dark
    #else
      NSApp.effectiveAppearance.name == NSAppearance.Name.darkAqua
    #endif
  }
}

#if os(iOS)
  extension WebReader {
    func makeUIView(context: Context) -> WKWebView {
      makePlatformView(context: context)
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
      updatePlatformView(webView, context: context)
    }
  }
#else
  extension WebReader {
    func makeNSView(context: Context) -> WKWebView {
      makePlatformView(context: context)
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
      updatePlatformView(webView, context: context)
    }
  }
#endif
