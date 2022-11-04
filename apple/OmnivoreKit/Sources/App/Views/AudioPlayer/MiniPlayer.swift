#if os(iOS)

  import Foundation
  import Models
  import Services
  import SwiftUI
  import Utils
  import Views

  public struct MiniPlayer: View {
    @EnvironmentObject var audioController: AudioController
    @Environment(\.colorScheme) private var colorScheme: ColorScheme
    private let presentingView: AnyView

    @AppStorage(UserDefaultKey.audioPlayerExpanded.rawValue) var expanded = true

    init<PresentingView>(
      presentingView: PresentingView
    ) where PresentingView: View {
      self.presentingView = AnyView(presentingView)
    }

    var isPresented: Bool {
      let presented = audioController.itemAudioProperties != nil && audioController.state != .stopped
      if !presented {
        print("isPresented: ", audioController.itemAudioProperties, audioController.state)
      }
      return true // presented
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
              .font(.appTitleTwo)
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

    func artwork(_ itemAudioProperties: LinkedItemAudioProperties, forDimensions dim: Double) -> some View {
      if let imageURL = itemAudioProperties.imageURL {
        return AnyView(AsyncImage(url: imageURL) { phase in
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
        })
      }
      return AnyView(defaultArtwork(forDimensions: dim))
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

    func playerContent(_ itemAudioProperties: LinkedItemAudioProperties) -> some View {
      VStack(spacing: 0) {
        HStack(alignment: .center, spacing: 8) {
          artwork(itemAudioProperties, forDimensions: 64)

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
      .padding(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
      .background(
        Color.systemBackground
          .shadow(color: .gray.opacity(0.33), radius: 8, x: 0, y: 4)
          .mask(Rectangle().padding(.top, -20))
      )
      .onTapGesture {
        withAnimation(.easeIn(duration: 0.08)) { expanded = true }
      }.sheet(isPresented: $expanded) {
        ExpandedPlayer()
      }
      .offset(y: expanded ? 88 : 0)
      .opacity(expanded ? 0.0 : 1.0)
    }

    public var body: some View {
      ZStack(alignment: .center) {
        presentingView
        if let itemAudioProperties = self.audioController.itemAudioProperties, isPresented {
          ZStack(alignment: .bottom) {
            Color.systemBackground.edgesIgnoringSafeArea(.bottom)
              .frame(height: expanded ? 0 : 88, alignment: .bottom)

            VStack {
              Spacer(minLength: 0)
              playerContent(itemAudioProperties)
                .frame(maxHeight: expanded ? 0 : 88)
                .tint(.appGrayTextContrast)
                .background(Color.systemBackground)
            }
          }
        }
      }.alert("There was an error playing back your audio.",
              isPresented: $audioController.playbackError) {
        Button("Dismiss", role: .none) {}
      }
    }
  }

  public extension View {
    func miniPlayer() -> some View {
      MiniPlayer(presentingView: self)
    }
  }
#endif
