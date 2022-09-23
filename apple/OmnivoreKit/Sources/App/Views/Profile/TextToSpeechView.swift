import Models
import Services
import SwiftUI
import Views

struct TextToSpeechView: View {
  @EnvironmentObject var audioController: AudioController

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          Section("Audio Settings") {
            Toggle("Enable audio prefetch", isOn: $audioController.preloadEnabled)
          }
          NavigationLink(destination: TextToSpeechLanguageView().navigationTitle("Default Language")) {
            Text("Default Language")
          }
          innerBody
        }
      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
  }

  private var innerBody: some View {
    Section("Voices") {
      ForEach(VOICELANGUAGES, id: \.key) { language in
        NavigationLink(destination: TextToSpeechVoiceSelectionView(forLanguage: language)) {
          Text(language.name)
        }
      }
    }
  }
}
