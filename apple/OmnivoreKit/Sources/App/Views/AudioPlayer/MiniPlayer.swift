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

struct DynamicStack<Content: View>: View {
  var isExpanded: Bool = false
  @ViewBuilder var content: () -> Content

  var body: some View {
    isExpanded ? AnyView(vStack) : AnyView(hStack)
  }
}

private extension DynamicStack {
  var hStack: some View {
    HStack(
      alignment: .top,
      spacing: 0,
      content: content
    ).background(.yellow)
  }

  var vStack: some View {
    VStack(
      alignment: .leading,
      spacing: 0,
      content: content
    )
  }
}

public struct MiniPlayer: View {
  @EnvironmentObject var audioSession: AudioSession
  @Environment(\.colorScheme) private var colorScheme: ColorScheme

  @State var expanded = false
  var safeArea = UIApplication.shared.windows.first?.safeAreaInsets

  private let presentingView: AnyView

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
            .font(.appTitleTwo)
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
        .padding()
        .animation(.spring(), value: true)
        .tint(.appGrayTextContrast))
    } else {
      return AnyView(EmptyView())
    }
  }

  // swiftlint:disable:next function_body_length
  func playerContent(_ item: LinkedItem) -> some View {
    VStack {
      if expanded {
        Spacer(minLength: 0)
      }

      HStack {
        if expanded {
          Spacer()
        }

        Group {
          if let imageURL = item.imageURL {
            let dim = expanded ? 2 * (UIScreen.main.bounds.width / 3) : 64
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
               in: audioSession.timeElapsed ... audioSession.duration,
               onEditingChanged: { _ in
                 // isEditing = editing
               })
          .accentColor(.appCtaYellow)
          .introspectSlider { slider in
            // Make the thumb a little smaller than the default and give it the CTA color
            let tintColor = UIColor(Color.appCtaYellow)

            let image = UIImage(systemName: "circle.fill", withConfiguration: UIImage.SymbolConfiguration(scale: .small))?
              .withTintColor(tintColor)
              .withRenderingMode(.alwaysOriginal)

            slider.setThumbImage(image, for: .normal)
            slider.minimumTrackTintColor = tintColor
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
            action: {},
            label: {
              Image(systemName: "gobackward.30")
                .font(.appTitleTwo)
            }
          )
          Button(
            action: {},
            label: {
              Image(systemName: "play.circle")
                .font(.system(size: 64.0, weight: .thin))
            }
          )
          .frame(width: 64, height: 64)
          .padding(32)

          Button(
            action: {},
            label: {
              Image(systemName: "goforward.30")
                .font(.appTitleTwo)
            }
          )
        }
      }
    }
  }

  func miniview(_ item: LinkedItem) -> some View {
    HStack {
      Text(item.unwrappedTitle)
        .font(.appCallout)
        .lineSpacing(1.25)
        .foregroundColor(.appGrayTextContrast)
        .fixedSize(horizontal: false, vertical: true)
        .frame(maxWidth: .infinity, alignment: .leading)

      playPauseButtonItem
        .frame(width: 28, height: 28)

      stopButton
        .frame(width: 28, height: 28)
    }
  }

  public var body: some View {
    GeometryReader { _ in
      ZStack(alignment: .center) {
        presentingView
        VStack {
          Spacer()
          if isPresented {
            VStack {
              if expanded {
                Capsule()
                  .fill(.gray)
                  .frame(width: 60, height: 4)
                // .padding(.top, safeArea?.top ?? 0)
              }
              Spacer()

              playerView
            }
            .frame(maxHeight: expanded ? .infinity : 88)
            .background(
              Color.systemBackground
                .shadow(color: expanded ? .clear : .gray.opacity(0.33), radius: 8, x: 0, y: 4)
                .mask(Rectangle().padding(.top, -20))
            )
            .onTapGesture {
              withAnimation(.easeIn(duration: 0.08)) { expanded.toggle() }
            }
          }
        }
      }
    }
  }
}

public extension View {
  func miniPlayer() -> some View {
    MiniPlayer(presentingView: self)
  }
}
