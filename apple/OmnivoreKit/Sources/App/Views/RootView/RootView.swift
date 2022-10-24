import Models
import OSLog
import Services
import SwiftUI
import Utils
import Views

let appLogger = Logger(subsystem: "app.omnivore", category: "app-package")

public struct RootView: View {
  @Environment(\.scenePhase) var scenePhase
  @StateObject private var viewModel = RootViewModel()

  public init(intercomProvider: IntercomProvider?) {
    if let intercomProvider = intercomProvider {
      DataService.showIntercomMessenger = intercomProvider.showIntercomMessenger
      DataService.registerIntercomUser = intercomProvider.registerIntercomUser
      Authenticator.unregisterIntercomUser = intercomProvider.unregisterIntercomUser
    }

    #if os(iOS)
      PDFReaderViewController.registerKey()
    #endif
  }

  public var body: some View {
    InnerRootView(viewModel: viewModel)
      .environmentObject(viewModel.services.authenticator)
      .environmentObject(viewModel.services.dataService)
      .environmentObject(viewModel.services.audioController)
      .environment(\.managedObjectContext, viewModel.services.dataService.viewContext)
      .onChange(of: scenePhase) { phase in
        if phase == .background {
          #if os(iOS)
            Services.scheduleBackgroundFetch()
          #endif
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
        .miniPlayer()
      #endif
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
    .onOpenURL { Authenticator.handleGoogleURL(url: $0) }
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
