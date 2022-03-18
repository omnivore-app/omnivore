import Combine
import Models
import Services
import SwiftUI
import UIKit
import Utils
import WebKit

final class WebReaderViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var htmlContent: String?

  var subscriptions = Set<AnyCancellable>()

  func loadContent(dataService: DataService, slug: String) {
    isLoading = true

    guard let viewer = dataService.currentViewer else { return }

    dataService.articleContentPublisher(username: viewer.username, slug: slug).sink(
      receiveCompletion: { [weak self] completion in
        guard case .failure = completion else { return }
        self?.isLoading = false
      },
      receiveValue: { [weak self] htmlContent in
        self?.htmlContent = htmlContent
      }
    )
    .store(in: &subscriptions)
  }
}

struct WebReaderContainerView: View {
  let item: FeedItem
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = WebReaderViewModel()

  var body: some View {
    Group {
      if let htmlContent = viewModel.htmlContent {
        WebReader(htmlContent: htmlContent, item: item)
      } else {
        Color.clear
          .contentShape(Rectangle())
          .onAppear {
            if !viewModel.isLoading {
              viewModel.loadContent(dataService: dataService, slug: item.slug)
            }
          }
      }
    }
  }
}

struct WebReader: UIViewRepresentable {
  let htmlContent: String
  let item: FeedItem

  func makeUIView(context _: Context) -> WKWebView {
    print(WebReaderResources.bundleURL)
    let webView = WKWebView()
    webView.loadHTMLString(
      WebReaderContent(htmlContent: htmlContent, item: item).styledContent,
      baseURL: WebReaderResources.bundleURL
    )
//    webView.configuration.userContentController.addUserScript(WebReaderResources.cssScript)

    return webView
  }

  func updateUIView(_: WKWebView, context _: UIViewRepresentableContext<WebReader>) {}
}
