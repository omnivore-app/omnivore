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
      #if DEBUG
        if CommandLine.arguments.contains("--uitesting") {
          configureForUITests()
        }
      #endif
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

      EventTracker.start()

      if let intercomKeys = AppKeys.sharedInstance?.intercom {
        Intercom.setApiKey(intercomKeys.apiKey, forAppId: intercomKeys.appID)

        if let userId = UserDefaults.standard.string(forKey: Keys.userIdKey) {
          Intercom.registerUser(withUserId: userId)
        } else {
          Intercom.registerUnidentifiedUser()
        }
      }

      Services.registerBackgroundFetch()
      configurePushNotifications()
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
