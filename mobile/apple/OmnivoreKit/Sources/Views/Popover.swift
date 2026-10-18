import SwiftUI

#if os(iOS)
  public extension View {
    func fittedPopover<Content>(
      isPresented: Binding<Bool>,
      onDismiss: (() -> Void)? = nil,
      content: @escaping () -> Content
    ) -> some View where Content: View {
      ModifiedContent(
        content: self,
        modifier: PopoverViewModifier(
          isPresented: isPresented,
          onDismiss: onDismiss,
          content: content
        )
      )
    }
  }

  struct PopoverViewModifier<PopoverContent>: ViewModifier where PopoverContent: View {
    @Binding var isPresented: Bool
    let onDismiss: (() -> Void)?
    let content: () -> PopoverContent

    func body(content: Content) -> some View {
      content
        .background(
          Popover(
            isPresented: $isPresented,
            onDismiss: onDismiss,
            content: self.content
          )
        )
    }
  }

  struct Popover<Content: View>: UIViewControllerRepresentable {
    @Binding var isPresented: Bool
    let onDismiss: (() -> Void)?
    @ViewBuilder let content: () -> Content

    func makeCoordinator() -> Coordinator {
      Coordinator(parent: self, content: content())
    }

    func makeUIViewController(context _: Context) -> UIViewController {
      UIViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
      context.coordinator.host.rootView = content()
      if isPresented, uiViewController.presentedViewController == nil {
        let host = context.coordinator.host
        host.preferredContentSize = host.sizeThatFits(in: CGSize(width: Int.max, height: Int.max))
        host.modalPresentationStyle = UIModalPresentationStyle.popover
        host.popoverPresentationController?.delegate = context.coordinator
        host.popoverPresentationController?.sourceView = uiViewController.view
        host.popoverPresentationController?.sourceRect = uiViewController.view.bounds
        uiViewController.present(host, animated: true, completion: nil)
      } else {
        uiViewController.dismiss(animated: true)
      }
    }

    class Coordinator: NSObject, UIPopoverPresentationControllerDelegate {
      let host: UIHostingController<Content>
      private let parent: Popover

      init(parent: Popover, content: Content) {
        self.parent = parent
        self.host = UIHostingController(rootView: content)
      }

      func presentationControllerWillDismiss(_: UIPresentationController) {
        parent.isPresented = false
        if let onDismiss = parent.onDismiss {
          onDismiss()
        }
      }

      func adaptivePresentationStyle(for _: UIPresentationController) -> UIModalPresentationStyle {
        .none
      }
    }
  }
#endif
