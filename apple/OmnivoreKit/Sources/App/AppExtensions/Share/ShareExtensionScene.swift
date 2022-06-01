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
  @Published var status: ShareExtensionStatus = .processing
  @Published var debugText: String?

  let services = Services()
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
    backgroundTask = UIApplication.shared.beginBackgroundTask(withName: requestID)

    PageScraper.scrape(extensionContext: extensionContext) { [weak self] result in
      guard let self = self else { return }

      switch result {
      case let .success(payload):
        Task {
          await self.persist(pageScrapePayload: payload, requestId: self.requestID)
          self.endBackgroundTask()
        }
      case let .failure(error):
        if let backgroundTask = self.backgroundTask {
          UIApplication.shared.endBackgroundTask(backgroundTask)
          self.backgroundTask = nil
        }
        self.debugText = error.message
        self.endBackgroundTask()
      }
    }
  }

  private func endBackgroundTask() {
    if let backgroundTask = self.backgroundTask {
      UIApplication.shared.endBackgroundTask(backgroundTask)
    }
  }

  private func persist(pageScrapePayload: PageScrapePayload, requestId: String) async {
    // Save locally first
    let linkedItem = try? await services.dataService.persistPageScrapePayload(pageScrapePayload, requestId: requestId)

    if let linkedItem = linkedItem {
      updateStatus(newStatus: .saved)

      await services.dataService.syncLocalCreatedLinkedItem(item: linkedItem)
      updateStatus(newStatus: .synced)
    } else {
      updateStatus(newStatus: .failed(error: SaveArticleError.unknown(description: "Unable to save page")))
    }
  }

  private func updateStatus(newStatus: ShareExtensionStatus) {
    DispatchQueue.main.async {
      self.status = newStatus
    }
  }
}

//    Task {
//      do {
//        // Save locally, then attempt to sync to the server
//        let item = try await services.dataService.persistPageScrapePayload(pageScrapePayload, requestId: requestId)
//        // TODO: need to update this on the main thread and handle the result == false case here
//        if item != nil {
//          self.status = .saved
//        } else {
//          self.status = .failed(error: SaveArticleError.unknown(description: "Unable to save page"))
//          return
//        }
//
//        // force a server sync
//        if let item = item {
//          let syncResult = services.dataService.syncLocalCreatedLinkedItem(item: item)
//          print("RESULT", syncResult)
//        }
////          self.status = .synced
////        } else {
////          self.status = .syncFailed(error: SaveArticleError.unknown(description: "Unable to sync page"))
////        }
//
//      } catch {
//        print("ERROR SAVING PAGE", error)
//      }
//    }
//    // First persist to Core Data
//    // services.dataService.persist(jsonArticle: article)

//
//    guard services.authenticator.hasValidAuthToken else {
//      status = .failed(error: .unauthorized)
//      return
//    }
//
//    let saveLinkPublisher: AnyPublisher<Void, SaveArticleError> = {
//      if case let .pdf(data) = pageScrapePayload.contentType {
//        return services.dataService.uploadPDFPublisher(pageScrapePayload: pageScrapePayload,
//                                                       data: data,
//                                                       requestId: requestId)
//      } else if case let .html(html, title) = pageScrapePayload.contentType {
//        return services.dataService.savePagePublisher(pageScrapePayload: pageScrapePayload,
//                                                      html: html,
//                                                      title: title,
//                                                      requestId: requestId)
//      } else {
//        return services.dataService.saveUrlPublisher(pageScrapePayload: pageScrapePayload, requestId: requestId)
//      }
//    }()
//
//    saveLinkPublisher
//      .sink { [weak self] completion in
//        guard case let .failure(error) = completion else { return }
//        self?.debugText = "saveArticleError: \(error)"
//        self?.status = .failed(error: error)
//        if let backgroundTask = self?.backgroundTask {
//          UIApplication.shared.endBackgroundTask(backgroundTask)
//        }
//      } receiveValue: { [weak self] _ in
//        self?.status = .success
//        if let backgroundTask = self?.backgroundTask {
//          UIApplication.shared.endBackgroundTask(backgroundTask)
//        }
//      }
//      .store(in: &subscriptions)
//
//    // Check connection to get fast feedback for auth/network errors
//    Task {
//      let hasConnectionAndValidToken = await services.dataService.hasConnectionAndValidToken()
//
//      if !hasConnectionAndValidToken {
//        DispatchQueue.main.async {
//          self.debugText = "saveArticleError: No connection or invalid token."
//          self.status = .failed(error: .unknown(description: ""))
//        }
//      }
//    }
//  }
// }

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
