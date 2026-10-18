import SwiftUI

#if os(iOS)

  class FormSheetWrapper<Content: View>: UIViewController, UIPopoverPresentationControllerDelegate {
    var content: () -> Content
    var onDismiss: (() -> Void)?
    var modalSize: CGSize
    let useSmallDetent: Bool
    let useLargeDetent: Bool

    private var hostVC: UIHostingController<Content>?

    @available(*, unavailable)
    required init?(coder _: NSCoder) { fatalError("") }

    init(content: @escaping () -> Content, modalSize: CGSize, useSmallDetent: Bool, useLargeDetent: Bool) {
      self.content = content
      self.modalSize = modalSize
      self.useSmallDetent = useSmallDetent
      self.useLargeDetent = useLargeDetent
      super.init(nibName: nil, bundle: nil)
    }

    func show() {
      guard hostVC == nil else { return }
      let controller: UIHostingController<Content> = {
        // if UIDevice.isIPhone, useSmallDetent {
        //  return FormSheetHostingController(rootView: content(), height: 100)
        // } else {
        UIHostingController(rootView: content())
        // }
      }()

      controller.preferredContentSize = modalSize

      if UIDevice.isIPhone {
        if let sheet = controller.sheetPresentationController {
          sheet.prefersGrabberVisible = false
          sheet.detents = [.medium(), .large()]
          sheet.widthFollowsPreferredContentSizeWhenEdgeAttached = true
        }

        controller.modalPresentationStyle = .pageSheet
      } else {
        controller.view.sizeToFit()
        controller.modalPresentationStyle = .formSheet
        controller.modalTransitionStyle = .crossDissolve
        controller.preferredContentSize = modalSize
      }

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

  struct FormSheet<Content: View>: UIViewControllerRepresentable {
    @Binding var show: Bool

    let modalSize: CGSize
    let useSmallDetent: Bool
    let useLargeDetent: Bool
    let content: () -> Content

    func makeUIViewController(
      context _: UIViewControllerRepresentableContext<FormSheet<Content>>
    ) -> FormSheetWrapper<Content> {
      let controller = FormSheetWrapper(
        content: content,
        modalSize: modalSize,
        useSmallDetent: useSmallDetent,
        useLargeDetent: useLargeDetent
      )
      controller.onDismiss = { self.show = false }
      return controller
    }

    func updateUIViewController(
      _ uiViewController: FormSheetWrapper<Content>,
      context _: UIViewControllerRepresentableContext<FormSheet<Content>>
    ) {
      if show {
        uiViewController.show()
      } else {
        uiViewController.hide()
      }
    }
  }

  public extension View {
    func formSheet<Content: View>(
      isPresented: Binding<Bool>,
      modalSize: CGSize = CGSize(width: 320, height: 320),
      useSmallDetent: Bool = false,
      useLargeDetent: Bool = false,
      @ViewBuilder content: @escaping () -> Content
    ) -> some View {
      background(
        FormSheet(
          show: isPresented,
          modalSize: modalSize,
          useSmallDetent: useSmallDetent,
          useLargeDetent: useLargeDetent,
          content: content
        )
      )
    }
  }

  final class FormSheetHostingController<Content: View>: UIHostingController<Content> {
    let height: CGFloat

    init(rootView: Content, height: CGFloat) {
      self.height = height
      super.init(rootView: rootView)
    }

    @available(*, unavailable)
    @MainActor dynamic required init?(coder _: NSCoder) {
      fatalError("init(coder:) has not been implemented")
    }

    override func updateViewConstraints() {
      view.frame.size.height = UIScreen.main.bounds.height - height
      view.frame.origin.y = height
      view.roundCorners(corners: [.topLeft, .topRight], radius: 16.0)
      super.updateViewConstraints()
    }
  }

  extension UIView {
    func roundCorners(corners: UIRectCorner, radius: CGFloat) {
      let path = UIBezierPath(
        roundedRect: bounds,
        byRoundingCorners: corners,
        cornerRadii:
        CGSize(
          width: radius,
          height: radius
        )
      )
      let mask = CAShapeLayer()
      mask.path = path.cgPath
      layer.mask = mask
    }
  }

#endif
