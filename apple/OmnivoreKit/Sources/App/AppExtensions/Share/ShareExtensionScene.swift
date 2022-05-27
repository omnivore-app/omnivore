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
  @Published var title: String?
  @Published var status: ShareExtensionStatus = FeatureFlag.enableReadNow ? .processing : .success
  @Published var debugText: String?

  var subscriptions = Set<AnyCancellable>()
  var backgroundTask: UIBackgroundTaskIdentifier?
  let requestID = UUID().uuidString.lowercased()

  init() {}

  func handleReadNowAction(extensionContext: NSExtensionContext?) {
    #if os(iOS)
      if let application = UIApplication.value(forKeyPath: #keyPath(UIApplication.shared)) as? UIApplication {
        let deepLinkUrl = NSURL(string: "omnivore://shareExtensionRequestID/\(requestID)")
        application.perform(NSSelectorFromString("openURL:"), with: deepLinkUrl)
      }
    #endif
    extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }

  func savePage(extensionContext: NSExtensionContext?) {
    backgroundTask = UIApplication.shared.beginBackgroundTask(withName: "BACKGROUND")

    PageScraper.scrape(extensionContext: extensionContext) { [weak self] result in
      switch result {
      case let .success(payload):
        self?.persist(pageScrapePayload: payload, requestId: self?.requestID ?? "")
      case let .failure(error):
        if let backgroundTask = self?.backgroundTask {
          UIApplication.shared.endBackgroundTask(backgroundTask)
        }
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
      if case let .pdf(data) = pageScrapePayload.contentType {
        return services.dataService.uploadPDFPublisher(pageScrapePayload: pageScrapePayload,
                                                       data: data,
                                                       requestId: requestId)
      } else if case let .html(html, title) = pageScrapePayload.contentType {
        return services.dataService.savePagePublisher(pageScrapePayload: pageScrapePayload,
                                                      html: html,
                                                      title: title,
                                                      requestId: requestId)
      } else {
        return services.dataService.saveUrlPublisher(pageScrapePayload: pageScrapePayload, requestId: requestId)
      }
    }()

    saveLinkPublisher
      .sink { [weak self] completion in
        guard case let .failure(error) = completion else { return }
        self?.debugText = "saveArticleError: \(error)"
        self?.status = .failed(error: error)
        if let backgroundTask = self?.backgroundTask {
          UIApplication.shared.endBackgroundTask(backgroundTask)
        }
      } receiveValue: { [weak self] _ in
        self?.status = .success
        if let backgroundTask = self?.backgroundTask {
          UIApplication.shared.endBackgroundTask(backgroundTask)
        }
      }
      .store(in: &subscriptions)

    // Check connection to get fast feedback for auth/network errors
    Task {
      let hasConnectionAndValidToken = await services.dataService.hasConnectionAndValidToken()

      if !hasConnectionAndValidToken {
        DispatchQueue.main.async {
          self.debugText = "saveArticleError: No connection or invalid token."
          self.status = .failed(error: .unknown(description: ""))
        }
      }
    }
  }
}

struct ShareExtensionView: View {
  let extensionContext: NSExtensionContext?
  @StateObject private var viewModel = ShareExtensionViewModel()

  var body: some View {
    ShareExtensionChildView(
      debugText: viewModel.debugText,
      title: viewModel.title,
      status: viewModel.status,
      onAppearAction: { viewModel.savePage(extensionContext: extensionContext) },
      readNowButtonAction: { viewModel.handleReadNowAction(extensionContext: extensionContext) },
      dismissButtonTappedAction: { _, _ in
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
      }
    )
  }
}
