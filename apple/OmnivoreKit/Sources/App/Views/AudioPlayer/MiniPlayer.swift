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
  @EnvironmentObject var audioSession: AudioSession
  @Environment(\.colorScheme) private var colorScheme: ColorScheme
  private let presentingView: AnyView

  @State var expanded = true
  @State var offset: CGFloat = 0

  let minExpandedHeight = UIScreen.main.bounds.height / 3

  init<PresentingView>(
    presentingView: PresentingView
  ) where PresentingView: View {
    self.presentingView = AnyView(presentingView)
  }

  var isPresented: Bool {
    audioSession.item != nil && audioSession.state != .stopped
  }

  var playPauseButtonItem: some View {
    if let item = audioSession.item, audioSession.isLoadingItem(item: item) {
      return AnyView(ProgressView())
    } else {
      return AnyView(Button(
        action: {
          switch audioSession.state {
          case .playing:
            audioSession.pause()
          case .paused:
            audioSession.unpause()
          default:
            break
          }
        },
        label: {
          Image(systemName: audioSession.state == .playing ? "pause.circle" : "play.circle")
            .font(expanded ? .system(size: 64.0, weight: .thin) : .appTitleTwo)
        }
      ))
    }
  }

  var stopButton: some View {
    Button(
      action: {
        audioSession.stop()
      },
      label: {
        Image(systemName: "xmark")
          .font(.appTitleTwo)
      }
    )
  }

  var playerView: some View {
    if let item = audioSession.item {
      return AnyView(playerContent(item)
//        .padding()
        .animation(.spring(), value: true)
        .tint(.appGrayTextContrast))
    } else {
      return AnyView(EmptyView())
    }
  }

  // swiftlint:disable:next function_body_length
  func playerContent(_ item: LinkedItem) -> some View {
    GeometryReader { geom in
      VStack {
        if expanded {
          Capsule()
            .fill(.gray)
            .frame(width: 60, height: 4)
            .padding(.top, 8)

          Spacer(minLength: 0)
        }

        HStack {
          if expanded {
            Spacer()
          }

          Group {
            if let imageURL = item.imageURL {
              let dim = expanded ? 2 * (min(geom.size.width, geom.size.height) / 3) : 64
              AsyncLoadingImage(url: imageURL) { imageStatus in
                if case let AsyncImageStatus.loaded(image) = imageStatus {
                  image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: dim, height: dim)
                    .cornerRadius(6)
                } else if case AsyncImageStatus.loading = imageStatus {
                  Color.appButtonBackground
                    .frame(width: dim, height: dim)
                    .cornerRadius(6)
                } else {
                  EmptyView().frame(width: dim, height: dim, alignment: .top)
                }
              }
            }
          }

          if !expanded {
            Text(item.unwrappedTitle)
              .font(expanded ? .appTitle : .appCallout)
              .lineSpacing(1.25)
              .foregroundColor(.appGrayTextContrast)
              .fixedSize(horizontal: false, vertical: false)
              .frame(maxWidth: .infinity, alignment: expanded ? .center : .leading)

            playPauseButtonItem
              .frame(width: 28, height: 28)

            stopButton
              .frame(width: 28, height: 28)
          }

          if expanded {
            Spacer()
          }
        }

        if expanded {
          if expanded {
            Spacer()
          }

          Text(item.unwrappedTitle)
            .lineLimit(1)
            .font(expanded ? .appTitle : .appCallout)
            .lineSpacing(1.25)
            .foregroundColor(.appGrayTextContrast)
            .frame(maxWidth: .infinity, alignment: expanded ? .center : .leading)

          HStack {
            Spacer()
            if let author = item.author {
              Text(author)
                .lineLimit(1)
                .font(.appCallout)
                .lineSpacing(1.25)
                .foregroundColor(.appGrayText)
                .frame(alignment: .trailing)
            }
            if item.author != nil, item.siteName != nil {
              Text(" • ")
                .font(.appCallout)
                .lineSpacing(1.25)
                .foregroundColor(.appGrayText)
            }
            if let site = item.siteName {
              Text(site)
                .lineLimit(1)
                .font(.appCallout)
                .lineSpacing(1.25)
                .foregroundColor(.appGrayText)
                .frame(alignment: .leading)
            }
            Spacer()
          }

          Slider(value: $audioSession.timeElapsed,
                 in: 0 ... self.audioSession.duration,
                 onEditingChanged: { scrubStarted in
                   if scrubStarted {
                     self.audioSession.scrubState = .scrubStarted
                   } else {
                     self.audioSession.scrubState = .scrubEnded(self.audioSession.timeElapsed)
                   }
                 })
            .accentColor(.appCtaYellow)
            .introspectSlider { slider in
              // Make the thumb a little smaller than the default and give it the CTA color
              // for some reason this doesn't work on my iPad though.
              let tintColor = UIColor(Color.appCtaYellow)

              let image = UIImage(systemName: "circle.fill",
                                  withConfiguration: UIImage.SymbolConfiguration(scale: .small))?
                .withTintColor(tintColor)
                .withRenderingMode(.alwaysOriginal)

              slider.setThumbImage(image, for: .selected)
              slider.setThumbImage(image, for: .normal)

              slider.minimumTrackTintColor = tintColor
              slider.value = 10
            }

          HStack {
            Text(audioSession.timeElapsedString ?? "0:00")
              .font(.appCaptionTwo)
              .foregroundColor(.appGrayText)
            Spacer()
            Text(audioSession.durationString ?? "0:00")
              .font(.appCaptionTwo)
              .foregroundColor(.appGrayText)
          }

          HStack {
            Button(
              action: { self.audioSession.skipBackwards(seconds: 30) },
              label: {
                Image(systemName: "gobackward.30")
                  .font(.appTitleTwo)
              }
            )

            playPauseButtonItem
              .frame(width: 64, height: 64)
              .padding(32)

            Button(
              action: { self.audioSession.skipForward(seconds: 30) },
              label: {
                Image(systemName: "goforward.30")
                  .font(.appTitleTwo)
              }
            )
          }
        }
      }
      .padding(EdgeInsets(top: 0, leading: expanded ? 24 : 6, bottom: 0, trailing: expanded ? 24 : 6))
      .background(
        Color.systemBackground
          .onTapGesture {
            withAnimation(.easeIn(duration: 0.08)) { expanded = true }
          }
//          .shadow(color: expanded ? .clear : .gray.opacity(0.33), radius: 8, x: 0, y: 4)
//          .mask(Rectangle().padding(.top, -20))
      )
    }
  }

  public var body: some View {
    ZStack(alignment: .center) {
      presentingView
      VStack {
        Spacer()
        if let item = self.audioSession.item, isPresented {
          VStack {
            Spacer()
            playerContent(item)
              .frame(maxHeight: expanded ? .infinity : 88)
              .offset(y: offset)
              .gesture(DragGesture().onEnded(onDragEnded(value:)).onChanged(onDragChanged(value:)))
          }
          .padding(0)
        }
      }
    }
  }

  func onDragChanged(value: DragGesture.Value) {
    if value.translation.height > 0, expanded {
      offset = value.translation.height
    }
    print("transition: ", value.translation.height)
    if value.translation.height < 0 {
      expanded = true
    }
  }

  func onDragEnded(value: DragGesture.Value) {
    withAnimation(.interactiveSpring()) {
      if value.translation.height > minExpandedHeight {
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
