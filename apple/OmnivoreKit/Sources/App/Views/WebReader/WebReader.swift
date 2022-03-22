import Models
import SwiftUI
import Utils
import Views
import WebKit

struct WebReader: UIViewRepresentable {
  let articleContent: ArticleContent
  let item: FeedItem
  let openLinkAction: (URL) -> Void
  let webViewActionHandler: (WKScriptMessage) -> Void
  let navBarVisibilityRatioUpdater: (Double) -> Void
  let authToken: String
  let appEnv: AppEnvironment

  @Binding var increaseFontActionID: UUID?
  @Binding var decreaseFontActionID: UUID?
  @Binding var annotationSaveTransactionID: UUID?
  @Binding var annotation: String

  func makeCoordinator() -> WebReaderCoordinator {
    WebReaderCoordinator()
  }

  func fontSize() -> Int {
    let storedSize = UserDefaults.standard.integer(forKey: UserDefaultKey.preferredWebFontSize.rawValue)
    return storedSize <= 1 ? UITraitCollection.current.preferredWebFontSize : storedSize
  }

  func makeUIView(context: Context) -> WKWebView {
    let webView = WebViewManager.shared()
    let contentController = WKUserContentController()

    webView.loadHTMLString(
      WebReaderContent(
        articleContent: articleContent,
        item: item,
        authToken: authToken,
        isDark: UITraitCollection.current.userInterfaceStyle == .dark,
        fontSize: fontSize(),
        appEnv: appEnv
      )
      .styledContent,
      baseURL: ViewsPackage.bundleURL
    )

    webView.navigationDelegate = context.coordinator
    webView.isOpaque = false
    webView.backgroundColor = .clear
    webView.configuration.userContentController = contentController
    webView.scrollView.delegate = context.coordinator
    webView.scrollView.contentInset.top = readerViewNavBarHeight
    webView.scrollView.verticalScrollIndicatorInsets.top = readerViewNavBarHeight

    webView.configuration.userContentController.removeAllScriptMessageHandlers()

    for action in WebViewAction.allCases {
      webView.configuration.userContentController.add(context.coordinator, name: action.rawValue)
    }

    webView.configuration.userContentController.add(webView, name: "viewerAction")

    webView.configuration.userContentController.addScriptMessageHandler(context.coordinator, contentWorld: .page, name: "articleAction")

    context.coordinator.linkHandler = openLinkAction
    context.coordinator.webViewActionHandler = webViewActionHandler
    context.coordinator.updateNavBarVisibilityRatio = navBarVisibilityRatioUpdater

    return webView
  }

  func updateUIView(_ webView: WKWebView, context: Context) {
    if annotationSaveTransactionID != context.coordinator.lastSavedAnnotationID {
      context.coordinator.lastSavedAnnotationID = annotationSaveTransactionID
      (webView as? WebView)?.saveAnnotation(annotation: annotation)
    }

    if increaseFontActionID != context.coordinator.previousIncreaseFontActionID {
      context.coordinator.previousIncreaseFontActionID = increaseFontActionID
      (webView as? WebView)?.increaseFontSize()
    }

    if decreaseFontActionID != context.coordinator.previousDecreaseFontActionID {
      context.coordinator.previousDecreaseFontActionID = decreaseFontActionID
      (webView as? WebView)?.decreaseFontSize()
    }
  }
}
