import SwiftUI
import Utils
import Views

public extension PlatformViewController {
  static func makeShareExtensionController(
    viewModel: ShareExtensionViewModel,
    labelsViewModel: LabelsViewModel,
    extensionContext: NSExtensionContext?
  ) -> PlatformViewController {
    registerFonts()

    let hostingController = PlatformHostingController(
      rootView: ShareExtensionView(viewModel: viewModel,
                                   labelsViewModel: labelsViewModel,
                                   extensionContext: extensionContext)
    )
    #if os(iOS)
      hostingController.view.layer.cornerRadius = 12
      hostingController.view.layer.masksToBounds = true
      hostingController.view.layer.isOpaque = false
    #endif
    return hostingController
  }

  static func makeLoggedOutShareExtensionController(
    extensionContext: NSExtensionContext?
  ) -> PlatformViewController {
    registerFonts()

    let hostingController = PlatformHostingController(
      rootView: LoggedOutShareExtensionView(extensionContext: extensionContext)
    )
    #if os(iOS)
      hostingController.view.layer.cornerRadius = 12
      hostingController.view.layer.masksToBounds = true
      hostingController.view.layer.isOpaque = false
    #endif
    return hostingController
  }
}
