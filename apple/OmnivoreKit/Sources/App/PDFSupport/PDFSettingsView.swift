#if os(iOS)
  import Models
  import PSPDFKit
  import PSPDFKitUI
  import SwiftUI
  import Utils
  import WebKit

  struct PDFSettingsView: UIViewControllerRepresentable {
    @Environment(\.presentationMode) var presentationMode

    let pdfViewController: PDFViewController?

    func makeCoordinator() -> PDFSettingsViewCoordinator {
      PDFSettingsViewCoordinator(self)
    }

    func makeUIViewController(context _: Context) -> some UIViewController {
      let settingsViewcontroller = PSPDFKitUI.PDFSettingsViewController()
      settingsViewcontroller.pdfViewController = pdfViewController

      let nav = UINavigationController(rootViewController: settingsViewcontroller)
      return nav
    }

    func updateUIViewController(_: UIViewControllerType, context _: Context) {}
  }

  class PDFSettingsViewCoordinator: NSObject, UINavigationControllerDelegate {
    var parent: PDFSettingsView

    init(_ parent: PDFSettingsView) {
      self.parent = parent
    }

    @objc func dismiss() {
      parent.presentationMode.wrappedValue.dismiss()
    }
  }
#endif
