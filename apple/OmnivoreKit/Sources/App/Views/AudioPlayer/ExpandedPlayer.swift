#if os(iOS)

  import Foundation
  import Models
  import Services
  import SwiftUI
  import Views

  public struct ExpandedPlayer: View {
    @EnvironmentObject var audioController: AudioController
    @Environment(\.colorScheme) private var colorScheme: ColorScheme
    @Environment(\.dismiss) private var dismiss

    @State var showVoiceSheet = false
    @State var tabIndex: Int = 0

    var isPresented: Bool {
      audioController.itemAudioProperties != nil && audioController.state != .stopped
    }

    var playPauseButtonImage: String {
      switch audioController.state {
      case .playing:
        return "pause.circle"
      case .paused:
        return "play.circle"
      case .reachedEnd:
        return "gobackward"
      default:
        return ""
      }
    }

    var playPauseButtonItem: some View {
      if let itemID = audioController.itemAudioProperties?.itemID, audioController.isLoadingItem(itemID: itemID) {
        return AnyView(ProgressView())
      } else {
        return AnyView(Button(
          action: {
            switch audioController.state {
            case .playing:
              audioController.pause()
            case .paused:
              audioController.unpause()
            case .reachedEnd:
              audioController.seek(to: 0.0)
              audioController.unpause()
            default:
              break
            }
          },
          label: {
            Image(systemName: playPauseButtonImage)
              .font(.appIconLarge)
          }
        ))
      }
    }

    var closeButton: some View {
      Button(
        action: {
          dismiss()
        },
        label: {
          ZStack {
            Circle()
              .foregroundColor(Color.appGrayText)
              .frame(width: 36, height: 36)
              .opacity(0.1)

            Image(systemName: "chevron.down")
              .font(.appCallout)
              .frame(width: 36, height: 36)
          }
        }
      )
    }

    var menuButton: some View {
      Menu {
        Menu(String(format: "Playback Speed (%.1f×)", audioController.playbackRate)) {
          playbackRateButton(rate: 1.0, title: "1.0×", selected: audioController.playbackRate == 1.0)
          playbackRateButton(rate: 1.1, title: "1.1×", selected: audioController.playbackRate == 1.1)
          playbackRateButton(rate: 1.2, title: "1.2×", selected: audioController.playbackRate == 1.2)
          playbackRateButton(rate: 1.5, title: "1.5×", selected: audioController.playbackRate == 1.5)
          playbackRateButton(rate: 1.7, title: "1.7×", selected: audioController.playbackRate == 1.7)
          playbackRateButton(rate: 2.0, title: "2.0×", selected: audioController.playbackRate == 2.0)
        }
        Button(action: { showVoiceSheet = true }, label: { Label("Change Voice", systemImage: "person.wave.2") })
        Button(action: { viewArticle() }, label: { Label("View Article", systemImage: "book") })
        Button(action: { audioController.stop() }, label: { Label("Stop", systemImage: "xmark.circle") })
        Button(action: { dismiss() }, label: { Label("Dismiss", systemImage: "arrow.down.to.line") })
      } label: {
        ZStack {
          Circle()
            .foregroundColor(Color.appGrayText)
            .frame(width: 36, height: 36)
            .opacity(0.1)

          Image(systemName: "ellipsis")
            .font(.appCallout)
            .frame(width: 36, height: 36)
        }
      }
      .padding(8)
    }

    func viewArticle() {
      if let objectID = audioController.itemAudioProperties?.objectID {
        NSNotification.pushReaderItem(objectID: objectID)
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
          dismiss()
        }
      }
    }

    func defaultArtwork(forDimensions dim: Double) -> some View {
      ZStack(alignment: .center) {
        Color.appButtonBackground
          .frame(width: dim, height: dim)
          .cornerRadius(6)

        Image(systemName: "headphones")
          .resizable()
          .aspectRatio(contentMode: .fit)
          .frame(width: dim / 2, height: dim / 2)
      }
    }

    struct SpeechCard: View {
      let id: Int
      @EnvironmentObject var audioController: AudioController

      var body: some View {
        Group {
          if id != self.audioController.currentAudioIndex || self.audioController.isLoading {
            Text(self.audioController.textItems?[id] ?? "\(id)")
              .font(.textToSpeechRead.leading(.loose))
              .foregroundColor(Color.appGrayTextContrast)
          } else {
            Group {
              Text(audioController.readText)
                .font(.textToSpeechRead.leading(.loose))
                .foregroundColor(Color.appGrayTextContrast)
                +
                Text(audioController.unreadText)
                .font(.textToSpeechRead.leading(.loose))
                .foregroundColor(Color.appGrayText)
            }
          }
        }
        .padding(16)
      }

      init(id: Int) {
        self.id = id
      }
    }

    var audioCards: some View {
      ZStack {
        let textItems = self.audioController.textItems ?? []
        if textItems.count > 0 {
          TabView(selection: $tabIndex) {
            ForEach(0 ..< textItems.count, id: \.self) { id in
              SpeechCard(id: id)
                .tag(id)
            }
          }
          .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
          .onChange(of: tabIndex, perform: { index in
            if index != audioController.currentAudioIndex, index < (audioController.textItems?.count ?? 0) {
              audioController.seek(toUtterance: index)
            }
          })
          .onChange(of: audioController.currentAudioIndex, perform: { index in
            if index >= textItems.count {
              return
            }

            if self.audioController.state != .reachedEnd {
              tabIndex = index
            }
          })
        }

        if audioController.state == .reachedEnd {
          // If we have reached the end display a replay button with an overlay behind
          Color.systemBackground.opacity(0.85)
            .frame(
              minWidth: 0,
              maxWidth: .infinity,
              minHeight: 0,
              maxHeight: .infinity,
              alignment: .topLeading
            )

          Button(
            action: {
              tabIndex = 0
              audioController.unpause()
              audioController.seek(to: 0.0)
            },
            label: {
              HStack {
                Image(systemName: "gobackward")
                  .font(.appCallout)
                  .tint(.appGrayTextContrast)
                Text("Replay")
              }
            }
          ).buttonStyle(RoundedRectButtonStyle())
        }
      }
    }

    var header: some View {
      ZStack {
        closeButton
          .padding(.top, 24)
          .padding(.leading, 16)
          .frame(maxWidth: .infinity, alignment: .leading)

        Capsule()
          .fill(.gray)
          .frame(width: 60, height: 4)
          .padding(.top, 8)
          .transition(.opacity)

        menuButton
          .padding(.top, 24)
          .padding(.trailing, 16)
          .frame(maxWidth: .infinity, alignment: .trailing)
      }
    }

    var scrubber: some View {
      Group {
        ScrubberView(value: $audioController.timeElapsed,
                     maxValue: $audioController.duration,
                     onEditingChanged: { scrubStarted in
                       if scrubStarted {
                         self.audioController.scrubState = .scrubStarted
                       } else {
                         self.audioController.scrubState = .scrubEnded(self.audioController.timeElapsed)
                       }
                     })

        HStack {
          Text(audioController.timeElapsedString ?? "0:00")
            .font(.appCaptionTwo)
            .foregroundColor(.appGrayText)
          Spacer()
          Text(audioController.durationString ?? "0:00")
            .font(.appCaptionTwo)
            .foregroundColor(.appGrayText)
        }
      }
      .padding(.leading, 16)
      .padding(.trailing, 16)
    }

    var audioButtons: some View {
      HStack(alignment: .center) {
        Spacer()

        Button(
          action: { self.audioController.skipBackwards(seconds: 30) },
          label: {
            Image(systemName: "gobackward.30")
              .font(.appTitleTwo)
          }
        )

        Spacer()

        playPauseButtonItem
          .frame(width: 56, height: 56)

        Spacer()

        Button(
          action: { self.audioController.skipForward(seconds: 30) },
          label: {
            Image(systemName: "goforward.30")
              .font(.appTitleTwo)
          }
        )
        Spacer()

      }.padding(.bottom, 16)
    }

    func playerContent(_: LinkedItemAudioProperties) -> some View {
      VStack(spacing: 0) {
        header

        audioCards

        Spacer()

        scrubber

        audioButtons
      }
      .padding(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
      .onAppear {
        self.tabIndex = audioController.currentAudioIndex
      }
      .onChange(of: audioController.state, perform: { state in
        // Reset the tabIndex when we load a new audio item
        if state == .loading {
          tabIndex = 0
        }
      })
      .sheet(isPresented: $showVoiceSheet) {
        NavigationView {
          TextToSpeechVoiceSelectionView(forLanguage: audioController.currentVoiceLanguage, showLanguageChanger: true)
            .navigationBarTitle("Voice")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(leading: Button(action: { self.showVoiceSheet = false }, label: {
              Image(systemName: "chevron.backward")
                .font(.appNavbarIcon)
                .tint(.appGrayTextContrast)
            }))
        }
      }
    }

    func playbackRateButton(rate: Double, title: String, selected: Bool) -> some View {
      Button(action: {
        audioController.playbackRate = rate
      }, label: {
        HStack {
          Text(title)
          Spacer()
          if selected {
            Image(systemName: "checkmark")
          }
        }
        .contentShape(Rectangle())
      })
        .buttonStyle(PlainButtonStyle())
    }

    public var body: some View {
      if let itemAudioProperties = self.audioController.itemAudioProperties, isPresented {
        playerContent(itemAudioProperties)
          .tint(.appGrayTextContrast)
      } else {
        EmptyView()
      }
    }

    var changeVoiceView: some View {
      NavigationView {
        VStack {
          List {
            ForEach(audioController.voiceList ?? [], id: \.key.self) { voice in
              Button(action: {
                audioController.currentVoice = voice.key
                self.showVoiceSheet = false
              }, label: {
                HStack {
                  Text(voice.name)

                  Spacer()

                  if voice.selected {
                    Image(systemName: "checkmark")
                  }
                }
                .contentShape(Rectangle())
              }).buttonStyle(PlainButtonStyle())
            }
          }
          .padding(.top, 32)
          .listStyle(.plain)
          Spacer()
        }
        .navigationBarTitle("Voice")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarItems(leading: Button(action: { self.showVoiceSheet = false }, label: {
          Image(systemName: "chevron.backward")
            .font(.appNavbarIcon)
            .tint(.appGrayTextContrast)
        }))
      }
    }

    var scrubbing: Bool {
      switch audioController.scrubState {
      case .scrubStarted:
        return true
      default:
        return false
      }
    }
  }
#endif
