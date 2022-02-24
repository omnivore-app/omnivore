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
  @Published fileprivate var webLinkPath: SafariWebLinkPath?
  @Published fileprivate var snackbarMessage: String?
  @Published fileprivate var showSnackbar = false

  public enum Action {}

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init() {
    registerFonts()
  }

  func configurePDFProvider(pdfViewerProvider: @escaping (URL, PDFViewerViewModel) -> AnyView) {
    PDFProvider.pdfViewerProvider = { [weak self] url, feedItem in
      guard let self = self else { return AnyView(Text("")) }
      return pdfViewerProvider(url, PDFViewerViewModel(services: self.services, feedItem: feedItem))
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

  func onOpenURL(url: URL) {
    guard let linkRequestID = DeepLink.make(from: url)?.linkRequestID else { return }

    if let username = services.dataService.currentViewer?.username {
      let path = linkRequestPath(username: username, requestID: linkRequestID)
      webLinkPath = SafariWebLinkPath(id: UUID(), path: path)
      return
    }

    services.dataService.viewerPublisher().sink(
      receiveCompletion: { completion in
        guard case let .failure(error) = completion else { return }
        print(error)
      },
      receiveValue: { [weak self] viewer in
        let path = self?.linkRequestPath(username: viewer.username, requestID: linkRequestID) ?? ""
        self?.webLinkPath = SafariWebLinkPath(id: UUID(), path: path)
      }
    )
    .store(in: &subscriptions)
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

private struct SafariWebLinkPath: Identifiable {
  let id: UUID
  let path: String
}

public struct RootView: View {
  @ObservedObject private var viewModel: RootViewModel
  @ObservedObject private var authenticator: Authenticator

  public init(
    pdfViewerProvider: ((URL, PDFViewerViewModel) -> AnyView)?,
    intercomProvider: IntercomProvider?
  ) {
    let rootViewModel = RootViewModel()
    self.viewModel = rootViewModel
    self.authenticator = rootViewModel.services.authenticator

    #if DEBUG
      if CommandLine.arguments.contains("--uitesting") {
        authenticator.logout()
      }
    #endif

    if let pdfViewerProvider = pdfViewerProvider {
      viewModel.configurePDFProvider(pdfViewerProvider: pdfViewerProvider)
    }

    if let intercomProvider = intercomProvider {
      DataService.showIntercomMessenger = intercomProvider.showIntercomMessenger
      DataService.registerIntercomUser = intercomProvider.registerIntercomUser
      Authenticator.unregisterIntercomUser = intercomProvider.unregisterIntercomUser
    }
  }

  @ViewBuilder private var innerBody: some View {
    if authenticator.isLoggedIn {
      PrimaryContentView(services: viewModel.services)
        .onAppear {
          viewModel.triggerPushNotificationRequestIfNeeded()
        }
      #if os(iOS)
        .fullScreenCover(item: $viewModel.webLinkPath, content: { safariLinkPath in
          NavigationView {
            FullScreenWebAppView(
              viewModel: viewModel.webAppWrapperViewModel(webLinkPath: safariLinkPath.path),
              handleClose: { viewModel.webLinkPath = nil }
            )
          }
        })
      #endif
      .snackBar(
        isShowing: $viewModel.showSnackbar,
        text: Text(viewModel.snackbarMessage ?? "")
      )
      #if os(iOS)
        .customAlert(isPresented: $viewModel.showPushNotificationPrimer) {
          pushNotificationPrimerView
        }
      #endif

    } else {
      WelcomeView()
        .accessibilityElement()
        .accessibilityIdentifier("welcomeView")
    }
  }

  public var body: some View {
    Group {
      #if os(iOS)
        innerBody
      #elseif os(macOS)
        innerBody
          .frame(minWidth: 400, idealWidth: 1200, minHeight: 400, idealHeight: 1200)
      #endif
    }
    .environmentObject(viewModel.services.authenticator)
    .environmentObject(viewModel.services.dataService)
    #if os(iOS)
      .onOpenURL { url in
        withoutAnimation {
          if viewModel.webLinkPath != nil {
            viewModel.webLinkPath = nil
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
              viewModel.onOpenURL(url: url)
            }
          } else {
            viewModel.onOpenURL(url: url)
          }
        }
      }
      .onReceive(NSNotification.operationSuccessPublisher) { notification in
        if let message = notification.userInfo?["message"] as? String {
          viewModel.showSnackbar = true
          viewModel.snackbarMessage = message
        }
      }
      .onReceive(NSNotification.operationFailedPublisher) { notification in
        if let message = notification.userInfo?["message"] as? String {
          viewModel.showSnackbar = true
          viewModel.snackbarMessage = message
        }
      }
    #endif
  }

  #if os(iOS)
    private var pushNotificationPrimerView: PushNotificationPrimer {
      PushNotificationPrimer(
        acceptAction: { viewModel.handlePushNotificationPrimerAcceptance() },
        denyAction: {
          UserDefaults.standard.set(true, forKey: UserDefaultKey.userHasDeniedPushPrimer.rawValue)
          viewModel.showPushNotificationPrimer = false
        }
      )
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

#if os(iOS)
  // Allows us to present a sheet without animation
  // Used to configure full screen modal view coming from share extension read now button action
  private extension View {
    func withoutAnimation(_ completion: @escaping () -> Void) {
      UIView.setAnimationsEnabled(false)
      completion()
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(200)) {
        UIView.setAnimationsEnabled(true)
      }
    }
  }
#endif
