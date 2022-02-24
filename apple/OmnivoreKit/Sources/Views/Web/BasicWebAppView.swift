import SwiftUI
import WebKit

#if os(iOS)
  public struct BasicWebAppView: UIViewRepresentable {
    let request: URLRequest
    let webView = WKWebView()

    public init(request: URLRequest) {
      self.request = request
    }

    public func makeCoordinator() -> BasicWebAppViewCoordinator {
      BasicWebAppViewCoordinator()
    }

    public func makeUIView(context _: Context) -> WKWebView {
      webView.scrollView.isScrollEnabled = true
      webView.isOpaque = false
      webView.backgroundColor = UIColor.clear
      return webView
    }

    public func updateUIView(_ webView: WKWebView, context: Context) {
      if context.coordinator.needsReload {
        webView.load(request)
        context.coordinator.needsReload = false
      }
    }
  }
#endif

#if os(macOS)
  public struct BasicWebAppView: NSViewRepresentable {
    let request: URLRequest

    public init(request: URLRequest) {
      self.request = request
    }

    public func makeCoordinator() -> BasicWebAppViewCoordinator {
      BasicWebAppViewCoordinator()
    }

    public func makeNSView(context _: Context) -> WKWebView {
      WebView(frame: CGRect.zero)
    }

    public func updateNSView(_ webView: WKWebView, context: Context) {
      if context.coordinator.needsReload {
        webView.load(request)
        context.coordinator.needsReload = false
      }
    }
  }
#endif

public final class BasicWebAppViewCoordinator: NSObject {
  var needsReload = true

  override init() {
    super.init()
  }
}
