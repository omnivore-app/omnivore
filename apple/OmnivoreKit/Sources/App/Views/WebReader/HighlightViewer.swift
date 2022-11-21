import Models
import SwiftUI
import Utils
import Views
import WebKit

struct HighlightViewer: PlatformViewRepresentable {
  let highlightData: HighlightData

  func makeCoordinator() -> WebReaderCoordinator {
    WebReaderCoordinator()
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

    loadContent(webView: webView)

    return webView
  }

  private func updatePlatformView(_: WKWebView, context _: Context) {
    // If the webview had been terminated `needsReload` will have been set to true
    // Or if the articleContent value has changed then it's id will be different from the coordinator's
//    if context.coordinator.needsReload {
//      loadContent(webView: webView)
//      context.coordinator.needsReload = false
//      return
//    }
  }

  private func loadContent(webView: WKWebView) {
    let themeKey = ThemeManager.currentThemeName
    let content = """
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
          <style>
            @import url("highlight\(themeKey == "Gray" ? "-dark" : "").css");
          </style>
      </head>
      <body>
        <div id="root" />
        <div id='_omnivore-highlight' class="highlight">
          \(highlightData.highlightHTML)
        </div>
      </body>
    </html>
    """

    webView.loadHTMLString(content, baseURL: ViewsPackage.resourceURL)
  }
}

#if os(iOS)
  extension HighlightViewer {
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
