// swiftlint:disable weak_delegate
import App
import SwiftUI
import Utils

#if os(macOS)
  import AppKit
  import Views
#elseif os(iOS)
  import Intercom
  import UIKit
#endif

@main
struct MainApp: App {
  #if os(macOS)
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @AppStorage(UserDefaultKey.preferredWebFont.rawValue) var preferredFont = WebFont.inter.rawValue
    @AppStorage(UserDefaultKey.prefersHighContrastWebFont.rawValue) var prefersHighContrastText = true
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
        MacMenuCommands(
          preferredFont: $preferredFont,
          prefersHighContrastText: $prefersHighContrastText
        )
      }
      .onChange(of: preferredFont) { _ in
        NSNotification.readerSettingsChanged()
      }
      .onChange(of: prefersHighContrastText) { _ in
        NSNotification.readerSettingsChanged()
      }
    #endif
  }
}
