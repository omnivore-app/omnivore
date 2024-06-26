
import Models
import Services
import SwiftUI
import Utils
import Views

class SelfHostSettingsViewModel: ObservableObject {
  @State var showCreateError = false
}

struct SelfHostSettingsView: View {
  @State var apiServerAddress = UserDefaults(suiteName: "group.app.omnivoreapp").string(forKey: AppEnvironmentUserDefaultKey.serverBaseURL.rawValue) ?? ""
  @State var webServerAddress = UserDefaults(suiteName: "group.app.omnivoreapp").string(forKey: AppEnvironmentUserDefaultKey.webAppBaseURL.rawValue) ?? ""
  @State var ttsServerAddress = UserDefaults(suiteName: "group.app.omnivoreapp").string(forKey: AppEnvironmentUserDefaultKey.ttsBaseURL.rawValue) ?? ""

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

  var cancelButton: some View {
    Button(action: {
      dismiss()
    }, label: {
      Text(LocalText.cancelGeneric)
    })
  }

  var body: some View {
    #if os(iOS)
      NavigationView {
        innerBody
      }
    #elseif os(macOS)
      innerBody
    #endif
  }

  var innerBody: some View {
    ScrollView {
      VStack {
        Text("API Server Base URL").frame(maxWidth: .infinity, alignment: .leading)
        TextField("URL", text: $apiServerAddress, prompt: Text("https://api-prod.omnivore.app"))
          .autocorrectionDisabled(true)
        #if os(iOS)
          .keyboardType(.URL)
          .textInputAutocapitalization(.never)
        #endif

        Text("Web Server URL").frame(maxWidth: .infinity, alignment: .leading)
        TextField("URL", text: $webServerAddress, prompt: Text("https://omnivore.app"))
          .autocorrectionDisabled(true)
        #if os(iOS)
          .keyboardType(.URL)
          .textInputAutocapitalization(.never)
        #endif

        Text("Text-to-speech Server URL").frame(maxWidth: .infinity, alignment: .leading)
        TextField("URL", text: $ttsServerAddress, prompt: Text("https://tts.omnivore.app"))
          .autocorrectionDisabled(true)
        #if os(iOS)
          .keyboardType(.URL)
          .textInputAutocapitalization(.never)
        #endif

        Text("""
        Omnivore is a free and open-source project and allows self-hosting.

        If you have chosen to deploy your own server instance, fill in the \
        above fields to connect to your private self-hosted instance.

        [Learn more about self-hosting Omnivore](https://docs.omnivore.app/self-hosting/self-hosting.html)
        """)
          .accentColor(.blue)
          .frame(maxWidth: .infinity, alignment: .leading)

        Button(action: {
          AppEnvironment.setCustom(serverBaseURL: "https://api-prod.omnivore.app",
                                   webAppBaseURL: "https://omnivore.app",
                                   ttsBaseURL: "https://tts.omnivore.app")
          dataService.switchAppEnvironment(appEnvironment: AppEnvironment.prod)
          dismiss()
        }, label: {
          Text("Reset self hosting settings")
        })

        #if os(macOS)
          Spacer()
          HStack {
            cancelButton
            Spacer()
            saveButton
          }
          .frame(maxWidth: .infinity, alignment: .center)
          .padding()
        #endif
      }
    }
    .padding()
    .frame(maxWidth: .infinity, maxHeight: .infinity)

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
    .navigationTitle("Self-hosting Options")
    #if os(iOS)
      .navigationViewStyle(.stack)
      .navigationBarTitleDisplayMode(.inline)
      .navigationBarItems(leading:
        Button(action: {
          dismiss()
        }, label: { Text(LocalText.cancelGeneric) }),
        trailing: saveButton)
    #else
      .frame(minWidth: 400, minHeight: 600)
    #endif
  }
}
