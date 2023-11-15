//
//  SlideAnimatedTransitioning.swift
//  SwipeRightToPopController
//
//  Created by Warif Akhand Rishi on 2/19/16.
//  Copyright © 2016 Warif Akhand Rishi. All rights reserved.
//

#if os(iOS)

  import UIKit

  class SlideAnimatedTransitioning: NSObject {}

  extension SlideAnimatedTransitioning: UIViewControllerAnimatedTransitioning {
    func animateTransition(using transitionContext: UIViewControllerContextTransitioning) {
      let containerView = transitionContext.containerView
      guard
        let fromVC = transitionContext.viewController(forKey: UITransitionContextViewControllerKey.from),
        let toVC = transitionContext.viewController(forKey: UITransitionContextViewControllerKey.to)
      else {
        return
      }

      let width = containerView.frame.width

      var offsetLeft = fromVC.view?.frame
      offsetLeft?.origin.x = width

      var offscreenRight = fromVC.view?.frame
      offscreenRight?.origin.x = -width / 3.33

      toVC.view?.frame = offscreenRight!

      fromVC.view?.layer.shadowRadius = 5.0
      fromVC.view?.layer.shadowOpacity = 1.0
      toVC.view?.layer.opacity = 0.9

      transitionContext.containerView.addSubview(toVC.view)
      transitionContext.containerView.addSubview(fromVC.view)

      UIView.animate(withDuration: transitionDuration(using: transitionContext), delay: 0, options: .curveLinear, animations: {
        toVC.view?.frame = (fromVC.view?.frame)!
        fromVC.view?.frame = offsetLeft!

        toVC.view?.layer.opacity = 1.0
        fromVC.view?.layer.shadowOpacity = 0.1

      }, completion: { _ in
        if !transitionContext.transitionWasCancelled {
          toVC.view?.layer.opacity = 1.0
          toVC.view?.layer.shadowOpacity = 0
          fromVC.view?.layer.opacity = 1.0
          fromVC.view?.layer.shadowOpacity = 0

          fromVC.view.removeFromSuperview()
        }
        // when cancelling or completing the animation, ios simulator seems to sometimes flash black backgrounds during the animation. on devices, this doesn't seem to happen though.
        // containerView.backgroundColor = [UIColor whiteColor];
        transitionContext.completeTransition(!transitionContext.transitionWasCancelled)
      })
    }

    func transitionDuration(using _: UIViewControllerContextTransitioning?) -> TimeInterval {
      0.3
    }
  }

#endif
