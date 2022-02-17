import Models
import SwiftUI
import Utils
import WebKit

#if os(iOS)
  struct WebAppView: UIViewRepresentable {
    let request: URLRequest
    let baseURL: URL
    let rawAuthCookie: String?
    let openLinkAction: (URL) -> Void
    let webViewActionHandler: (WKScriptMessage) -> Void
    let navBarVisibilityRatioUpdater: (Double) -> Void
    @Binding var annotation: String
    @Binding var annotationSaveTransactionID: UUID?
    @Binding var sendIncreaseFontSignal: Bool
    @Binding var sendDecreaseFontSignal: Bool

    func makeCoordinator() -> WebAppViewCoordinator {
      WebAppViewCoordinator()
    }

    func fontSize() -> Int {
      let storedSize = UserDefaults.standard.integer(forKey: "preferredWebFontSize")
      return storedSize <= 1 ? UITraitCollection.current.preferredWebFontSize : storedSize
    }

    func makeUIView(context: Context) -> WKWebView {
      let webView = WebView(frame: CGRect.zero)
      let contentController = WKUserContentController()

      webView.scrollView.contentInset.top = LinkItemDetailView.navBarHeight
      webView.navigationDelegate = context.coordinator
      webView.isOpaque = false
      webView.backgroundColor = UIColor.clear
      webView.configuration.userContentController = contentController
      webView.scrollView.delegate = context.coordinator

      for action in WebViewAction.allCases {
        webView.configuration.userContentController.add(context.coordinator, name: action.rawValue)
      }

      webView.configuration.userContentController.add(webView, name: "viewerAction")

      webView.configureForOmnivoreAppEmbed(
        config: WebViewConfig(
          url: baseURL,
          themeId: UITraitCollection.current.userInterfaceStyle == .dark ? "Gray" : "LightGray",
          margin: 0,
          fontSize: fontSize(),
          fontFamily: "inter",
          rawAuthCookie: rawAuthCookie
        )
      )

      context.coordinator.linkHandler = openLinkAction
      context.coordinator.webViewActionHandler = webViewActionHandler
      context.coordinator.updateNavBarVisibilityRatio = navBarVisibilityRatioUpdater

      return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
      if context.coordinator.needsReload {
        webView.load(request)
        context.coordinator.needsReload = false
      }

      if annotationSaveTransactionID != context.coordinator.lastSavedAnnotationID {
        context.coordinator.lastSavedAnnotationID = annotationSaveTransactionID
        (webView as? WebView)?.saveAnnotation(annotation: annotation)
      }

      if sendIncreaseFontSignal {
        sendIncreaseFontSignal = false
        (webView as? WebView)?.increaseFontSize()
      }

      if sendDecreaseFontSignal {
        sendDecreaseFontSignal = false
        (webView as? WebView)?.decreaseFontSize()
      }
    }
  }
#endif

#if os(macOS)
  struct WebAppView: NSViewRepresentable {
    let request: URLRequest
    let baseURL: URL
    let rawAuthCookie: String?
    let openLinkAction: (URL) -> Void
    let webViewActionHandler: (WKScriptMessage) -> Void
    @Binding var annotation: String
    @Binding var annotationSaveTransactionID: UUID?
    @Binding var sendIncreaseFontSignal: Bool
    @Binding var sendDecreaseFontSignal: Bool

    func makeCoordinator() -> WebAppViewCoordinator {
      WebAppViewCoordinator()
    }

    func fontSize() -> Int {
      let storedSize = UserDefaults.standard.integer(forKey: "preferredWebFontSize")
      return storedSize <= 1 ? Int(NSFont.userFont(ofSize: 16)?.pointSize ?? 16) : storedSize
    }

    func makeNSView(context: Context) -> WKWebView {
      let contentController = WKUserContentController()
      let webView = WebView(frame: CGRect.zero)

      webView.navigationDelegate = context.coordinator
      webView.configuration.userContentController = contentController
      webView.setValue(false, forKey: "drawsBackground")

      for action in WebViewAction.allCases {
        webView.configuration.userContentController.add(context.coordinator, name: action.rawValue)
      }

      webView.configureForOmnivoreAppEmbed(
        config: WebViewConfig(
          url: baseURL,
          themeId: NSApp.effectiveAppearance.name == NSAppearance.Name.darkAqua ? "Gray" : "LightGray",
          margin: 0,
          fontSize: fontSize(),
          fontFamily: "inter", // TODO: allow user to change this and save to user defaults
          rawAuthCookie: rawAuthCookie
        )
      )

      context.coordinator.linkHandler = openLinkAction
      context.coordinator.webViewActionHandler = webViewActionHandler

      return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
      if context.coordinator.needsReload {
        webView.load(request)
        context.coordinator.needsReload = false
      }

      if sendIncreaseFontSignal {
        sendIncreaseFontSignal = false
        (webView as? WebView)?.increaseFontSize()
      }

      if sendDecreaseFontSignal {
        sendDecreaseFontSignal = false
        (webView as? WebView)?.decreaseFontSize()
      }
    }
  }
#endif
