import Services
import SwiftUI
import Utils
import Views

struct SafariWebLinkPath: Identifiable {
  let id: UUID
  let path: String
}

public struct RootView: View {
  let pdfViewerProvider: ((URL, PDFViewerViewModel) -> AnyView)?
  @StateObject private var viewModel = RootViewModel()

  public init(
    pdfViewerProvider: ((URL, PDFViewerViewModel) -> AnyView)?,
    intercomProvider: IntercomProvider?
  ) {
    self.pdfViewerProvider = pdfViewerProvider

    if let intercomProvider = intercomProvider {
      DataService.showIntercomMessenger = intercomProvider.showIntercomMessenger
      DataService.registerIntercomUser = intercomProvider.registerIntercomUser
      Authenticator.unregisterIntercomUser = intercomProvider.unregisterIntercomUser
    }
  }

  public var body: some View {
    InnerRootView(viewModel: viewModel)
      .environmentObject(viewModel.services.authenticator)
      .environmentObject(viewModel.services.dataService)
      .onAppear {
        if let pdfViewerProvider = pdfViewerProvider {
          viewModel.configurePDFProvider(pdfViewerProvider: pdfViewerProvider)
        }
      }
  }
}

struct InnerRootView: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var authenticator: Authenticator

  @ObservedObject var viewModel: RootViewModel

  @ViewBuilder private var innerBody: some View {
    if authenticator.isLoggedIn {
      PrimaryContentView()
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

  var body: some View {
    Group {
      #if os(iOS)
        innerBody
      #elseif os(macOS)
        innerBody
          .frame(minWidth: 400, idealWidth: 1200, minHeight: 400, idealHeight: 1200)
      #endif
    }
    #if os(iOS)
      .onOpenURL { url in
        withoutAnimation {
          if viewModel.webLinkPath != nil {
            viewModel.webLinkPath = nil
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
              Task { await viewModel.onOpenURL(url: url) }
            }
          } else {
            Task { await viewModel.onOpenURL(url: url) }
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
