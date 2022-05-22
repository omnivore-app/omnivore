#if os(iOS)
  import Models
  import PSPDFKit
  import PSPDFKitUI
  import SwiftUI
  import Utils
  import WebKit

  struct PDFReaderViewController: UIViewControllerRepresentable {
    static func registerKey() {
      if let pspdfKitKey = AppKeys.sharedInstance?.pspdfKitKey {
        SDK.setLicenseKey(pspdfKitKey)
      }
    }

    let document: Document

    @Environment(\.presentationMode) var presentationMode

    func makeCoordinator() -> Coordinator {
      Coordinator(self)
    }

    func makeUIViewController(context: Context) -> some UIViewController {
      let readerViewcontroller = ReaderViewController(document: document)

      let nav = UINavigationController(rootViewController: readerViewcontroller)

      // Using an empty image creates a transparent navigation bar
      nav.navigationBar.setBackgroundImage(UIImage(), for: .default)
      nav.navigationBar.shadowImage = UIImage()
      nav.navigationBar.isTranslucent = true

      readerViewcontroller.navigationItem.title = nil
      readerViewcontroller.navigationItem.setRightBarButtonItems(
        [UIBarButtonItem(
          image: UIImage(systemName: "xmark.circle"),
          style: .plain,
          target: context.coordinator,
          action: #selector(Coordinator.toggleReaderView)
        )], animated: false
      )

      return nav
    }

    func updateUIViewController(_: UIViewControllerType, context _: Context) {}
  }

  class Coordinator: NSObject, UINavigationControllerDelegate {
    var parent: PDFReaderViewController

    init(_ parent: PDFReaderViewController) {
      self.parent = parent
    }

    @objc func toggleReaderView() {
      parent.presentationMode.wrappedValue.dismiss()
    }
  }
#endif
