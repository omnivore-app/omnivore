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
  var scrollPercentHandler: ((Int) -> Void) = { _ in }
  var needsReload = false
  var lastSavedAnnotationID: UUID?
  var previousReaderSettingsChangedUUID: UUID?
  var previousShowNavBarActionID: UUID?
  var previousShareActionID: UUID?
  var updateNavBarVisibility: (Bool) -> Void = { _ in }
  var updateShowBottomBar: (Bool) -> Void = { _ in }
  var articleContentID = UUID()
  private var yOffsetAtStartOfDrag: Double?
  private var lastYOffset: Double = 0
  private var hasDragged = false
  private var isNavBarHidden = false

  override init() {
    super.init()
  }

  var navBarVisible: Bool = true {
    didSet {
      isNavBarHidden = !navBarVisible
      updateNavBarVisibility(navBarVisible)
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
      if let linkURL = navigationAction.request.url, !linkURL.isFileURL {
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
        navBarVisible = true
        return
      }

      if yOffset < 0 {
        navBarVisible = true
        scrollView.contentInset.top = readerViewNavBarHeight
        return
      }

      if yOffset < readerViewNavBarHeight {
        let isScrollingUp = yOffsetAtStartOfDrag ?? 0 > yOffset
        navBarVisible = isScrollingUp || yOffset < 0
        scrollView.contentInset.top = navBarVisible ? readerViewNavBarHeight : 0
        return
      }

      guard let yOffsetAtStartOfDrag = yOffsetAtStartOfDrag else { return }

      if yOffset > yOffsetAtStartOfDrag, !isNavBarHidden {
        navBarVisible = false
        scrollView.contentInset.top = navBarVisible ? readerViewNavBarHeight : 0
      }

      // if at bottom show the controls
      if yOffset + scrollView.visibleSize.height > scrollView.contentSize.height - 140 {
        updateShowBottomBar(true)
      } else {
        updateShowBottomBar(false)
      }

      let percent = Int(((yOffset + scrollView.visibleSize.height) / scrollView.contentSize.height) * 100)
      scrollPercentHandler(max(0, min(percent, 100)))
    }

    func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
      if decelerate, scrollView.contentOffset.y + scrollView.contentInset.top < (yOffsetAtStartOfDrag ?? 0) {
        scrollView.contentInset.top = readerViewNavBarHeight
        navBarVisible = true
      }
    }

    func scrollViewShouldScrollToTop(_ scrollView: UIScrollView) -> Bool {
      scrollView.contentInset.top = readerViewNavBarHeight
      let isVisible = navBarVisible
      navBarVisible = true
      return isVisible
    }
  }
#endif
