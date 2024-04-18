import Models
import SwiftUI
import Utils
import Views
import WebKit

@MainActor
struct WebReader: PlatformViewRepresentable {
  let item: Models.LibraryItem
  let viewModel: WebReaderViewModel
  let articleContent: ArticleContent
  let openLinkAction: (URL) -> Void
  let tapHandler: () -> Void
  let explainHandler: ((String) -> Void)?
  let scrollPercentHandler: (Int) -> Void
  let webViewActionHandler: (WKScriptMessage, WKScriptMessageReplyHandler?) -> Void
  let navBarVisibilityUpdater: (Bool) -> Void

  @Binding var readerSettingsChangedTransactionID: UUID?
  @Binding var annotationSaveTransactionID: UUID?
  @Binding var showNavBarActionID: UUID?
  @Binding var shareActionID: UUID?
  @Binding var annotation: String
  @Binding var showBottomBar: Bool
  @Binding var showHighlightAnnotationModal: Bool

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

    webView.tapHandler = tapHandler
    webView.explainHandler = explainHandler
    webView.navigationDelegate = context.coordinator
    webView.configuration.userContentController = contentController
    webView.configuration.userContentController.removeAllScriptMessageHandlers()

    #if os(iOS)
      webView.isOpaque = false
      webView.tintColor = UIColor(ThemeManager.currentHighlightColor)
      webView.backgroundColor = UIColor(ThemeManager.currentBgColor)
      webView.underPageBackgroundColor = UIColor(ThemeManager.currentBgColor)
      webView.scrollView.backgroundColor = UIColor(ThemeManager.currentBgColor)
      webView.scrollView.delegate = context.coordinator
      webView.scrollView.contentInset.top = readerViewNavBarHeight
      webView.scrollView.verticalScrollIndicatorInsets.top = readerViewNavBarHeight
      webView.configuration.userContentController.add(webView, name: "viewerAction")

      if #available(iOS 15.4, *) {
        webView.configuration.preferences.isElementFullscreenEnabled = true
      }

      webView.scrollView.indicatorStyle = ThemeManager.currentTheme.isDark ?
        UIScrollView.IndicatorStyle.white :
        UIScrollView.IndicatorStyle.black
    #else
      webView.setValue(false, forKey: "drawsBackground")
    #endif

    #if DEBUG
      if #available(iOS 16.4, *) {
        webView.isInspectable = true
      }
    #endif

    for action in WebViewAction.allCases {
      webView.configuration.userContentController.add(context.coordinator, name: action.rawValue)
    }

    webView.configuration.userContentController.addScriptMessageHandler(
      context.coordinator, contentWorld: .page, name: "articleAction"
    )

    context.coordinator.linkHandler = openLinkAction
    context.coordinator.webViewActionHandler = webViewActionHandler
    context.coordinator.updateNavBarVisibility = navBarVisibilityUpdater
    context.coordinator.scrollPercentHandler = scrollPercentHandler
    context.coordinator.updateShowBottomBar = { newValue in
      self.showBottomBar = newValue
    }

    context.coordinator.articleContentID = articleContent.id
    loadContent(webView: webView)

    return webView
  }

  private func updatePlatformView(_ webView: WKWebView, context: Context) {
    if annotationSaveTransactionID != context.coordinator.lastSavedAnnotationID {
      context.coordinator.lastSavedAnnotationID = annotationSaveTransactionID
      do {
        try (webView as? OmnivoreWebView)?.dispatchEvent(.saveAnnotation(annotation: annotation))
      } catch {
        Snackbar.show(message: "Error saving note.", dismissAfter: 2000)
      }
    }

    if readerSettingsChangedTransactionID != context.coordinator.previousReaderSettingsChangedUUID {
      context.coordinator.previousReaderSettingsChangedUUID = readerSettingsChangedTransactionID
      (webView as? OmnivoreWebView)?.updateTheme()
      (webView as? OmnivoreWebView)?.updateFontFamily()
      (webView as? OmnivoreWebView)?.updateFontSize()
      (webView as? OmnivoreWebView)?.updateTextContrast()
      (webView as? OmnivoreWebView)?.updateAutoHighlightMode()
      (webView as? OmnivoreWebView)?.updateMaxWidthPercentage()
      (webView as? OmnivoreWebView)?.updateLineHeight()
      (webView as? OmnivoreWebView)?.updateLabels(labelsJSON: item.labelsJSONString)
      (webView as? OmnivoreWebView)?.updateTitle(title: item.title ?? "")
      (webView as? OmnivoreWebView)?.updateJustifyText()

      #if os(iOS)
        webView.backgroundColor = UIColor(ThemeManager.currentBgColor)
        webView.tintColor = UIColor(ThemeManager.currentHighlightColor)
        webView.underPageBackgroundColor = UIColor(ThemeManager.currentBgColor)
        webView.scrollView.backgroundColor = UIColor(ThemeManager.currentBgColor)
        webView.scrollView.indicatorStyle = ThemeManager.currentTheme.isDark ?
          UIScrollView.IndicatorStyle.white :
          UIScrollView.IndicatorStyle.black
      #endif
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
    // Or if the articleContent value has changed then it's id will be different from the coordinator's
    if context.coordinator.needsReload || context.coordinator.articleContentID != articleContent.id {
      loadContent(webView: webView)
      context.coordinator.articleContentID = articleContent.id
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

    let enableHighlightOnRelease: Bool = {
      let key = UserDefaultKey.enableHighlightOnRelease.rawValue
      if UserDefaults.standard.object(forKey: key) != nil {
        return UserDefaults.standard.bool(forKey: key)
      } else {
        return false
      }
    }()

    let justifyText: Bool = {
      let key = UserDefaultKey.justifyText.rawValue
      if UserDefaults.standard.object(forKey: key) != nil {
        return UserDefaults.standard.bool(forKey: key)
      } else {
        return false
      }
    }()

    let fontFamily = fontFamilyValue.flatMap { WebFont(rawValue: $0) } ?? .atkinsonHyperlegible

    let htmlString = WebReaderContent(
      item: item,
      articleContent: articleContent,
      isDark: Color.isDarkMode,
      fontSize: fontSize(),
      lineHeight: lineHeight(),
      maxWidthPercentage: maxWidthPercentage(),
      fontFamily: fontFamily,
      prefersHighContrastText: prefersHighContrastText,
      enableHighlightOnRelease: enableHighlightOnRelease,
      justifyText: justifyText
    )
    .styledContent

    webView.loadHTMLString(htmlString, baseURL: ViewsPackage.resourceURL)
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
