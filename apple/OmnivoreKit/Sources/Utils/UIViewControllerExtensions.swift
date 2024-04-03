#if os(iOS)
  import UIKit

  public extension UIViewController {
    // swiftlint:disable line_length
    func embed(childViewController child: UIViewController, heightRatio: CGFloat? = nil) {
      addChild(child)

      child.view.translatesAutoresizingMaskIntoConstraints = false
      view.addSubview(child.view)

      var constraints = [
        child.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
        child.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        child.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
      ]

      if let heightRatio = heightRatio {
        let constraint = child.view.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: heightRatio)
        constraints.append(constraint)

        NotificationCenter.default.addObserver(forName: UIResponder.keyboardWillShowNotification, object: nil, queue: OperationQueue.main) { _ in

          UIView.animate(withDuration: 0.2) {
            if let parent = self.parent, let frame = constraint.firstItem?.frame {
              constraint.constant = parent.view.frame.height - frame.height - 10
            }

            child.view.setNeedsLayout()
            child.view.layoutIfNeeded()
          }
        }

        NotificationCenter.default.addObserver(forName: UIResponder.keyboardWillHideNotification, object: nil, queue: OperationQueue.main) { _ in

          UIView.animate(withDuration: 0.2) {
            constraint.constant = 0
            child.view.setNeedsLayout()
            child.view.layoutIfNeeded()
          }
        }

      } else {
        constraints.append(child.view.topAnchor.constraint(equalTo: view.topAnchor))
      }

      NSLayoutConstraint.activate(constraints)

      child.didMove(toParent: self)
    }
  }


#endif

#if os(macOS)
  import AppKit

  public extension NSViewController {
    func embed(childViewController child: NSViewController) {
      addChild(child)

      child.view.translatesAutoresizingMaskIntoConstraints = false
      view.addSubview(child.view)

      NSLayoutConstraint.activate([
        child.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
        child.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        child.view.topAnchor.constraint(equalTo: view.topAnchor),
        child.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
      ])
    }
  }
#endif
