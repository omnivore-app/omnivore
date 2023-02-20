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

    var stopButton: some View {
      Button(
        action: {
          audioController.stop()
        },
        label: {
          ZStack {
            Circle()
              .foregroundColor(Color(hex: "#3D3D3D"))

            Image(systemName: "xmark")
              .resizable(resizingMode: Image.ResizingMode.stretch)
              .foregroundColor(Color(hex: "#D9D9D9"))
              .aspectRatio(contentMode: .fit)
              .font(Font.title.weight(.medium))
              .frame(width: 14, height: 14)
          }
        }
      )
      .background(Color.clear)
      .buttonStyle(PlainButtonStyle())
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
        HStack(alignment: .center, spacing: 15) {
          artwork(itemAudioProperties, forDimensions: 50)

          Text(itemAudioProperties.title)
            .font(Font.system(size: 17, weight: .medium))
            .fixedSize(horizontal: false, vertical: true)
            .lineLimit(2)
            .foregroundColor(.appGrayTextContrast)
            .frame(maxHeight: 40, alignment: .leading)

          Spacer(minLength: 0)

          playPauseButtonItem
            .frame(width: 40, height: 40)
            .foregroundColor(.themeDarkGray)

          stopButton
            .frame(width: 40, height: 40)
            .foregroundColor(.themeDarkGray)
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
      }.fullScreenCover(isPresented: $expanded) {
        ExpandedPlayer()
      }
      .offset(y: expanded ? 110 : 0)
    }

    public var body: some View {
      ZStack(alignment: .center) {
        presentingView
        if let itemAudioProperties = self.audioController.itemAudioProperties {
          ZStack(alignment: .bottom) {
            Color.systemBackground.edgesIgnoringSafeArea(.bottom)
              .frame(height: expanded ? 0 : 110, alignment: .bottom)

            VStack {
              Spacer(minLength: 0)
              playerContent(itemAudioProperties)
                .frame(maxHeight: expanded ? 0 : 110)
              //    .tint(.appGrayTextContrast)
              // .background(Color.systemBackground)
            }
          }
        }
      }.alert("There was an error playing back your audio.",
              isPresented: $audioController.playbackError) {
        Button(LocalText.dismissButton, role: .none) {}
      }
    }
  }

  public extension View {
    func miniPlayer() -> some View {
      MiniPlayer(presentingView: self)
    }
  }
#endif
