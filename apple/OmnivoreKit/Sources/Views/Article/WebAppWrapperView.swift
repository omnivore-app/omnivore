import Combine
import SafariServices
import SwiftUI
import WebKit

public final class WebAppWrapperViewModel: ObservableObject {
  public enum Action {
    case shareHighlight(highlightID: String)
    case updateReadingProgess(progress: Int)
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()
  let webViewURLRequest: URLRequest
  let baseURL: URL
  let rawAuthCookie: String?

  @Published public var sendIncreaseFontSignal: Bool = false
  @Published public var sendDecreaseFontSignal: Bool = false

  public init(webViewURLRequest: URLRequest, baseURL: URL, rawAuthCookie: String?) {
    self.webViewURLRequest = webViewURLRequest
    self.rawAuthCookie = rawAuthCookie
    self.baseURL = baseURL
  }
}

public struct WebAppWrapperView: View {
  struct SafariWebLink: Identifiable {
    let id: UUID
    let url: URL
  }

  @ObservedObject private var viewModel: WebAppWrapperViewModel
  @State var showHighlightAnnotationModal = false
  @State private var annotation = String()
  @State var annotationSaveTransactionID: UUID?
  @State var safariWebLink: SafariWebLink?
  let navBarVisibilityRatioUpdater: (Double) -> Void

  public init(viewModel: WebAppWrapperViewModel, navBarVisibilityRatioUpdater: ((Double) -> Void)? = nil) {
    self.viewModel = viewModel
    self.navBarVisibilityRatioUpdater = navBarVisibilityRatioUpdater ?? { _ in }
  }

  public var body: some View {
    let webAppView = WebAppView(
      request: viewModel.webViewURLRequest,
      baseURL: viewModel.baseURL,
      rawAuthCookie: viewModel.rawAuthCookie,
      openLinkAction: {
        #if os(macOS)
          NSWorkspace.shared.open($0)
        #elseif os(iOS)
          safariWebLink = SafariWebLink(id: UUID(), url: $0)
        #endif
      },
      webViewActionHandler: webViewActionHandler,
      navBarVisibilityRatioUpdater: navBarVisibilityRatioUpdater,
      annotation: $annotation,
      annotationSaveTransactionID: $annotationSaveTransactionID,
      sendIncreaseFontSignal: $viewModel.sendIncreaseFontSignal,
      sendDecreaseFontSignal: $viewModel.sendDecreaseFontSignal
    )

    return VStack {
      webAppView
    }
    .sheet(item: $safariWebLink) {
      SafariView(url: $0.url)
    }
    .sheet(isPresented: $showHighlightAnnotationModal) {
      HighlightAnnotationSheet(
        annotation: $annotation,
        onSave: {
          annotationSaveTransactionID = UUID()
          showHighlightAnnotationModal = false
        },
        onCancel: {
          showHighlightAnnotationModal = false
        }
      )
    }
  }

  func webViewActionHandler(message: WKScriptMessage) {
    if message.name == WebViewAction.highlightAction.rawValue {
      handleHighlightAction(message: message)
    }

    if message.name == WebViewAction.readingProgressUpdate.rawValue {
      guard let messageBody = message.body as? [String: Double] else { return }
      guard let progress = messageBody["progress"] else { return }
      viewModel.performActionSubject.send(.updateReadingProgess(progress: Int(progress)))
    }
  }

  private func handleHighlightAction(message: WKScriptMessage) {
    guard let messageBody = message.body as? [String: String] else { return }
    guard let actionID = messageBody["actionID"] else { return }

    switch actionID {
    case "share":
      if let highlightId = messageBody["highlightID"] {
        viewModel.performActionSubject.send(.shareHighlight(highlightID: highlightId))
      }
    case "annotate":
      annotation = messageBody["annotation"] ?? ""
      showHighlightAnnotationModal = true
    default:
      break
    }
  }
}

#if os(iOS)
  struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context _: UIViewControllerRepresentableContext<SafariView>) -> SFSafariViewController {
      SFSafariViewController(url: url)
    }

    // swiftlint:disable:next line_length
    func updateUIViewController(_: SFSafariViewController, context _: UIViewControllerRepresentableContext<SafariView>) {}
  }

#elseif os(macOS)
  struct SafariView: View {
    let url: URL
    var body: some View {
      Color.clear
    }
  }
#endif
