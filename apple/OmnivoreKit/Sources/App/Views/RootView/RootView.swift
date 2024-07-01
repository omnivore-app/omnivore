import Models
import OSLog
import Services
import SwiftUI
import Utils
import Views

let appLogger = Logger(subsystem: "app.omnivore", category: "app-package")

@MainActor
public struct RootView: View {
  @Environment(\.scenePhase) var scenePhase
  @StateObject private var viewModel = RootViewModel()

  public init(intercomProvider: IntercomProvider?) {
    if let intercomProvider = intercomProvider {
      DataService.showIntercomMessenger = intercomProvider.showIntercomMessenger
      DataService.registerIntercomUser = intercomProvider.registerIntercomUser
      DataService.setIntercomUserHash = intercomProvider.setIntercomUserHash
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

@MainActor
struct InnerRootView: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var authenticator: Authenticator

  @ObservedObject var viewModel: RootViewModel

  @ViewBuilder private var innerBody: some View {
    if authenticator.isLoggedIn, dataService.appEnvironment.environmentConfigured {
      PrimaryContentView()
        .task {
          try? await dataService.syncOfflineItemsWithServerIfNeeded()
        }
    } else {
      if authenticator.isLoggingOut {
        LogoutView()
      } else {
        WelcomeView()
          .accessibilityElement()
          .accessibilityIdentifier("welcomeView")
      }
    }
  }

  var body: some View {
    Group {
      #if os(iOS)
        innerBody
      #elseif os(macOS)
        innerBody
          .frame(minWidth: 400, idealWidth: 1200, minHeight: 600, idealHeight: 1200)
      #endif
    }
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

