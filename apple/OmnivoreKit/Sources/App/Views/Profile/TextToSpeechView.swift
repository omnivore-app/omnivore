#if os(iOS)
  import Models
  import Services
  import SwiftUI
  import Views

  struct TextToSpeechView: View {
    @EnvironmentObject var audioController: AudioController

    var body: some View {
      Group {
        Form {
          Section("Audio Settings") {
            Toggle("Enable audio prefetch", isOn: $audioController.preloadEnabled)
          }
          NavigationLink(destination: TextToSpeechLanguageView().navigationTitle("Default Language")) {
            Text("Default Language")
          }
          innerBody
        }
      }
    }

    private var innerBody: some View {
      Section("Voices") {
        ForEach(Voices.Languages, id: \.key) { language in
          NavigationLink(destination: TextToSpeechVoiceSelectionView(forLanguage: language, showLanguageChanger: false)) {
            Text(language.name)
          }
        }
      }
    }
  }
#endif
