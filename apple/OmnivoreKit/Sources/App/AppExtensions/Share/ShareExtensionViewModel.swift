import Models
import SwiftUI
import Utils
import Views

public class ShareExtensionViewModel: ObservableObject {
  @Published public var status: ShareExtensionStatus = .processing
  @Published public var title: String?
  @Published public var url: String?
  @Published public var iconURL: String?
  @Published public var requestId = UUID().uuidString.lowercased()
  @Published var debugText: String?

  #if os(macOS)
    let services = Services()
  #endif

  let queue = OperationQueue()

  func handleReadNowAction(extensionContext: NSExtensionContext?) {
    #if os(iOS)
      if let application = UIApplication.value(forKeyPath: #keyPath(UIApplication.shared)) as? UIApplication {
        let deepLinkUrl = NSURL(string: "omnivore://shareExtensionRequestID/\(requestId)")
        application.perform(NSSelectorFromString("openURL:"), with: deepLinkUrl)
      }
    #endif
    extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }

  func savePage(extensionContext: NSExtensionContext?) {
    if let extensionContext = extensionContext {
      save(extensionContext)
    } else {
      DispatchQueue.main.async {
        self.status = .failed(error: .unknown(description: "Internal Error"))
      }
    }
  }

  #if os(iOS)
    func queueSaveOperation(_ payload: PageScrapePayload) {
      ProcessInfo().performExpiringActivity(withReason: "app.omnivore.SaveActivity") { [self] expiring in
        guard !expiring else {
          self.queue.cancelAllOperations()
          self.queue.waitUntilAllOperationsAreFinished()
          return
        }

        let operation = SaveOperation(pageScrapePayload: payload, shareExtensionViewModel: self)
        self.queue.addOperation(operation)
        self.queue.waitUntilAllOperationsAreFinished()
      }
    }
  #endif
}

public enum ShareExtensionStatus {
  case processing
  case saved
  case synced
  case failed(error: SaveArticleError)
  case syncFailed(error: SaveArticleError)

  var displayMessage: String {
    switch self {
    case .processing:
      return LocalText.saveArticleProcessingState
    case .saved:
      return LocalText.saveArticleSavedState
    case .synced:
      return "Synced"
    case let .failed(error: error):
      return "Save failed \(error.displayMessage)"
    case let .syncFailed(error: error):
      return "Sync failed \(error.displayMessage)"
    }
  }
}

private extension SaveArticleError {
  var displayMessage: String {
    switch self {
    case .unauthorized:
      return LocalText.extensionAppUnauthorized
    case .network:
      return LocalText.networkError
    case .badData, .unknown:
      return LocalText.genericError
    }
  }
}
