#if os(iOS)
  import UIKit

  public extension UIDevice {
    static var isIPad: Bool {
      UIDevice.current.userInterfaceIdiom == .pad
    }

    static var isIPhone: Bool {
      UIDevice.current.userInterfaceIdiom == .phone
    }
  }
#endif
