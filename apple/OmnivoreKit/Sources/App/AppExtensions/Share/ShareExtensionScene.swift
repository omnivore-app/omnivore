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

public class ShareExtensionViewModel: ObservableObject {
  @Published var title: String?
  @Published var status: ShareExtensionStatus = .processing
  @Published var debugText: String?

  let saveService = ExtensionSaveService()
  let requestId = UUID().uuidString.lowercased()

  func handleReadNowAction(extensionContext: NSExtensionContext?) {
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
      saveService.save(extensionContext, requestId: requestId, shareExtensionViewModel: shareExtensionViewModel)
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
  @StateObject private var childViewModel = ShareExtensionChildViewModel()

  var body: some View {
    ShareExtensionChildView(
      viewModel: childViewModel,
      onAppearAction: { viewModel.savePage(extensionContext: extensionContext, shareExtensionViewModel: childViewModel) },
      readNowButtonAction: { viewModel.handleReadNowAction(extensionContext: extensionContext) },
      dismissButtonTappedAction: { _, _ in
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
      }
    )
  }
}
