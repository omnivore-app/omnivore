import App
import Services
import SwiftUI
import Utils
import Views

#if os(iOS)
  import UIKit

  @objc(ShareExtensionViewController)
  final class ShareExtensionViewController: UIViewController, UIGestureRecognizerDelegate {
    let labelsViewModel = LabelsViewModel()
    let viewModel = ShareExtensionViewModel()

    override func viewDidLoad() {
      super.viewDidLoad()
      view.backgroundColor = UIColor(white: 1.0, alpha: 0.001)
      view.isUserInteractionEnabled = true

      let dismissGesture = UITapGestureRecognizer(target: self, action: #selector(self.viewTapped(_:)))
      dismissGesture.delegate = self
      view.addGestureRecognizer(dismissGesture)

      if !viewModel.services.authenticator.isLoggedIn,
         !viewModel.services.dataService.appEnvironment.environmentConfigured
      {
        embed(
          childViewController: UIViewController.makeLoggedOutShareExtensionController(extensionContext: extensionContext),
          heightRatio: 0.60
        )
        return
      }

      NotificationCenter.default.addObserver(
        forName: Notification.Name("ShowAddNoteSheet"),
        object: nil,
        queue: OperationQueue.main
      ) { _ in
        self.openSheet(AnyView(AddNoteSheet(viewModel: self.viewModel)))
      }

      NotificationCenter.default.addObserver(
        forName: Notification.Name("ShowEditLabelsSheet"),
        object: nil,
        queue: OperationQueue.main
      ) { _ in
        self.openSheet(AnyView(EditLabelsSheet(viewModel: self.viewModel, labelsViewModel: self.labelsViewModel)))
      }

      NotificationCenter.default.addObserver(
        forName: Notification.Name("ShowEditInfoSheet"),
        object: nil,
        queue: OperationQueue.main
      ) { _ in
        self.openSheet(AnyView(EditInfoSheet(viewModel: self.viewModel)))
      }

      embed(
        childViewController: UIViewController.makeShareExtensionController(
          viewModel: viewModel,
          labelsViewModel: labelsViewModel,
          extensionContext: extensionContext
        ),
        heightRatio: 0.60
      )
    }

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
      return touch.view == gestureRecognizer.view
    }

    @objc func viewTapped(_ panGesture: UIGestureRecognizer) {
      viewModel.dismissExtension(extensionContext: extensionContext)
    }

    func openSheet(_ rootView: AnyView) {
      let hostingController = UIHostingController(rootView: rootView)

      present(hostingController, animated: true, completion: nil)
    }
  }

#elseif os(macOS)

  import Cocoa

  class ShareViewController: NSViewController {
    let labelsViewModel = LabelsViewModel()
    let viewModel = ShareExtensionViewModel()

    override func loadView() {
      view = NSView(frame: NSRect(x: 0, y: 0, width: 400, height: 300))
    }

    override func viewDidLoad() {
      super.viewDidLoad()

      NotificationCenter.default.addObserver(
        forName: Notification.Name("ShowAddNoteSheet"),
        object: nil,
        queue: OperationQueue.main
      ) { _ in
        self.openSheet(AnyView(AddNoteSheet(viewModel: self.viewModel)))
      }

      NotificationCenter.default.addObserver(
        forName: Notification.Name("ShowEditLabelsSheet"),
        object: nil,
        queue: OperationQueue.main
      ) { _ in
        self.openSheet(AnyView(EditLabelsSheet(viewModel: self.viewModel, labelsViewModel: self.labelsViewModel)))
      }

      NotificationCenter.default.addObserver(
        forName: Notification.Name("ShowEditInfoSheet"),
        object: nil,
        queue: OperationQueue.main
      ) { _ in
        self.openSheet(AnyView(EditInfoSheet(viewModel: self.viewModel)))
      }

      embed(
        childViewController: NSViewController.makeShareExtensionController(
          viewModel: viewModel,
          labelsViewModel: labelsViewModel,
          extensionContext: extensionContext
        )
      )
    }

    func openSheet(_ rootView: AnyView) {
      let hostingController = PlatformHostingController(rootView: rootView)

      presentAsSheet(hostingController)
    }
  }

#endif
