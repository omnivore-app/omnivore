import Models
import Services
import SwiftUI
import Utils
import Views

public struct RootView: View {
  @Environment(\.scenePhase) var scenePhase
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
      .environment(\.managedObjectContext, viewModel.services.dataService.viewContext)
      .onAppear {
        if let pdfViewerProvider = pdfViewerProvider {
          viewModel.configurePDFProvider(pdfViewerProvider: pdfViewerProvider)
        }
      }
      .onChange(of: scenePhase) { phase in
        if phase == .background {
          Services.scheduleBackgroundFetch()
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
        .snackBar(isShowing: $viewModel.showSnackbar, message: viewModel.snackbarMessage)
        // Schedule the dismissal every time we present the snackbar.
        .onChange(of: viewModel.showSnackbar) { newValue in
          if newValue {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
              withAnimation {
                viewModel.showSnackbar = false
              }
            }
          }
        }
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
