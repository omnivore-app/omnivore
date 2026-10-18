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
      if let url = request.url {
        // let themeID = Color.isDarkMode ? "Gray" /* "Sepia" */ : "Charcoal"
        let themeID = Color.isDarkMode ? "Gray" : "LightGray"
        webView.injectCookie(cookieString: "theme=\(themeID); Max-Age=31536000;", url: url)
      }
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
      let webView = OmnivoreWebView(frame: CGRect.zero)
      if let url = request.url {
        // Dark mode is still rendering a white background on mac for some reason.
        // Forcing light mode for now until we figure out a fix
        let themeID = "Charcoal" // NSApp.effectiveAppearance.name == NSAppearance.Name.darkAqua ? "Gray" : "LightGray"
        webView.injectCookie(cookieString: "theme=\(themeID); Max-Age=31536000;", url: url)
      }
      return webView
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

extension WKWebView {
  func injectCookie(cookieString: String?, url: URL) {
    if let cookieString = cookieString {
      for cookie in HTTPCookie.cookies(withResponseHeaderFields: ["Set-Cookie": cookieString], for: url) {
        configuration.websiteDataStore.httpCookieStore.setCookie(cookie) {}
      }
    }
  }
}
