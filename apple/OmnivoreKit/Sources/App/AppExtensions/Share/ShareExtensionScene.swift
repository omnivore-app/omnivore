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

  var subscriptions = Set<AnyCancellable>()
  var backgroundTask: UIBackgroundTaskIdentifier?
  let requestID = UUID().uuidString.lowercased()
  let saveService = ExtensionSaveService()

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
    if let extensionContext = extensionContext {
      saveService.save(extensionContext, updateStatusFunc: updateStatus)
    } else {
      updateStatus(.failed(error: .unknown(description: "Internal Error")))
    }
  }

  private func updateStatus(_ newStatus: ShareExtensionStatus) {
    DispatchQueue.main.async {
      self.status = newStatus
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
