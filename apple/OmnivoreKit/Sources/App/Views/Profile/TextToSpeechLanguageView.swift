#if os(iOS)
  import Models
  import Services
  import SwiftUI
  import Views

  struct TextToSpeechLanguageView: View {
    @EnvironmentObject var audioController: AudioController
    @Environment(\.dismiss) private var dismiss

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
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("ScrollToTop"))) { _ in
        dismiss()
      }
    }

    private var innerBody: some View {
      ForEach(Voices.Languages, id: \.key.self) { language in
        Button {
          audioController.defaultLanguage = language.key
        } label: {
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
