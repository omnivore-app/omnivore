import Models
import SwiftUI
import Utils
import Views

public class ShareExtensionViewModel: ObservableObject {
  @Published var title: String?
  @Published var debugText: String?

  let saveService = ExtensionSaveService()

  func handleReadNowAction(requestId: String, extensionContext: NSExtensionContext?) {
    #if os(iOS)
      if let application = UIApplication.value(forKeyPath: #keyPath(UIApplication.shared)) as? UIApplication {
        let deepLinkUrl = NSURL(string: "omnivore://shareExtensionRequestID/\(requestId)")
        application.perform(NSSelectorFromString("openURL:"), with: deepLinkUrl)
      }
    #endif
    extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }

  func savePage(extensionContext: NSExtensionContext?, shareExtensionViewModel: ShareExtensionChildViewModel) {
    if let extensionContext = extensionContext {
      saveService.save(extensionContext, shareExtensionViewModel: shareExtensionViewModel)
    } else {
      DispatchQueue.main.async {
        shareExtensionViewModel.status = .failed(error: .unknown(description: "Internal Error"))
      }
    }
  }
}

public class ShareExtensionChildViewModel: ObservableObject {
  @Published public var status: ShareExtensionStatus = .processing
  @Published public var title: String?
  @Published public var url: String?
  @Published public var iconURL: String?
  @Published public var requestId: String

  public init() {
    self.requestId = UUID().uuidString.lowercased()
  }
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
