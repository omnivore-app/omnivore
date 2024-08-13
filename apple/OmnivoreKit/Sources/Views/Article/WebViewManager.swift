import Models
import SwiftUI
import Utils
import WebKit

public let readerViewNavBarHeight = 50.0

enum WebViewConfigurationManager {
  private static let processPool = WKProcessPool()
  static func create() -> WKWebViewConfiguration {
    let config = WKWebViewConfiguration()
    config.processPool = processPool
    #if os(iOS)
      config.allowsInlineMediaPlayback = true
    #endif
    config.mediaTypesRequiringUserActionForPlayback = .audio
    return config
  }
}

public enum WebViewManager {
  public static let sharedView = create()
  public static func shared() -> OmnivoreWebView {
    sharedView
  }

  public static func create() -> OmnivoreWebView {
    OmnivoreWebView(frame: CGRect.zero, configuration: WebViewConfigurationManager.create())
  }
}
