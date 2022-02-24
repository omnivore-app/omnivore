import Combine
import Foundation
import Models
import Services
import SwiftUI
import Utils
import Views

public extension PlatformViewController {
  static func makeShareExtensionController(extensionContext: NSExtensionContext?) -> PlatformViewController {
    let viewModel = ShareExtensionViewModel.make(extensionContext: extensionContext)
    let rootView = ShareExtensionView(viewModel: viewModel)
    let hostingController = PlatformHostingController(rootView: rootView)
    #if os(iOS)
      hostingController.view.layer.cornerRadius = 12
      hostingController.view.layer.masksToBounds = true
      hostingController.view.layer.isOpaque = false
    #endif
    return hostingController
  }
}

extension ShareExtensionViewModel {
  static func make(extensionContext: NSExtensionContext?) -> ShareExtensionViewModel {
    let viewModel = ShareExtensionViewModel()
    viewModel.bind(extensionContext: extensionContext)
    return viewModel
  }

  func bind(extensionContext: NSExtensionContext?) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case let .savePage(requestID):
        self?.savePage(extensionContext: extensionContext, requestId: requestID)
      case .dismissButtonTapped:
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
      case .copyLinkButtonTapped:
        print("copy link button tapped")
      case .readNowButtonTapped:
        #if os(iOS)
          if let application = UIApplication.value(forKeyPath: #keyPath(UIApplication.shared)) as? UIApplication {
            let deepLinkUrl = NSURL(string: "omnivore://shareExtensionRequestID/\(self?.requestID ?? "")")
            application.perform(NSSelectorFromString("openURL:"), with: deepLinkUrl)
          }
        #endif
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
      case .archiveButtonTapped:
        print("archive button tapped")
      }
    }
    .store(in: &subscriptions)
  }

  private func savePage(extensionContext: NSExtensionContext?, requestId: String) {
    PageScraper.scrape(extensionContext: extensionContext) { [weak self] result in
      switch result {
      case let .success(payload):
        self?.persist(pageScrapePayload: payload, requestId: requestId)
      case let .failure(error):
        self?.debugText = error.message
      }
    }
  }

  private func persist(pageScrapePayload: PageScrapePayload, requestId: String) {
    let services = Services()

    guard services.authenticator.hasValidAuthToken else {
      status = .failed(error: .unauthorized)
      return
    }

    let saveLinkPublisher: AnyPublisher<Void, SaveArticleError> = {
      if pageScrapePayload.contentType == .pdf {
        return services.dataService.uploadPDFPublisher(pageScrapePayload: pageScrapePayload, requestId: requestId)
      } else if pageScrapePayload.html != nil {
        return services.dataService.savePagePublisher(pageScrapePayload: pageScrapePayload, requestId: requestId)
      } else {
        return services.dataService.saveUrlPublisher(pageScrapePayload: pageScrapePayload, requestId: requestId)
      }
    }()

    saveLinkPublisher
      .sink { [weak self] completion in
        guard case let .failure(error) = completion else { return }
        self?.debugText = "saveArticleError: \(error)"
        self?.status = .failed(error: error)
      } receiveValue: { [weak self] _ in
        self?.status = .successfullySaved
      }
      .store(in: &subscriptions)

    // Using viewerPublisher to get fast feedback for auth/network errors
    services.dataService.viewerPublisher()
      .sink { [weak self] completion in
        guard case let .failure(error) = completion else { return }
        self?.debugText = "saveArticleError: \(error)"
        self?.status = .failed(error: .unknown(description: ""))
      } receiveValue: { _ in }
      .store(in: &subscriptions)
  }
}
