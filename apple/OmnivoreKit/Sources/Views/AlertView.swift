import SwiftUI

#if os(iOS)

  public extension View {
    func customAlert<Content: View>(
      isPresented: Binding<Bool>,
      @ViewBuilder content: @escaping () -> Content
    ) -> some View {
      background(
        CustomAlert(
          show: isPresented,
          content: content
        )
      )
    }
  }

  private final class CustomAlertWrapper<Content: View>: UIViewController, UIPopoverPresentationControllerDelegate {
    var content: () -> Content
    var onDismiss: (() -> Void)?

    private var hostVC: UIHostingController<Content>?

    @available(*, unavailable)
    required init?(coder _: NSCoder) { fatalError("") }

    init(content: @escaping () -> Content) {
      self.content = content
      super.init(nibName: nil, bundle: nil)
    }

    func show() {
      guard hostVC == nil else { return }
      let controller = UIHostingController(rootView: content())

      controller.view.sizeToFit()
      controller.modalPresentationStyle = .overFullScreen
      controller.modalTransitionStyle = .crossDissolve
      controller.view.backgroundColor = UIColor(white: 0, alpha: 0.4)

      controller.presentationController?.delegate = self
      hostVC = controller
      present(controller, animated: true, completion: nil)
    }

    func hide() {
      guard let controller = hostVC, !controller.isBeingDismissed else { return }
      dismiss(animated: true, completion: nil)
      hostVC = nil
    }

    func presentationControllerWillDismiss(_: UIPresentationController) {
      hostVC = nil
      onDismiss?()
    }
  }

  private struct CustomAlert<Content: View>: UIViewControllerRepresentable {
    @Binding var show: Bool

    let content: () -> Content

    func makeUIViewController(
      context _: UIViewControllerRepresentableContext<CustomAlert<Content>>
    ) -> CustomAlertWrapper<Content> {
      let controller = CustomAlertWrapper(content: content)
      controller.onDismiss = { self.show = false }
      return controller
    }

    func updateUIViewController(
      _ uiViewController: CustomAlertWrapper<Content>,
      context _: UIViewControllerRepresentableContext<CustomAlert<Content>>
    ) {
      if show {
        uiViewController.show()
      } else {
        uiViewController.hide()
      }
    }
  }

#endif
