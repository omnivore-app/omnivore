// swiftlint:disable weak_delegate
import App
import SwiftUI

#if os(macOS)
  import AppKit
#elseif os(iOS)
  import Intercom
  import PSPDFKit
  import UIKit
  import Utils
#endif

@main
struct MainApp: App {
  #if os(macOS)
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
  #elseif os(iOS)
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    init() {
      // Activate PSPDFKit for app.omnivore.app
      if let pspdfKitKey = AppKeys.sharedInstance?.pspdfKitKey {
        SDK.setLicenseKey(pspdfKitKey)
      }
    }
  #endif

  var body: some Scene {
    #if os(iOS)
      WindowGroup {
        RootView(
          pdfViewerProvider: pdfViewerProvider,
          intercomProvider: AppKeys.sharedInstance?.intercom != nil ? IntercomProvider(
            registerIntercomUser: { Intercom.registerUser(withUserId: $0) },
            unregisterIntercomUser: Intercom.logout,
            showIntercomMessenger: Intercom.presentMessenger
          ) : nil
        )
      }
    #elseif os(macOS)
      WindowGroup {
        RootView(pdfViewerProvider: nil, intercomProvider: nil)
      }
    #endif
  }

  private func pdfViewerProvider(url: URL, viewModel: PDFViewerViewModel) -> AnyView {
    AnyView(PDFViewer(pdfURL: url, viewModel: viewModel))
  }
}
