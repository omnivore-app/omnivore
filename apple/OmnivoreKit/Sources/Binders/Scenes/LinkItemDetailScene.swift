import Models
import Services
import SwiftUI
import Utils
import Views

extension LinkItemDetailViewModel {
  static func make(feedItem: FeedItem, services: Services) -> LinkItemDetailViewModel {
    let viewModel = LinkItemDetailViewModel(item: feedItem)
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case .load:
        self?.loadWebAppWrapper(services: services)
      case let .updateReadStatus(markAsRead: markAsRead):
        self?.updateItemReadStatus(markAsRead: markAsRead, dataService: services.dataService)
      }
    }
    .store(in: &subscriptions)
  }

  private func updateItemReadStatus(markAsRead: Bool, dataService: DataService) {
    dataService
      .updateArticleReadingProgressPublisher(
        itemID: item.id,
        readingProgress: markAsRead ? 100 : 0,
        anchorIndex: 0
      )
      .sink { completion in
        guard case let .failure(error) = completion else { return }
        print(error)
      } receiveValue: { [weak self] feedItem in
        self?.item.readingProgress = feedItem.readingProgress
      }
      .store(in: &subscriptions)
  }

  private func loadWebAppWrapper(services: Services) {
    // Attempt to get `Viewer` from DataService
    if let currentViewer = services.dataService.currentViewer {
      createWebAppWrapperViewModel(username: currentViewer.username, services: services)
      return
    }

    services.dataService.viewerPublisher().sink(
      receiveCompletion: { completion in
        guard case let .failure(error) = completion else { return }
        print(error)
      },
      receiveValue: { [weak self] viewer in
        self?.createWebAppWrapperViewModel(username: viewer.username, services: services)
      }
    )
    .store(in: &subscriptions)
  }

  private func createWebAppWrapperViewModel(username: String, services: Services) {
    let baseURL = services.dataService.appEnvironment.webAppBaseURL

    let urlRequest = URLRequest.webRequest(
      baseURL: services.dataService.appEnvironment.webAppBaseURL,
      urlPath: "/app/\(username)/\(item.slug)",
      queryParams: ["isAppEmbedView": "true", "highlightBarDisabled": isMacApp ? "false" : "true"]
    )

    let newWebAppWrapperViewModel = WebAppWrapperViewModel(
      webViewURLRequest: urlRequest,
      baseURL: baseURL,
      rawAuthCookie: services.authenticator.omnivoreAuthCookieString
    )

    newWebAppWrapperViewModel.performActionSubject.sink { action in
      switch action {
      case let .shareHighlight(highlightID):
        print("show share modal for highlight with id: \(highlightID)")
      }
    }
    .store(in: &newWebAppWrapperViewModel.subscriptions)

    webAppWrapperViewModel = newWebAppWrapperViewModel
  }
}
