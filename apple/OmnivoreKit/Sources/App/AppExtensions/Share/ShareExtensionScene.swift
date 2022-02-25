import Combine
import Foundation
import Models
import Services
import SwiftUI
import Utils
import Views

public extension PlatformViewController {
  static func makeShareExtensionController(extensionContext: NSExtensionContext?) -> PlatformViewController {
    let hostingController = PlatformHostingController(
      rootView: ShareExtensionView(extensionContext: extensionContext)
    )
    #if os(iOS)
      hostingController.view.layer.cornerRadius = 12
      hostingController.view.layer.masksToBounds = true
      hostingController.view.layer.isOpaque = false
    #endif
    return hostingController
  }
}

final class ShareExtensionViewModel: ObservableObject {
  let extensionContext: NSExtensionContext?

  @Published var title: String?
  @Published var status = ShareExtensionStatus.successfullySaved
  @Published var debugText: String?

  var subscriptions = Set<AnyCancellable>()
  let requestID = UUID().uuidString.lowercased()

  init(extensionContext: NSExtensionContext?) {
    self.extensionContext = extensionContext
  }

  func handleReadNowAction() {
    #if os(iOS)
      if let application = UIApplication.value(forKeyPath: #keyPath(UIApplication.shared)) as? UIApplication {
        let deepLinkUrl = NSURL(string: "omnivore://shareExtensionRequestID/\(requestID)")
        application.perform(NSSelectorFromString("openURL:"), with: deepLinkUrl)
      }
    #endif
    extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }

  func savePage() {
    PageScraper.scrape(extensionContext: extensionContext) { [weak self] result in
      switch result {
      case let .success(payload):
        self?.persist(pageScrapePayload: payload, requestId: self?.requestID ?? "")
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

struct ShareExtensionView: View {
  @ObservedObject private var viewModel: ShareExtensionViewModel

  init(extensionContext: NSExtensionContext?) {
    self.viewModel = ShareExtensionViewModel(extensionContext: extensionContext)
  }

  var body: some View {
    ShareExtensionChildView(
      debugText: viewModel.debugText,
      title: viewModel.title,
      status: viewModel.status,
      onAppearAction: viewModel.savePage,
      readNowButtonAction: viewModel.handleReadNowAction,
      dismissButtonTappedAction: { _, _ in
        viewModel.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
      }
    )
  }
}
