import Combine
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
  @Published var webLinkPath: SafariWebLinkPath?
  @Published var snackbarMessage: String?
  @Published var showSnackbar = false

  public init() {
    registerFonts()

    #if DEBUG
      if CommandLine.arguments.contains("--uitesting") {
        services.authenticator.logout()
      }
    #endif
  }

  func configurePDFProvider(pdfViewerProvider: @escaping (URL, PDFViewerViewModel) -> AnyView) {
    EventTracker.track(TestEvent.testEventTwo(extraData: "invoked #configurePDFprovider function"))
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
    guard let linkRequestID = DeepLink.make(from: url)?.linkRequestID else { return }

    if let username = services.dataService.currentViewer?.username {
      let path = linkRequestPath(username: username, requestID: linkRequestID)
      webLinkPath = SafariWebLinkPath(id: UUID(), path: path)
      return
    }

    if let viewerObjectID = try? await services.dataService.fetchViewer() {
      if let viewer = services.dataService.viewContext.object(with: viewerObjectID) as? Viewer {
        let path = linkRequestPath(username: viewer.unwrappedUsername, requestID: linkRequestID)
        webLinkPath = SafariWebLinkPath(id: UUID(), path: path)
      }
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

  private func linkRequestPath(username: String, requestID: String) -> String {
    "/app/\(username)/link-request/\(requestID)"
  }
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
