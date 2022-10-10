//
//  MiniPlayer.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import Foundation
import Models
import Services
import SwiftUI
import Views

public struct MiniPlayer: View {
  @EnvironmentObject var audioController: AudioController
  @Environment(\.colorScheme) private var colorScheme: ColorScheme
  private let presentingView: AnyView

  @State var expanded = false
  @State var offset: CGFloat = 0
  @State var showVoiceSheet = false
  @State var showLanguageSheet = false

  @State var tabIndex: Int = 0
  @Namespace private var animation

  let minExpandedHeight = UIScreen.main.bounds.height / 3

  init<PresentingView>(
    presentingView: PresentingView
  ) where PresentingView: View {
    self.presentingView = AnyView(presentingView)
  }

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
            .font(expanded ? .system(size: 56.0, weight: .thin) : .appTitleTwo)
        }
      ))
    }
  }

  var stopButton: some View {
    Button(
      action: {
        audioController.stop()
      },
      label: {
        Image(systemName: "xmark")
          .font(.appTitleTwo)
      }
    )
  }

  var closeButton: some View {
    Button(
      action: {
        withAnimation(.interactiveSpring()) {
          self.expanded = false
        }
      },
      label: {
        Image(systemName: "chevron.down")
          .font(.appNavbarIcon)
          .tint(.appGrayTextContrast)
      }
    )
    // .contentShape(Rectangle())
  }

  func viewArticle() {
    if let objectID = audioController.itemAudioProperties?.objectID {
      NSNotification.pushReaderItem(objectID: objectID)
      withAnimation(.easeIn(duration: 0.1)) {
        expanded = false
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

  // swiftlint:disable:next function_body_length
  func playerContent(_ itemAudioProperties: LinkedItemAudioProperties) -> some View {
    GeometryReader { geom in
      VStack(spacing: 0) {
        if expanded {
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
          }
        } else {
          HStack(alignment: .center, spacing: 8) {
            let dim = 64.0

            if let imageURL = itemAudioProperties.imageURL {
              AsyncImage(url: imageURL) { phase in
                if let image = phase.image {
                  image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: dim, height: dim)
                    .cornerRadius(6)
                } else if phase.error != nil {
                  defaultArtwork(forDimensions: dim)
                } else {
                  Color.appButtonBackground
                    .frame(width: dim, height: dim)
                    .cornerRadius(6)
                }
              }
            } else {
              defaultArtwork(forDimensions: dim)
            }

            VStack {
              Text(itemAudioProperties.title)
                .font(.appCallout)
                .foregroundColor(.appGrayTextContrast)
                .fixedSize(horizontal: false, vertical: false)
                .frame(maxWidth: .infinity, alignment: .leading)

              if let byline = itemAudioProperties.byline {
                Text(byline)
                  .font(.appCaption)
                  .lineSpacing(1.25)
                  .foregroundColor(.appGrayText)
                  .fixedSize(horizontal: false, vertical: false)
                  .frame(maxWidth: .infinity, alignment: .leading)
              }
            }

            playPauseButtonItem
              .frame(width: 28, height: 28)

            stopButton
              .frame(width: 28, height: 28)
          }
          .padding(16)
          .frame(maxHeight: .infinity)
        }

        if expanded {
          ZStack {
            TabView(selection: $tabIndex) {
              ForEach(0 ..< (self.audioController.textItems?.count ?? 0), id: \.self) { id in
                SpeechCard(id: id)
                  .frame(width: geom.size.width)
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
              if index >= (audioController.textItems?.count ?? 0) {
                return
              }

              if self.audioController.state != .reachedEnd {
                tabIndex = index
              }
            })
            .frame(width: geom.size.width)

            if audioController.state == .reachedEnd {
              // If we have reached the end display a replay button
              Button(
                action: {
                  tabIndex = 0
                  audioController.unpause()
                  audioController.seek(to: 0.0)
                },
                label: {
                  Image(systemName: "gobackward")
                    .font(.appCallout)
                    .tint(.appGrayTextContrast)
                  Text("Replay")
                }
              )
            }
          }

          Spacer()

          Group {
            ScrubberView(value: $audioController.timeElapsed,
                         minValue: 0, maxValue: self.audioController.duration,
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

          HStack(alignment: .center, spacing: 36) {
            Menu {
              playbackRateButton(rate: 1.0, title: "1.0×", selected: audioController.playbackRate == 1.0)
              playbackRateButton(rate: 1.1, title: "1.1×", selected: audioController.playbackRate == 1.1)
              playbackRateButton(rate: 1.2, title: "1.2×", selected: audioController.playbackRate == 1.2)
              playbackRateButton(rate: 1.5, title: "1.5×", selected: audioController.playbackRate == 1.5)
              playbackRateButton(rate: 1.7, title: "1.7×", selected: audioController.playbackRate == 1.7)
              playbackRateButton(rate: 2.0, title: "2.0×", selected: audioController.playbackRate == 2.0)
            } label: {
              VStack {
                Text(String(format: "%.1f×", audioController.playbackRate))
                  .font(.appCallout)
                  .lineLimit(0)
              }
              .contentShape(Rectangle())
            }
            .padding(8)

            Button(
              action: { self.audioController.skipBackwards(seconds: 30) },
              label: {
                Image(systemName: "gobackward.30")
                  .font(.appTitleTwo)
              }
            )

            playPauseButtonItem
              .frame(width: 56, height: 56)

            Button(
              action: { self.audioController.skipForward(seconds: 30) },
              label: {
                Image(systemName: "goforward.30")
                  .font(.appTitleTwo)
              }
            )

            Menu {
              Button("View Article", action: { viewArticle() })
              Button("Change Voice", action: { showVoiceSheet = true })
            } label: {
              VStack {
                Image(systemName: "ellipsis")
                  .font(.appCallout)
                  .frame(width: 20, height: 20)
              }
              .contentShape(Rectangle())
            }
            .padding(8)
          }.padding(.bottom, 16)
        }
      }
      .padding(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
      .background(
        Color.systemBackground
          .shadow(color: expanded ? .clear : .gray.opacity(0.33), radius: 8, x: 0, y: 4)
          .mask(Rectangle().padding(.top, -20))
      )
      .onTapGesture {
        withAnimation(.easeIn(duration: 0.08)) { expanded = true }
      }.sheet(isPresented: $showVoiceSheet) {
        NavigationView {
          TextToSpeechVoiceSelectionView(forLanguage: audioController.currentVoiceLanguage, showLanguageChanger: true)
            .navigationBarTitle("Voice")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(leading: Button(action: { self.showVoiceSheet = false }) {
              Image(systemName: "chevron.backward")
                .font(.appNavbarIcon)
                .tint(.appGrayTextContrast)
            })
        }
      }.sheet(isPresented: $showLanguageSheet) {
        NavigationView {
          TextToSpeechLanguageView()
            .navigationBarTitle("Language")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(leading: Button(action: { self.showLanguageSheet = false }) {
              Image(systemName: "chevron.backward")
                .font(.appNavbarIcon)
                .tint(.appGrayTextContrast)
            })
        }
      }
    }
  }

  func playbackRateButton(rate: Double, title: String, selected: Bool) -> some View {
    Button(action: {
      audioController.playbackRate = rate
    }) {
      HStack {
        Text(title)
        Spacer()
        if selected {
          Image(systemName: "checkmark")
        }
      }
      .contentShape(Rectangle())
    }
    .buttonStyle(PlainButtonStyle())
  }

  public var body: some View {
    ZStack(alignment: .center) {
      presentingView
      if let itemAudioProperties = self.audioController.itemAudioProperties, isPresented {
        ZStack(alignment: .bottom) {
          Color.systemBackground.edgesIgnoringSafeArea(.bottom)
            .frame(height: 88, alignment: .bottom)

          VStack {
            Spacer(minLength: 0)
            playerContent(itemAudioProperties)
              .offset(y: offset)
              .frame(maxHeight: expanded ? .infinity : 88)
              .tint(.appGrayTextContrast)
              .gesture(DragGesture().onEnded(onDragEnded(value:)).onChanged(onDragChanged(value:)))
              .background(expanded ? .clear : .systemBackground)
          }
        }
      }
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
            }) {
              HStack {
                Text(voice.name)

                Spacer()

                if voice.selected {
                  Image(systemName: "checkmark")
                }
              }
              .contentShape(Rectangle())
            }
            .buttonStyle(PlainButtonStyle())
          }
        }
        .padding(.top, 32)
        .listStyle(.plain)
        Spacer()
      }
      .navigationBarTitle("Voice")
      .navigationBarTitleDisplayMode(.inline)
      .navigationBarItems(leading: Button(action: { self.showVoiceSheet = false }) {
        Image(systemName: "chevron.backward")
          .font(.appNavbarIcon)
          .tint(.appGrayTextContrast)
      })
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

  func onDragChanged(value: DragGesture.Value) {
    if value.translation.height > 0, expanded, !scrubbing {
      offset = value.translation.height
    }
  }

  func onDragEnded(value: DragGesture.Value) {
    withAnimation(.interactiveSpring()) {
      if value.translation.height > minExpandedHeight, !scrubbing {
        expanded = false
      }
      offset = 0
    }
  }
}

public extension View {
  func miniPlayer() -> some View {
    MiniPlayer(presentingView: self)
  }
}
