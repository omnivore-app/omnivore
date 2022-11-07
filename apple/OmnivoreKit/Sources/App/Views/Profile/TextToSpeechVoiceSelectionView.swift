#if os(iOS)
  import Models
  import Services
  import SwiftUI
  import Views

  struct TextToSpeechVoiceSelectionView: View {
    @EnvironmentObject var audioController: AudioController
    let language: VoiceLanguage
    let showLanguageChanger: Bool

    @State var playbackSample: String? = nil

    init(forLanguage: VoiceLanguage, showLanguageChanger: Bool) {
      self.language = forLanguage
      self.showLanguageChanger = showLanguageChanger
    }

    var body: some View {
      Group {
        Form {
          Toggle("Use Ultra Realistic Voices", isOn: $audioController.useUltraRealisticVoices)
            .accentColor(Color.green)

          if audioController.useUltraRealisticVoices {
            Section {
              Text("Ultra realistic voices take longer to generate and do not offer a follow along user interface.")
                .multilineTextAlignment(.leading)
            }
            ultraRealisticVoices
          } else {
            if showLanguageChanger {
              Section("Language") {
                NavigationLink(destination: TextToSpeechLanguageView().navigationTitle("Language")) {
                  Text(audioController.currentVoiceLanguage.name)
                }
              }
            }
            standardVoices
          }
        }
      }
      .navigationTitle("Choose a Voice")
    }

    private var standardVoices: some View {
      ForEach(language.categories, id: \.self) { category in
        Section(category.rawValue) {
          ForEach(audioController.voiceList?.filter { $0.category == category } ?? [], id: \.key.self) { voice in
            voiceRow(for: voice)
          }
        }
      }
    }

    private var ultraRealisticVoices: some View {
      ForEach([VoiceCategory.enUS, VoiceCategory.enCA, VoiceCategory.enUK], id: \.self) { category in
        Section(category.rawValue) {
          ForEach(audioController.realisticVoiceList?.filter { $0.category == category } ?? [], id: \.key.self) { voice in
            voiceRow(for: voice)
          }
        }
      }
    }

    func voiceRow(for voice: VoiceItem) -> some View {
      HStack {
        Button(action: {
          if audioController.isPlayingSample(voice: voice.key) {
            playbackSample = nil
            audioController.stopVoiceSample()
          } else {
            playbackSample = voice.key
            audioController.playVoiceSample(voice: voice.key)
            Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { timer in
              let playing = audioController.isPlayingSample(voice: voice.key)
              if playing {
                playbackSample = voice.key
              } else if !playing {
                // If the playback sample is something else, its taken ownership
                // of the value so we just ignore it and shut down our timer.
                if playbackSample == voice.key {
                  playbackSample = nil
                }
                timer.invalidate()
              }
            }
          }
        }, label: {
          if playbackSample == voice.key {
            Image(systemName: "stop.circle")
              .font(.appTitleTwo)
              .padding(.trailing, 16)
          } else {
            Image(systemName: "play.circle")
              .font(.appTitleTwo)
              .padding(.trailing, 16)
          }
        })

        Button(action: {
          audioController.setPreferredVoice(voice.key, forLanguage: language.key)
          audioController.currentVoice = voice.key
        }, label: {
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
        })
          .buttonStyle(PlainButtonStyle())
      }
    }
  }
#endif
