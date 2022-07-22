import App
import Utils

#if os(iOS)
  import UIKit

  @objc(ShareExtensionViewController)
  final class ShareExtensionViewController: UIViewController {
    override func viewDidLoad() {
      super.viewDidLoad()
      view.backgroundColor = .clear

      embed(
        childViewController: UIViewController.makeShareExtensionController(extensionContext: extensionContext)
      )
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
