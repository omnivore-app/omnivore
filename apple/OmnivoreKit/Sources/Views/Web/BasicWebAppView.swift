import SwiftUI
import WebKit

#if os(iOS)
  struct BasicWebAppView: UIViewRepresentable {
    let request: URLRequest
    let webView = WKWebView()

    func makeCoordinator() -> BasicWebAppViewCoordinator {
      BasicWebAppViewCoordinator()
    }

    func makeUIView(context _: Context) -> WKWebView {
      webView.scrollView.isScrollEnabled = true
      webView.isOpaque = false
      webView.backgroundColor = UIColor.clear
      return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
      if context.coordinator.needsReload {
        webView.load(request)
        context.coordinator.needsReload = false
      }
    }
  }
#endif

#if os(macOS)
  struct BasicWebAppView: NSViewRepresentable {
    let request: URLRequest

    func makeCoordinator() -> BasicWebAppViewCoordinator {
      BasicWebAppViewCoordinator()
    }

    func makeNSView(context _: Context) -> WKWebView {
      WebView(frame: CGRect.zero)
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
      if context.coordinator.needsReload {
        webView.load(request)
        context.coordinator.needsReload = false
      }
    }
  }
#endif

final class BasicWebAppViewCoordinator: NSObject {
  var needsReload = true

  override init() {
    super.init()
  }
}
