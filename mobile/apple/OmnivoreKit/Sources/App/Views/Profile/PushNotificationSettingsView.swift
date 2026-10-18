#if os(iOS)
  import Models
  import Services
  import SwiftUI
  import Utils
  import Views
  import Transmission

@MainActor final class PushNotificationSettingsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var isLoadingRules = true

  @Published var emails = [NewsletterEmail]()
  @Published var desiredNotificationsEnabled = false
  @Published var allSubscriptionsNotificationRule: Rule?
  @Published var hasSubscriptionsNotifyRule = false
  @Published var showOperationToast = false
  @Published var operationStatus: OperationStatus = .none
  @Published var operationMessage: String?

  let subscriptionRuleName = "system.autoNotify.subscriptions"

  @AppStorage(UserDefaultKey.notificationsEnabled.rawValue) var notificationsEnabled = false

  func checkPushNotificationsStatus() {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
      DispatchQueue.main.async {
        let desired = UserDefaults.standard.bool(forKey: UserDefaultKey.notificationsEnabled.rawValue)
        self.desiredNotificationsEnabled = desired && settings.alertSetting == UNNotificationSetting.enabled
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

  func loadRule(dataService: DataService) async {
    do {
      let rule = try await dataService.rules().filter { $0.name == subscriptionRuleName }.first
      setAllSubscriptionRule(rule: rule)
    } catch {
      print("error fetching", error)
      setAllSubscriptionRule(rule: nil)
    }
  }

  func setAllSubscriptionRule(rule: Rule?) {
    allSubscriptionsNotificationRule = rule
    hasSubscriptionsNotifyRule = allSubscriptionsNotificationRule != nil
    isLoadingRules = false
  }

  func createSubscriptionNotificationRule(dataService: DataService) {
    if allSubscriptionsNotificationRule != nil {
      return
    }

    operationMessage = "Creating notification rule..."
    operationStatus = .isPerforming
    showOperationToast = true

    Task {
      do {
        let rule = try await dataService.createNotificationRule(
          name: subscriptionRuleName,
          filter: "in:all has:subscription"
        )
        setAllSubscriptionRule(rule: rule)
        operationMessage = "Rule created"
        operationStatus = .success
      } catch {
        print("error creating notification rule: ", error)
        operationMessage = "Failed to create notification rule"
        operationStatus = .failure
      }
    }
  }

  func deleteSubscriptionNotificationRule(dataService: DataService) {
    operationMessage = "Creating label rule..."
    operationStatus = .isPerforming
    showOperationToast = true

    Task {
      do {
        if let allSubscriptionsNotificationRule = allSubscriptionsNotificationRule {
          _ = try await dataService.deleteRule(ruleID: allSubscriptionsNotificationRule.id)
          setAllSubscriptionRule(rule: nil)
          operationMessage = "Notification rule deleted"
          operationStatus = .success
        }
      } catch {
        operationMessage = "Failed to create label rule"
        operationStatus = .failure
      }
    }
  }
}

  struct PushNotificationSettingsView: View {
    @EnvironmentObject var dataService: DataService
    @Environment(\.dismiss) private var dismiss

    @StateObject var viewModel = PushNotificationSettingsViewModel()
    @State var desiredNotificationsEnabled: Bool = false

    var body: some View {
      Group {
        WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $viewModel.showOperationToast) {
          OperationToast(operationMessage: $viewModel.operationMessage, showOperationToast: $viewModel.showOperationToast, operationStatus: $viewModel.operationStatus)
        } label: {
          EmptyView()
        }.buttonStyle(.plain)

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
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("ScrollToTop"))) { _ in
        dismiss()
      }
      .task {
        viewModel.checkPushNotificationsStatus()
        await viewModel.loadRule(dataService: dataService)
      }
    }

    private var notificationsText: some View {
      let markdown = "\(LocalText.notificationsExplainer)\n\n\(LocalText.notificationsTriggerExplainer)"
      if let notificationsText = try? AttributedString(
        markdown: markdown,
        options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace)
      ) {
        return Text(notificationsText)
          .accentColor(.blue)
      }
      return Text(markdown)
        .accentColor(.blue)
    }

    private var rulesSection: some View {
      if viewModel.isLoadingRules {
        AnyView(EmptyView())
      } else {
        AnyView(Toggle("Notify me when new items arrive from my subscriptions", isOn: $viewModel.hasSubscriptionsNotifyRule))
      }
    }

    private var innerBody: some View {
      Group {
        Section {
          Toggle(isOn: $viewModel.desiredNotificationsEnabled, label: { Text(LocalText.notificationsEnabled) })
        }.onChange(of: viewModel.desiredNotificationsEnabled) { _ in
          viewModel.tryUpdateToDesired(dataService: dataService)
        }

        Section {
          notificationsText
        }

        Section {
          rulesSection
        }

        Section {
          NavigationLink("Devices") {
            PushNotificationDevicesView()
          }
        }
      }
      .onChange(of: viewModel.hasSubscriptionsNotifyRule) { newValue in
          print("has notification rule: \(newValue)")
        if viewModel.isLoadingRules {
          return
        }

        if newValue {
          viewModel.createSubscriptionNotificationRule(dataService: dataService)
        } else {
          viewModel.deleteSubscriptionNotificationRule(dataService: dataService)
        }
      }
      .onChange(of: viewModel.operationStatus) { newValue in
        if newValue == .success  || newValue == .failure {
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1000)) {
            viewModel.showOperationToast = false
          }
        }
      }
      .navigationTitle(LocalText.pushNotificationsGeneric)
    }
  }
#endif
