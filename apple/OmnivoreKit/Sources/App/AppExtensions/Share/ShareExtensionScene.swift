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

struct ShareExtensionView: View {
  let extensionContext: NSExtensionContext?
  @StateObject private var viewModel = ShareExtensionViewModel()
  @StateObject private var childViewModel = ShareExtensionChildViewModel()

  var body: some View {
    ShareExtensionChildView(
      viewModel: childViewModel,
      onAppearAction: {
        viewModel.savePage(
          extensionContext: extensionContext,
          shareExtensionViewModel: childViewModel
        )
      },
      readNowButtonAction: { viewModel.handleReadNowAction(requestId: $0, extensionContext: extensionContext) },
      dismissButtonTappedAction: { _, _ in
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
      }
    )
  }
}
