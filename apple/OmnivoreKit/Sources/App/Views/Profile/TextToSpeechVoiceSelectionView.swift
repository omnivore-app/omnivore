#if os(iOS)
  import Models
  import Services
  import SwiftUI
  import Utils
  import Views

  struct TextToSpeechVoiceSelectionView: View {
    @EnvironmentObject var audioController: AudioController
    @EnvironmentObject var dataService: DataService

    @StateObject var viewModel = TextToSpeechVoiceSelectionViewModel()

    let language: VoiceLanguage
    let showLanguageChanger: Bool

    init(forLanguage: VoiceLanguage, showLanguageChanger: Bool) {
      self.language = forLanguage
      self.showLanguageChanger = showLanguageChanger
    }

    var body: some View {
      Group {
        Form {
          if language.key == "en" {
            if viewModel.waitingForRealisticVoices {
              HStack {
                Text("Signing up for beta")
                Spacer()
                ProgressView()
              }
            } else {
              Toggle("Use Ultra Realistic Voices", isOn: $viewModel.realisticVoicesToggle)
                .accentColor(Color.green)
            }

            if !viewModel.waitingForRealisticVoices, !audioController.ultraRealisticFeatureKey.isEmpty {
              Text("You are in the ultra realistic voices beta. During the beta you can listen to 10,000 words of audio per day.")
                .multilineTextAlignment(.leading)
            } else if audioController.ultraRealisticFeatureRequested {
              Text("Your request to join the ultra realistic voices demo has been received. You will be informed by email when a spot is available.")
                .multilineTextAlignment(.leading)
            } else {
              Text("Ultra realistic voices are currently in limited beta. Enabling the feature will add you to the beta queue.")
                .multilineTextAlignment(.leading)
            }
          }

          if audioController.useUltraRealisticVoices {
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
      .onAppear {
        viewModel.realisticVoicesToggle = (audioController.useUltraRealisticVoices && !audioController.ultraRealisticFeatureKey.isEmpty)
      }.onChange(of: viewModel.realisticVoicesToggle) { value in
        if value, audioController.ultraRealisticFeatureKey.isEmpty {
          // User wants to sign up
          viewModel.waitingForRealisticVoices = true
          Task {
            await viewModel.requestUltraRealisticFeatureAccess(
              dataService: self.dataService,
              audioController: audioController
            )
          }
        } else if value, !audioController.ultraRealisticFeatureKey.isEmpty {
          audioController.useUltraRealisticVoices = true
        } else if !value {
          audioController.useUltraRealisticVoices = false
        }
      }
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
            viewModel.playbackSample = nil
            audioController.stopVoiceSample()
          } else {
            viewModel.playbackSample = voice.key
            audioController.playVoiceSample(voice: voice.key)
            Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { timer in
              let playing = audioController.isPlayingSample(voice: voice.key)
              if playing {
                viewModel.playbackSample = voice.key
              } else if !playing {
                // If the playback sample is something else, its taken ownership
                // of the value so we just ignore it and shut down our timer.
                if viewModel.playbackSample == voice.key {
                  viewModel.playbackSample = nil
                }
                timer.invalidate()
              }
            }
          }
        }, label: {
          if viewModel.playbackSample == voice.key {
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
