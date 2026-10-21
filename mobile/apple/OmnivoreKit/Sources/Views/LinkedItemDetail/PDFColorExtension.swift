#if os(iOS)

  import UIKit

  public extension UIColor {
    // Override the selection alpha so we can make selection rects more visible
    @objc(pspdf_selectionAlpha)
    class var selectionAlpha: CGFloat {
      0.60
    }
  }

#endif
