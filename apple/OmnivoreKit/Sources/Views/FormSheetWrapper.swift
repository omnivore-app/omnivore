//
//  FormSheet.swift
//
//
//  Created by Jackson Harper on 1/29/22.
//

import SwiftUI

#if os(iOS)

  class FormSheetWrapper<Content: View>: UIViewController, UIPopoverPresentationControllerDelegate {
    var content: () -> Content
    var onDismiss: (() -> Void)?
    var modalSize: CGSize

    private var hostVC: UIHostingController<Content>?

    @available(*, unavailable)
    required init?(coder _: NSCoder) { fatalError("") }

    init(content: @escaping () -> Content, modalSize: CGSize) {
      self.content = content
      self.modalSize = modalSize
      super.init(nibName: nil, bundle: nil)
    }

    func show() {
      guard hostVC == nil else { return }
      let controller = UIHostingController(rootView: content())

      if controller.traitCollection.userInterfaceIdiom == .phone {
        if #available(iOS 15, *) {
          if let sheet = controller.sheetPresentationController {
            sheet.preferredCornerRadius = 16
            sheet.prefersGrabberVisible = false
            sheet.detents = [.medium()]
            sheet.widthFollowsPreferredContentSizeWhenEdgeAttached = true
          }
        }
        controller.modalPresentationStyle = .pageSheet
      } else {
        controller.view.sizeToFit()
        controller.modalPresentationStyle = .formSheet
        controller.modalTransitionStyle = .crossDissolve
        controller.preferredContentSize = CGSize(width: 320, height: 320)
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
    let content: () -> Content

    func makeUIViewController(
      context _: UIViewControllerRepresentableContext<FormSheet<Content>>
    ) -> FormSheetWrapper<Content> {
      let controller = FormSheetWrapper(content: content, modalSize: modalSize)
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
      @ViewBuilder content: @escaping () -> Content
    ) -> some View {
      background(FormSheet(show: isPresented,
                           modalSize: modalSize,
                           content: content))
    }
  }

#endif
