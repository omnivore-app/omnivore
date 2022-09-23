import Models
import Services
import SwiftUI
import Views

struct TextToSpeechLanguageView: View {
  @EnvironmentObject var audioController: AudioController

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
  }

  private var innerBody: some View {
    ForEach(VOICELANGUAGES, id: \.key.self) { language in
      Button(action: {
        audioController.defaultLanguage = language.key
      }) {
        HStack {
          Text(language.name)

          Spacer()

          if audioController.defaultLanguage == language.key {
            Image(systemName: "checkmark")
          }
        }
        .contentShape(Rectangle())
      }
      .buttonStyle(PlainButtonStyle())
    }
  }
}
