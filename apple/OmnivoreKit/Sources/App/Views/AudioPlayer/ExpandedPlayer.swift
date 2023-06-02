#if os(iOS)
  import Foundation
  import Models
  import Services
  import SwiftUI
  import Views

  // swiftlint:disable file_length type_body_length
  public struct ExpandedPlayer: View {
    @EnvironmentObject var audioController: AudioController
    @Environment(\.colorScheme) private var colorScheme: ColorScheme
    @Environment(\.dismiss) private var dismiss

    @State var showVoiceSheet = false
    @State var tabIndex: Int = 0

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
              .resizable(resizingMode: Image.ResizingMode.stretch)
              .aspectRatio(contentMode: .fit)
              .font(Font.title.weight(.light))
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
          playbackRateButton(rate: 0.8, title: "0.8×", selected: audioController.playbackRate == 0.8)
          playbackRateButton(rate: 0.9, title: "0.9×", selected: audioController.playbackRate == 0.9)
          playbackRateButton(rate: 1.0, title: "1.0×", selected: audioController.playbackRate == 1.0)
          playbackRateButton(rate: 1.1, title: "1.1×", selected: audioController.playbackRate == 1.1)
          playbackRateButton(rate: 1.2, title: "1.2×", selected: audioController.playbackRate == 1.2)
          playbackRateButton(rate: 1.5, title: "1.5×", selected: audioController.playbackRate == 1.5)
          playbackRateButton(rate: 1.7, title: "1.7×", selected: audioController.playbackRate == 1.7)
          playbackRateButton(rate: 2.0, title: "2.0×", selected: audioController.playbackRate == 2.0)
          playbackRateButton(rate: 2.2, title: "2.2×", selected: audioController.playbackRate == 2.2)
          playbackRateButton(rate: 2.5, title: "2.5×", selected: audioController.playbackRate == 2.5)
        }
        Button(action: { showVoiceSheet = true }, label: { Label("Change Voice", systemImage: "person.wave.2") })
        Button(action: { viewArticle() }, label: { Label("View Article", systemImage: "book") })
        Button(action: { audioController.stop() }, label: { Label("Stop", systemImage: "xmark.circle") })
        Button(action: { dismiss() }, label: { Label(LocalText.dismissButton, systemImage: "arrow.down.to.line") })
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

    struct SpeechCard: View {
      let id: Int
      @EnvironmentObject var audioController: AudioController

      var intervalFormatter: DateComponentsFormatter {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.minute, .second]
        formatter.zeroFormattingBehavior = .pad
        return formatter
      }

      var body: some View {
        let isCurrent = id == self.audioController.currentAudioIndex

        ZStack(alignment: .top) {
          Text(intervalFormatter.string(from: self.audioController.offsets?[id] ?? 0.0) ?? "")
            .font(Font.system(size: 11, weight: isCurrent ? .medium : .regular))
            .foregroundColor(isCurrent ? Color.themeTTSReadingText : Color(hex: "#898989"))
            .padding(.leading, 8)
            .padding(.top, 2)
            .frame(maxWidth: .infinity, alignment: .leading)

          if id != self.audioController.currentAudioIndex || self.audioController.isLoading {
            Text(self.audioController.textItems?[id] ?? "\(id)")
              .font(.appCallout)
              .foregroundColor(Color(hex: "#898989"))
              .padding(.leading, 48 + 8)
              .padding(.trailing, 16)
              .frame(maxWidth: .infinity, alignment: .leading)

          } else {
            Group {
              Text(audioController.readText)
                .font(.appTextToSpeechCurrent)
                .foregroundColor(Color.themeTTSReadingText)
                +
                Text(audioController.unreadText)
                .font(.appTextToSpeechCurrent)
                .foregroundColor(Color.themeTTSReadingText)
            }
            .padding(.leading, 48 + 8)
            .padding(.trailing, 16)
            .frame(maxWidth: .infinity, alignment: .leading)
          }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 15)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(isCurrent ? Color.themeHighlightColor : Color.themeDisabledBG)
      }

      init(id: Int) {
        self.id = id
      }
    }

    var audioCards: some View {
      ZStack {
        let textItems = self.audioController.textItems ?? []
        if textItems.count > 0 {
          ScrollViewReader { scroller in
            List {
              ForEach(0 ..< textItems.count, id: \.self) { id in
                SpeechCard(id: id)
                  .tag(id)
                  .onTapGesture {
                    audioController.seek(toUtterance: id)
                  }
                  .listRowSeparator(.hidden)
                  .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
              }
              // Extra bottom padding, so the controls appear to be over the list
              Color.themeDisabledBG
                .frame(maxWidth: .infinity)
                .frame(height: 150)
                .listRowSeparator(.hidden)
                .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
            }
            .listStyle(.plain)
            .onAppear {
              if audioController.currentAudioIndex < textItems.count {
                withAnimation {
                  scroller.scrollTo(audioController.currentAudioIndex, anchor: .center)
                }
              }
            }
            .onChange(of: audioController.currentAudioIndex, perform: { index in
              if index >= textItems.count {
                return
              }

              if self.audioController.state != .reachedEnd {
                withAnimation {
                  scroller.scrollTo(index, anchor: .center)
                }
              }
            })
//            .simultaneousGesture(
//              DragGesture().onChanged {
//                let isScrollDown = $0.translation.height > 0
//                print(isScrollDown)
//              }
//            )
          }
          .background(Color.themeDisabledBG)
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
                Text(LocalText.audioPlayerReplay)
              }
            }
          )
          .padding(.bottom, 138)
          .buttonStyle(RoundedRectButtonStyle())
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
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
          .padding(.top, 26)

        HStack {
          Text(audioController.timeElapsedString ?? "0:00")
            .font(Font.system(size: 10))
            .foregroundColor(Color(hex: "#9D9D9B"))
          Spacer()
          Text(audioController.durationString ?? "0:00")
            .font(Font.system(size: 10))
            .foregroundColor(Color(hex: "#9D9D9B"))
        }
      }
      .padding(.leading, 42)
      .padding(.trailing, 42)
    }

    var audioButtons: some View {
      HStack(alignment: .center) {
        Spacer()

        Button(action: { showVoiceSheet = true }, label: {
          Image(systemName: "person.wave.2")
            .resizable()
            .frame(width: 18, height: 18)
        })
          .padding(.trailing, 32)

        Button(
          action: { self.audioController.skipBackwards(seconds: 15) },
          label: {
            Image(systemName: "gobackward.15")
              .resizable()
              .font(Font.title.weight(.light))
          }
        )
        .frame(width: 16, height: 16)
        .padding(.trailing, 16)
        .foregroundColor(.themeAudioPlayerGray)

        playPauseButtonItem
          .frame(width: 45, height: 45)
          .padding(.trailing, 16)
          .foregroundColor(.themeAudioPlayerGray)

        Button(
          action: { self.audioController.skipForward(seconds: 15) },
          label: {
            Image(systemName: "goforward.15")
              .resizable()
              .font(Font.title.weight(.light))
          }
        )
        .frame(width: 16, height: 16)
        .padding(.trailing, 32 - 4) // -4 to account for the menu touch padding
        .foregroundColor(.themeAudioPlayerGray)

        Menu(content: {
          playbackRateButton(rate: 0.8, title: "0.8×", selected: audioController.playbackRate == 0.8)
          playbackRateButton(rate: 0.9, title: "0.9×", selected: audioController.playbackRate == 0.9)
          playbackRateButton(rate: 1.0, title: "1.0×", selected: audioController.playbackRate == 1.0)
          playbackRateButton(rate: 1.1, title: "1.1×", selected: audioController.playbackRate == 1.1)
          playbackRateButton(rate: 1.2, title: "1.2×", selected: audioController.playbackRate == 1.2)
          playbackRateButton(rate: 1.5, title: "1.5×", selected: audioController.playbackRate == 1.5)
          playbackRateButton(rate: 1.7, title: "1.7×", selected: audioController.playbackRate == 1.7)
          playbackRateButton(rate: 2.0, title: "2.0×", selected: audioController.playbackRate == 2.0)
          playbackRateButton(rate: 2.2, title: "2.2×", selected: audioController.playbackRate == 2.2)
          playbackRateButton(rate: 2.5, title: "2.5×", selected: audioController.playbackRate == 2.5)
        }, label: {
          Text("\(String(format: "%.1f", audioController.playbackRate))×")
            .font(.appCaption)
        })
          .padding(4)

        Spacer()
      }
      .foregroundColor(Color.themeMediumGray)
      .padding(.bottom, 16)
    }

    func playerContent(_: LinkedItemAudioProperties) -> some View {
      ZStack {
        audioCards
          .frame(maxHeight: .infinity)

        VStack {
          Spacer()

          VStack {
            scrubber
            audioButtons
          }
          .padding(.bottom, 8)
          .cornerRadius(8)
          .padding(.bottom, -8)
          .frame(maxWidth: .infinity, maxHeight: 138)
          .background(Color.themeSolidBackground.ignoresSafeArea())
        }
      }
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
            .navigationBarItems(trailing: Button(action: { self.showVoiceSheet = false }, label: {
              Text("Done").bold()
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

    @State var queryString: String = ""

    public var body: some View {
      NavigationView {
        innerBody
          .background(Color.themeDisabledBG)
          .navigationTitle(LocalText.textToSpeechGeneric)
          .navigationBarItems(trailing: Button(action: { dismiss() }, label: { Text("Hide") }))
          .navigationBarTitleDisplayMode(NavigationBarItem.TitleDisplayMode.inline)
        //          .searchable(text: $queryString, placement: .navigationBarDrawer(displayMode: .always)) {
        //            // print("searching: ", queryString)
        //            Text("content")
        //          }
        //          }
      }
    }

    public var innerBody: some View {
      if let itemAudioProperties = self.audioController.itemAudioProperties {
        return AnyView(playerContent(itemAudioProperties)
          .tint(.appGrayTextContrast)
          .alert("There was an error playing back your audio.",
                 isPresented: $audioController.playbackError) {
            Button(LocalText.dismissButton, role: .none) {}
          })
      } else {
        return AnyView(EmptyView())
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
