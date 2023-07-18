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
      GeometryReader { geo in
        PrimaryContentView()
        #if os(iOS)
          .miniPlayer()
          .formSheet(isPresented: $viewModel.showNewFeaturePrimer,
                     modalSize: CGSize(width: geo.size.width * 0.66, height: geo.size.width * 0.66)) {
            FeaturePrimer.recommendationsPrimer
          }
          .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(300)) {
              viewModel.showNewFeaturePrimer = viewModel.shouldShowNewFeaturePrimer
              viewModel.shouldShowNewFeaturePrimer = false
            }
          }
        #endif
        .snackBar(isShowing: $viewModel.showSnackbar, operation: viewModel.snackbarOperation)
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
      }
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
          viewModel.snackbarOperation = SnackbarOperation(message: message,
                                                          undoAction: notification.userInfo?["undoAction"] as? SnackbarUndoAction)
          viewModel.showSnackbar = true
        }
      }
      .onReceive(NSNotification.operationFailedPublisher) { notification in
        if let message = notification.userInfo?["message"] as? String {
          viewModel.showSnackbar = true
          viewModel.snackbarOperation = SnackbarOperation(message: message, undoAction: nil)
        }
      }
    #endif
    .onOpenURL { Authenticator.handleGoogleURL(url: $0) }
  }

  #if os(iOS)
//    private var pushNotificationPrimerView: PushNotificationPrimer {
//      PushNotificationPrimer(
//        acceptAction: { viewModel.handlePushNotificationPrimerAcceptance() },
//        denyAction: {
//          UserDefaults.standard.set(true, forKey: UserDefaultKey.userHasDeniedPushPrimer.rawValue)
//          viewModel.showPushNotificationPrimer = false
//        }
//      )
//    }
  #endif
}
