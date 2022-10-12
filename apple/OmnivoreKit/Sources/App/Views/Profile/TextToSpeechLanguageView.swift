#if os(iOS)
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
      ForEach(Voices.Languages, id: \.key.self) { language in
        Button(action: {
          audioController.defaultLanguage = language.key
        }) {
          HStack {
            Text(language.name)

            Spacer()

            if audioController.defaultLanguage == language.key {
              if audioController.isPlaying, audioController.isLoading {
                ProgressView()
              } else {
                Image(systemName: "checkmark")
              }
            }
          }
          .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
      }
    }
  }
#endif
