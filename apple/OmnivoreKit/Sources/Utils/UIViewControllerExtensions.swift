#if os(iOS)
  import UIKit

  public extension UIViewController {
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
        constraints.append(child.view.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: heightRatio))
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
