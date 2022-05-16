import Models
import Services
import SwiftUI
#if os(iOS)
  import UIKit
#endif
import Utils
import Views
import WebKit

typealias WKScriptMessageReplyHandler = (Any?, String?) -> Void

final class WebReaderCoordinator: NSObject {
  var webViewActionHandler: (WKScriptMessage, WKScriptMessageReplyHandler?) -> Void = { _, _ in }
  var linkHandler: (URL) -> Void = { _ in }
  var needsReload = false
  var lastSavedAnnotationID: UUID?
  var previousIncreaseFontActionID: UUID?
  var previousDecreaseFontActionID: UUID?
  var previousShowNavBarActionID: UUID?
  var previousShareActionID: UUID?
  var updateNavBarVisibilityRatio: (Double) -> Void = { _ in }
  private var yOffsetAtStartOfDrag: Double?
  private var lastYOffset: Double = 0
  private var hasDragged = false
  private var isNavBarHidden = false

  override init() {
    super.init()
  }

  var navBarVisibilityRatio: Double = 1.0 {
    didSet {
      isNavBarHidden = navBarVisibilityRatio == 0
      updateNavBarVisibilityRatio(navBarVisibilityRatio)
    }
  }

  func showNavBar() {
    isNavBarHidden = false
  }
}

extension WebReaderCoordinator: WKScriptMessageHandler {
  func userContentController(_: WKUserContentController, didReceive message: WKScriptMessage) {
    webViewActionHandler(message, nil)
  }
}

extension WebReaderCoordinator: WKScriptMessageHandlerWithReply {
  func userContentController(
    _: WKUserContentController,
    didReceive message: WKScriptMessage,
    replyHandler: @escaping (Any?, String?) -> Void
  ) {
    webViewActionHandler(message, replyHandler)
  }
}

extension WebReaderCoordinator: WKNavigationDelegate {
  // swiftlint:disable:next line_length
  func webView(_: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    if navigationAction.navigationType == .linkActivated {
      if let linkURL = navigationAction.request.url {
        linkHandler(linkURL)
      }
      decisionHandler(.cancel)
    } else {
      decisionHandler(.allow)
    }
  }

  func webView(_ webView: WKWebView, didFinish _: WKNavigation!) {
    #if os(iOS)
      webView.isOpaque = true
      webView.backgroundColor = .systemBackground
    #endif
  }

  func webViewWebContentProcessDidTerminate(_: WKWebView) {
    needsReload = true
  }
}

#if os(iOS)
  extension WebReaderCoordinator: UIScrollViewDelegate {
    func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
      hasDragged = true
      yOffsetAtStartOfDrag = scrollView.contentOffset.y + scrollView.contentInset.top
    }

    func scrollViewDidScroll(_ scrollView: UIScrollView) {
      guard hasDragged else { return }

      let yOffset = scrollView.contentOffset.y

      if yOffset == 0 {
        scrollView.contentInset.top = readerViewNavBarHeight
        navBarVisibilityRatio = 1
        return
      }

      if yOffset < 0 {
        navBarVisibilityRatio = 1
        scrollView.contentInset.top = readerViewNavBarHeight
        return
      }

      if yOffset < readerViewNavBarHeight {
        let isScrollingUp = yOffsetAtStartOfDrag ?? 0 > yOffset
        navBarVisibilityRatio = isScrollingUp || yOffset < 0 ? 1 : min(1, 1 - (yOffset / readerViewNavBarHeight))
        scrollView.contentInset.top = navBarVisibilityRatio * readerViewNavBarHeight
        return
      }

      guard let yOffsetAtStartOfDrag = yOffsetAtStartOfDrag else { return }

      if yOffset > yOffsetAtStartOfDrag, !isNavBarHidden {
        let translation = yOffset - yOffsetAtStartOfDrag
        let ratio = translation < readerViewNavBarHeight ? 1 - (translation / readerViewNavBarHeight) : 0
        navBarVisibilityRatio = min(ratio, 1)
        scrollView.contentInset.top = navBarVisibilityRatio * readerViewNavBarHeight
      }
    }

    func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
      if decelerate, scrollView.contentOffset.y + scrollView.contentInset.top < (yOffsetAtStartOfDrag ?? 0) {
        scrollView.contentInset.top = readerViewNavBarHeight
        navBarVisibilityRatio = 1
      }
    }

    func scrollViewShouldScrollToTop(_ scrollView: UIScrollView) -> Bool {
      scrollView.contentInset.top = readerViewNavBarHeight
      navBarVisibilityRatio = 1
      return false
    }
  }
#endif
