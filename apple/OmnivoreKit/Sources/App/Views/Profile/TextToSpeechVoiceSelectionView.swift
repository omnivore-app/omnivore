#if os(iOS)
  import Models
  import Services
  import SwiftUI
  import Views

  struct TextToSpeechVoiceSelectionView: View {
    @EnvironmentObject var audioController: AudioController
    let language: VoiceLanguage
    let showLanguageChanger: Bool

    init(forLanguage: VoiceLanguage, showLanguageChanger: Bool) {
      self.language = forLanguage
      self.showLanguageChanger = showLanguageChanger
    }

    var body: some View {
      Group {
        Form {
          if showLanguageChanger {
            Section("Language") {
              NavigationLink(destination: TextToSpeechLanguageView().navigationTitle("Language")) {
                Text(audioController.currentVoiceLanguage.name)
              }
            }
          }
          innerBody
        }
      }
      .navigationTitle("Choose a Voice")
    }

    private var innerBody: some View {
      ForEach(language.categories, id: \.self) { category in
        Section(category.rawValue) {
          ForEach(audioController.voiceList?.filter { $0.category == category } ?? [], id: \.key.self) { voice in
            HStack {
              // Voice samples are not working yet
//            Button(action: {
//              audioController.playVoiceSample(voice: voice.key)
//            }) {
//              Image(systemName: "play.circle").font(.appTitleTwo)
//            }
//            .buttonStyle(PlainButtonStyle())

              Button(action: {
                audioController.setPreferredVoice(voice.key, forLanguage: language.key)
                audioController.currentVoice = voice.key
              }) {
                HStack {
                  Text(voice.name)
                  Spacer()

                  if voice.selected {
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
      }
    }
  }
#endif
