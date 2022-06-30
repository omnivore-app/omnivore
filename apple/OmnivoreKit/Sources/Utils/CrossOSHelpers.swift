import SwiftUI

#if os(iOS)
  import UIKit
  public typealias PlatformViewController = UIViewController
  public typealias PlatformViewRepresentable = UIViewRepresentable
  public typealias PlatformHostingController = UIHostingController
  let osVersion = UIDevice.current.systemVersion
  public let userAgent = "ios-\(osVersion)"
#elseif os(macOS)
  import AppKit
  public typealias PlatformViewController = NSViewController
  public typealias PlatformHostingController = NSHostingController
  public typealias PlatformViewRepresentable = NSViewRepresentable
  let osVersion = ProcessInfo.processInfo.operatingSystemVersion
  public let userAgent = "macos-\(osVersion)"

  extension NSTextView {
    override open var frame: CGRect {
      didSet {
        backgroundColor = .clear
        drawsBackground = true
      }
    }
  }
#endif
