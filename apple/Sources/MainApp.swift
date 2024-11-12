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
    @AppStorage(UserDefaultKey.justifyText.rawValue) var justifyText = false
    @AppStorage(UserDefaultKey.themeName.rawValue) var currentThemeName = "System"

  #elseif os(iOS)
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
  #endif

  var body: some Scene {
    #if os(iOS)
      WindowGroup {
        RootView(
          intercomProvider: AppKeys.sharedInstance?.intercom != nil ? IntercomProvider(
            registerIntercomUser: { userId in
              let userAttributes = ICMUserAttributes()
              userAttributes.userId = userId
              Intercom.loginUser(with: userAttributes)
            },
            setIntercomUserHash: { Intercom.setUserHash($0) },
            unregisterIntercomUser: Intercom.logout,
            showIntercomMessenger: Intercom.present
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
          prefersHighContrastText: $prefersHighContrastText,
          justifyText: $justifyText,
          currentThemeName: $currentThemeName
        )
      }
      .onChange(of: preferredFont) { _ in
        NSNotification.readerSettingsChanged()
      }
      .onChange(of: prefersHighContrastText) { _ in
        NSNotification.readerSettingsChanged()
      }
      .onChange(of: justifyText) { _ in
        NSNotification.readerSettingsChanged()
      }
      .onChange(of: currentThemeName) { _ in
        NSNotification.readerSettingsChanged()
      }

    #endif
  }
}
