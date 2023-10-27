import App
import SwiftUI
import Utils
import Views

#if os(iOS)
  import UIKit

  final class SheetViewController: UIViewController {}

  @objc(ShareExtensionViewController)
  final class ShareExtensionViewController: UIViewController {
    override func viewDidLoad() {
      super.viewDidLoad()
      view.backgroundColor = .clear

      NotificationCenter.default.addObserver(forName: Notification.Name("ExpandForm"), object: nil, queue: OperationQueue.main) { _ in

        self.openSheet()
      }

      embed(
        childViewController: UIViewController.makeShareExtensionController(extensionContext: extensionContext),
        heightRatio: 0.60
      )
    }

    @IBAction func openSheet() {
      let hostingController = UIHostingController(rootView: AddNoteSheet())

      present(hostingController, animated: true, completion: nil)

      // Present it w/o any adjustments so it uses the default sheet presentation.
      // present(sheetViewController., animated: true, completion: nil)
    }
  }

#elseif os(macOS)

  import Cocoa

  class ShareViewController: NSViewController {
    override func loadView() {
      view = NSView(frame: NSRect(x: 0, y: 0, width: 400, height: 600))
    }

    override func viewDidLoad() {
      super.viewDidLoad()
      embed(
        childViewController: NSViewController.makeShareExtensionController(extensionContext: extensionContext)
      )
    }
  }

#endif
