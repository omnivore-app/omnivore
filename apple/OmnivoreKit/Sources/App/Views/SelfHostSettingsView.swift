#if os(iOS)
  import Models
  import Services
  import SwiftUI
  import Utils
  import Views

  class SelfHostSettingsViewModel: ObservableObject {
    @State var showCreateError = false
  }

  struct SelfHostSettingsView: View {
    @State var apiServerAddress = UserDefaults.standard.string(forKey: AppEnvironmentUserDefaultKey.serverBaseURL.rawValue) ?? ""
    @State var webServerAddress = UserDefaults.standard.string(forKey: AppEnvironmentUserDefaultKey.webAppBaseURL.rawValue) ?? ""
    @State var ttsServerAddress = UserDefaults.standard.string(forKey: AppEnvironmentUserDefaultKey.ttsBaseURL.rawValue) ?? ""

    @State var showConfirmAlert = false

    @Environment(\.dismiss) private var dismiss

    @EnvironmentObject var dataService: DataService
    @StateObject var viewModel = SelfHostSettingsViewModel()

    var allFieldsSet: Bool {
      apiServerAddress.count > 0 && webServerAddress.count > 0 && ttsServerAddress.count > 0
    }

    var saveButton: some View {
      Button(action: {
        showConfirmAlert = true
      }, label: {
        Text(LocalText.genericSave)
      })
        .disabled(!allFieldsSet)
    }

    var body: some View {
      Form {
        Section("API Server Base URL") {
          TextField("URL", text: $apiServerAddress, prompt: Text("https://api-prod.omnivore.app"))
            .keyboardType(.URL)
            .autocorrectionDisabled(true)
            .textInputAutocapitalization(.never)
        }

        Section("Web Server URL") {
          TextField("URL", text: $webServerAddress, prompt: Text("https://omnivore.app"))
            .keyboardType(.URL)
            .autocorrectionDisabled(true)
            .textInputAutocapitalization(.never)
        }

        Section("Text-to-speech Server URL") {
          TextField("URL", text: $ttsServerAddress, prompt: Text("https://tts.omnivore.app"))
            .keyboardType(.URL)
            .autocorrectionDisabled(true)
            .textInputAutocapitalization(.never)
        }

        Section {
          Section {
            Text("""
            Omnivore is a free and open-source project and allows self-hosting.

            If you have chosen to deploy your own server instance, fill in the \
            above fields to connect to your private self-hosted instance.

            [Learn more about self-hosting Omnivore](https://docs.omnivore.app/self-hosting/self-hosting.html)
            """)
              .accentColor(.blue)
          }
        }
      }
      .accentColor(.appGrayText)
      .alert(isPresented: $showConfirmAlert) {
        Alert(
          title: Text("Changing your environment settings will close the app."),
          dismissButton: .cancel(Text(LocalText.genericOk)) {
            AppEnvironment.setCustom(serverBaseURL: apiServerAddress,
                                     webAppBaseURL: webServerAddress,
                                     ttsBaseURL: ttsServerAddress)
            dataService.switchAppEnvironment(appEnvironment: AppEnvironment.custom)
          }
        )
      }
      .navigationViewStyle(.stack)
      .navigationTitle("Self-hosting Options")
      .navigationBarTitleDisplayMode(.inline)
      .navigationBarItems(leading:
        Button(action: {
          dismiss()
        }, label: { Text(LocalText.cancelGeneric) }),
        trailing: saveButton)
    }
  }
#endif
