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
  @Published var linkRequest: LinkRequest?
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

  func configurePDFProvider(pdfViewerProvider: @escaping (URL, PDFViewerViewModel) -> AnyView) {
    guard PDFProvider.pdfViewerProvider == nil else { return }

    PDFProvider.pdfViewerProvider = { [weak self] url, linkedItem in
      guard let self = self else { return AnyView(Text("")) }
      return pdfViewerProvider(url, PDFViewerViewModel(services: self.services, linkedItem: linkedItem))
    }
  }

  func webAppWrapperViewModel(webLinkPath: String) -> WebAppWrapperViewModel {
    let baseURL = services.dataService.appEnvironment.webAppBaseURL

    let urlRequest = URLRequest.webRequest(
      baseURL: services.dataService.appEnvironment.webAppBaseURL,
      urlPath: webLinkPath,
      queryParams: ["isAppEmbedView": "true", "highlightBarDisabled": isMacApp ? "false" : "true"]
    )

    return WebAppWrapperViewModel(
      webViewURLRequest: urlRequest,
      baseURL: baseURL,
      rawAuthCookie: services.authenticator.omnivoreAuthCookieString
    )
  }

  @MainActor func onOpenURL(url: URL) async {
    if let linkRequestID = DeepLink.make(from: url)?.linkRequestID {
      linkRequest = LinkRequest(id: UUID(), serverID: linkRequestID)
    }
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
