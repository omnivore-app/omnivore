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

  @Published public var showNewFeaturePrimer = false
  @AppStorage(UserDefaultKey.shouldShowNewFeaturePrimer.rawValue) var shouldShowNewFeaturePrimer = false

  @Published var showMiniPlayer = false
  @Published var showSnackbar = false
  @Published var snackbarOperation: SnackbarOperation?

  public init() {
    registerFonts()

    if let viewer = services.dataService.currentViewer {
      EventTracker.registerUser(userID: viewer.unwrappedUserID)
    }

    #if DEBUG
      if CommandLine.arguments.contains("--uitesting") {
        services.authenticator.logout(dataService: services.dataService)
      }
    #endif
  }

  #if os(iOS)
    func handlePushNotificationPrimerAcceptance() {
//      UNUserNotificationCenter.current().requestAuth()
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
