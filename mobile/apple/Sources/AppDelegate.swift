import OSLog

#if os(macOS)
  import AppKit
#elseif os(iOS)
  import App
  import Intercom
  import UIKit
  import Utils
  import Views
#endif

private let logger = Logger(subsystem: "app.omnivore", category: "app-delegate")

#if os(macOS)
  class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_: Notification) {
      NSApplication.shared.delegate = self
      NSWindow.allowsAutomaticWindowTabbing = false
      #if DEBUG
        if CommandLine.arguments.contains("--uitesting") {
          configureForUITests()
        }
      #endif
    }

    func applicationWillBecomeActive(_ notification: Notification) {
      (notification.object as? NSApplication)?.windows.first?.makeKeyAndOrderFront(self)
    }

    func applicationShouldHandleReopen(_: NSApplication, hasVisibleWindows _: Bool) -> Bool {
      true
    }
  }

#elseif os(iOS)
  class AppDelegate: NSObject, UIApplicationDelegate {
    // swiftlint:disable:next line_length
    func application(_: UIApplication, didFinishLaunchingWithOptions _: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
      #if DEBUG
        if CommandLine.arguments.contains("--uitesting") {
          configureForUITests()
        }
      #endif

      if let intercomKeys = AppKeys.sharedInstance?.intercom {
        Intercom.setApiKey(intercomKeys.apiKey, forAppId: intercomKeys.appID)

        if let userId = UserDefaults.standard.string(forKey: Keys.userIdKey) {
          let userAttributes = ICMUserAttributes()
          userAttributes.userId = userId
          Intercom.loginUser(with: userAttributes)
        } else {
          Intercom.loginUnidentifiedUser()
        }
      }

      Services.registerBackgroundFetch()
      configureFirebase()

      // TODO: remove after filter badge is re-enabled
      UIApplication.shared.applicationIconBadgeNumber = 0

      // swiftlint:disable:next line_length
      NotificationCenter.default.addObserver(forName: Notification.Name("ReconfigurePushNotifications"), object: nil, queue: OperationQueue.main) { _ in
        if UserDefaults.standard.bool(forKey: UserDefaultKey.notificationsEnabled.rawValue) {
          self.registerForNotifications()
        } else {
          self.unregisterForNotifications()
        }
      }

      return true
    }
  }
#endif

#if DEBUG
  private func configureForUITests() {
    // Clear user defaults
    let defaultsName = Bundle.main.bundleIdentifier!
    UserDefaults.standard.removePersistentDomain(forName: defaultsName)
  }
#endif
