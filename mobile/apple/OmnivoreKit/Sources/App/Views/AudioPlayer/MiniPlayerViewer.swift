#if os(iOS)

  import Foundation
  import Models
  import Services
  import SwiftUI
  import Utils
  import Views

  public struct MiniPlayerViewer: View {
    var showStopButton = true
    @EnvironmentObject var audioController: AudioController
    @Environment(\.colorScheme) private var colorScheme: ColorScheme

    @State var expanded = true

    var playPauseButtonImage: String {
#if targetEnvironment(simulator)
      return "play.circle"
#endif
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
#if targetEnvironment(simulator)
      return AnyView(Button(
        action: {},
        label: {
          Image(systemName: playPauseButtonImage)
            .resizable(resizingMode: Image.ResizingMode.stretch)
            .aspectRatio(contentMode: .fit)
            .font(Font.title.weight(.light))
        }
      ).buttonStyle(.plain))
#endif
      if audioController.playbackError {
        return AnyView(Color.clear)
      }
      if audioController.isLoadingItem(audioController.itemAudioProperties) {
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
        ).buttonStyle(.plain)
        )
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
      .buttonStyle(.plain)
      .background(Color.clear)
      .buttonStyle(PlainButtonStyle())
    }

    func artwork(_ itemAudioProperties: AudioItemProperties?, forDimensions dim: Double) -> some View {
      if let imageURL = itemAudioProperties?.imageURL {
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

        Image.headphones
          .resizable()
          .aspectRatio(contentMode: .fit)
          .frame(width: dim / 2, height: dim / 2)
      }
    }

    public var body: some View {
      VStack(spacing: 0) {
        HStack(alignment: .center, spacing: 15) {
          if audioController.playbackError {
            Text("There was an error playing back your audio.").foregroundColor(Color.red).font(.footnote)
            Spacer(minLength: 0)
          } else {
            artwork(audioController.itemAudioProperties, forDimensions: 50)

            Text(audioController.itemAudioProperties?.title ?? "")
              .font(Font.system(size: 17, weight: .medium))
              .fixedSize(horizontal: false, vertical: true)
              .lineLimit(2)
              .foregroundColor(.appGrayTextContrast)
              .frame(maxHeight: 40, alignment: .leading)

            Spacer(minLength: 0)

            playPauseButtonItem
              .frame(width: 40, height: 40)
              .foregroundColor(.themeAudioPlayerGray)
          }
          if showStopButton {
            stopButton
              .frame(width: 40, height: 40)
              .foregroundColor(.themeAudioPlayerGray)
          }
        }
        .padding(.vertical, 5)
        .padding(.horizontal, 15)
        .frame(maxHeight: .infinity)
      }
      .padding(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
      .background(
        Color.themeTabBarColor
      )
      .frame(height: 60)
    }
  }

#endif
