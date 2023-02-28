import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class PushNotificationSettingsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var emails = [NewsletterEmail]()
  @Published var desiredNotificationsEnabled = false
  @AppStorage(UserDefaultKey.notificationsEnabled.rawValue) var notificationsEnabled = false

  func checkPushNotificationsStatus() {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
      DispatchQueue.main.async {
        self.desiredNotificationsEnabled = settings.alertSetting == UNNotificationSetting.enabled
      }
    }
  }

  func tryUpdateToDesired(dataService: DataService) {
    UserDefaults.standard.set(desiredNotificationsEnabled, forKey: UserDefaultKey.notificationsEnabled.rawValue)

    if desiredNotificationsEnabled {
      UNUserNotificationCenter.current().requestAuthorization(options: [.alert]) { granted, _ in
        DispatchQueue.main.async {
          self.desiredNotificationsEnabled = granted
          Task {
            if let savedToken = UserDefaults.standard.string(forKey: UserDefaultKey.firebasePushToken.rawValue) {
              _ = try? await dataService.syncDeviceToken(
                deviceTokenOperation: DeviceTokenOperation.addToken(token: savedToken))
            }
            NotificationCenter.default.post(name: Notification.Name("ReconfigurePushNotifications"), object: nil)
          }
        }
      }
    } else {
      if let tokenID = UserDefaults.standard.string(forKey: UserDefaultKey.deviceTokenID.rawValue) {
        Task {
          try? await Services().dataService.syncDeviceToken(deviceTokenOperation: .deleteToken(tokenID: tokenID))
        }
      }
    }
  }
}

struct PushNotificationSettingsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = PushNotificationSettingsViewModel()
  @State var desiredNotificationsEnabled: Bool = false

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
        }
      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
    .task { viewModel.checkPushNotificationsStatus() }
  }

  private var innerBody: some View {
    Group {
      Section {
        Toggle(isOn: $viewModel.desiredNotificationsEnabled, label: { Text(LocalText.notificationsEnabled) })
      }.onChange(of: viewModel.desiredNotificationsEnabled) { _ in
        viewModel.tryUpdateToDesired(dataService: dataService)
      }

      Section {
        Text("\(LocalText.notificationsExplainer)\n\(LocalText.notificationsTriggerExplainer)")
          .accentColor(.blue)
      }

      Section {
        NavigationLink("Devices") {
          PushNotificationDevicesView()
        }
      }
    }
    .navigationTitle(LocalText.pushNotificationsGeneric)
  }
}
