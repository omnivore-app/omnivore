import Foundation
import Models
import Services
import SwiftUI
import Utils
import Views

#if os(iOS)
  let isMacApp = false
#elseif os(macOS)
  let isMacApp = true
#endif

public final class RootViewModel: ObservableObject {
  let services = Services()

  @Published public var showPushNotificationPrimer = false
  @Published var snackbarMessage: String?
  @Published var showSnackbar = false

  public init() {
    registerFonts()

    if let viewer = services.dataService.currentViewer {
      EventTracker.registerUser(userID: viewer.unwrappedUserID)
    }

    #if DEBUG
      if CommandLine.arguments.contains("--uitesting") {
        services.authenticator.logout()
      }
    #endif
  }

  func triggerPushNotificationRequestIfNeeded() {
    guard FeatureFlag.enablePushNotifications else { return }

    if UserDefaults.standard.bool(forKey: UserDefaultKey.userHasDeniedPushPrimer.rawValue) {
      return
    }

    #if os(iOS)
      UNUserNotificationCenter.current().getNotificationSettings { [weak self] settings in
        switch settings.authorizationStatus {
        case .notDetermined:
          DispatchQueue.main.async {
            self?.showPushNotificationPrimer = true
          }
        case .authorized, .provisional, .ephemeral, .denied:
          return
        @unknown default:
          return
        }
      }
    #endif
  }

  #if os(iOS)
    func handlePushNotificationPrimerAcceptance() {
      showPushNotificationPrimer = false
      UNUserNotificationCenter.current().requestAuth()
    }
  #endif
}

public struct IntercomProvider {
  public init(
    registerIntercomUser: @escaping (String) -> Void,
    unregisterIntercomUser: @escaping () -> Void,
    showIntercomMessenger: @escaping () -> Void
  ) {
    self.registerIntercomUser = registerIntercomUser
    self.unregisterIntercomUser = unregisterIntercomUser
    self.showIntercomMessenger = showIntercomMessenger
  }

  public let registerIntercomUser: (String) -> Void
  public let unregisterIntercomUser: () -> Void
  public let showIntercomMessenger: () -> Void
}
