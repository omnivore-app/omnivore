// swiftlint:disable weak_delegate
import App
import SwiftUI

#if os(macOS)
  import AppKit
#elseif os(iOS)
  import Intercom
  import UIKit
  import Utils
#endif

@main
struct MainApp: App {
  #if os(macOS)
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
  #elseif os(iOS)
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
  #endif

  var body: some Scene {
    #if os(iOS)
      WindowGroup {
        RootView(
          intercomProvider: AppKeys.sharedInstance?.intercom != nil ? IntercomProvider(
            registerIntercomUser: { Intercom.registerUser(withUserId: $0) },
            unregisterIntercomUser: Intercom.logout,
            showIntercomMessenger: Intercom.presentMessenger
          ) : nil
        )
      }
    #elseif os(macOS)
      WindowGroup {
        RootView(intercomProvider: nil)
      }
      .commands {
        MacMenuCommands()
      }
    #endif
  }
}
