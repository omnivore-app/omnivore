//
//  SwipeRightToPopViewController.swift
//  SwipeRightToPopController
//
//  Created by Warif Akhand Rishi on 2/19/16.
//  Copyright © 2016 Warif Akhand Rishi. All rights reserved.
//
//  Modified by Joseph Hinkle on 12/1/19.
//  Modified version allows use in SwiftUI by subclassing UIHostingController.
//  Copyright © 2019 Joseph Hinkle. All rights reserved.
//

#if os(iOS)

  import SwiftUI
  private func < <T: Comparable>(lhs: T?, rhs: T?) -> Bool {
    switch (lhs, rhs) {
    case let (lll?, rrr?):
      return lll < rrr
    case (nil, _?):
      return true
    default:
      return false
    }
  }

  private func > <T: Comparable>(lhs: T?, rhs: T?) -> Bool {
    switch (lhs, rhs) {
    case let (lll?, rrr?):
      return lll > rrr
    default:
      return rhs < lhs
    }
  }

  class SwipeRightToPopViewController<Content>: UIHostingController<Content>, UINavigationControllerDelegate where Content: View {
    fileprivate var pop: (() -> Void)?
    fileprivate var lazyPopContent: LazyPop<Content>?
    private var percentDrivenInteractiveTransition: UIPercentDrivenInteractiveTransition?
    private var panGestureRecognizer: UIPanGestureRecognizer!
    private var parentNavigationControllerToUse: UINavigationController?
    private var gestureAdded = false

    override func viewDidLayoutSubviews() {
      // You need to add gesture events after every subview layout to protect against weird edge cases
      //    One notable edgecase is if you are in a splitview in landscape. In this case, there will be
      //    no nav controller with 2 vcs, so our addGesture will fail. After rotating back to portrait,
      //    the splitview will combine into one view with the details pushed on top. So only then would
      //    would the addGesture find a parent nav controller with 2 view controllers. I don't know if
      //    there are other edge cases, but running addGesture on every viewDidLayoutSubviews seems safe.
      addGesture()
    }

    public func addGesture() {
      if !gestureAdded {
        // attempt to find a parent navigationController
        var currentVc: UIViewController = self
        while true {
          if currentVc.navigationController != nil,
             currentVc.navigationController?.viewControllers.count > 1
          {
            parentNavigationControllerToUse = currentVc.navigationController
            break
          }
          guard let parent = currentVc.parent else {
            return
          }
          currentVc = parent
        }
        guard parentNavigationControllerToUse?.viewControllers.count > 1 else {
          return
        }

        panGestureRecognizer = UIPanGestureRecognizer(target: self, action: #selector(SwipeRightToPopViewController.handlePanGesture(_:)))
        view.addGestureRecognizer(panGestureRecognizer)
        gestureAdded = true
      }
    }

    @objc func handlePanGesture(_ panGesture: UIPanGestureRecognizer) {
      // if the parentNavigationControllerToUse has a width value, use that because it's more accurate. Otherwise use this view's width as a backup
      let total = parentNavigationControllerToUse?.view.frame.width ?? view.frame.width
      let amount = max(panGesture.translation(in: view).x, 0)
      let percent = amount / total
      let velocity = panGesture.velocity(in: view).x

      switch panGesture.state {
      case .began:
        if lazyPopContent?.isEnabled == true {
          parentNavigationControllerToUse?.delegate = self
        }

      case .changed:
        if let percentDrivenInteractiveTransition = percentDrivenInteractiveTransition {
          percentDrivenInteractiveTransition.update(percent)
        }

      case .ended:
        // Continue if drag more than 30% of screen width or velocity is higher than 1000
        if percent > 0.30 || velocity > 1000 {
          if let pop = self.pop {
            pop()
          }
          percentDrivenInteractiveTransition?.finish()
        } else {
          percentDrivenInteractiveTransition?.cancel()
        }

      case .cancelled, .failed:
        percentDrivenInteractiveTransition?.cancel()

      default:
        break
      }
    }

    override func didReceiveMemoryWarning() {
      super.didReceiveMemoryWarning()
    }

    func navigationController(_: UINavigationController,
                              animationControllerFor _: UINavigationController.Operation,
                              from _: UIViewController,
                              to _: UIViewController) -> UIViewControllerAnimatedTransitioning?
    {
      if #available(iOS 17.0, *) {
        return nil
      } else if UIDevice.isIPad {
        return nil
      } else {
        return SlideAnimatedTransitioning()
      }
    }

    func navigationController(_: UINavigationController,
                              interactionControllerFor _: UIViewControllerAnimatedTransitioning)
      -> UIViewControllerInteractiveTransitioning?
    {
      parentNavigationControllerToUse?.delegate = nil
      //    navigationController.delegate = nil

      if panGestureRecognizer.state == .began {
        percentDrivenInteractiveTransition = UIPercentDrivenInteractiveTransition()
        percentDrivenInteractiveTransition?.completionCurve = .easeOut
      } else {
        percentDrivenInteractiveTransition = nil
      }

      return percentDrivenInteractiveTransition
    }
  }

//
//  Lazy Pop SwiftUI Component
//
//  Created by Joseph Hinkle on 12/1/19.
//  Copyright © 2019 Joseph Hinkle. All rights reserved.
//

  private struct LazyPop<Content: View>: UIViewControllerRepresentable {
    let rootView: Content
    let pop: () -> Void
    @Binding var isEnabled: Bool

    init(_ rootView: Content, pop: @escaping () -> Void, isEnabled: (Binding<Bool>)? = nil) {
      self.rootView = rootView
      self.pop = pop
      self._isEnabled = isEnabled ?? Binding<Bool>(get: { true }, set: { _ in })
    }

    func makeUIViewController(context _: Context) -> UIViewController {
      let vc = SwipeRightToPopViewController(rootView: rootView)
      vc.pop = pop
      vc.lazyPopContent = self
      return vc
    }

    func updateUIViewController(_ uiViewController: UIViewController, context _: Context) {
      if let host = uiViewController as? UIHostingController<Content> {
        host.rootView = rootView
      }
    }
  }

  public extension View {
    func lazyPop(pop: @escaping () -> Void, isEnabled: (Binding<Bool>)? = nil) -> some View {
      LazyPop(self, pop: pop, isEnabled: isEnabled)
    }
  }

#endif
