//
//  MiniPlayer.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import Foundation
import Services
import SwiftUI

public struct MiniPlayer: View {
  @EnvironmentObject var audioSession: AudioSession
  @Environment(\.colorScheme) private var colorScheme: ColorScheme

  private let presentingView: AnyView

  init<PresentingView>(
    presentingView: PresentingView
  ) where PresentingView: View {
    self.presentingView = AnyView(presentingView)
  }

  public var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .center) {
        presentingView
        VStack {
          Spacer()
          if let item = audioSession.item, self.audioSession.state != .stopped {
            HStack {
              Text(item.unwrappedTitle)
                .font(.appCallout)
                .lineSpacing(1.25)
                .foregroundColor(.appGrayTextContrast)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)
              Button(
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
              )
              .frame(width: 28, height: 28)

              Button(
                action: {
                  audioSession.stop()
                },
                label: {
                  Image(systemName: "xmark")
                    .font(.appTitleTwo)
                }
              )
              .frame(width: 28, height: 28)
            }
            .padding()
            .frame(width: geometry.size.width, height: 88) // this should be 108 once we add GrabberVisible at the bottom
            .animation(.spring(), value: true)
            .tint(.appGrayTextContrast)
            .background(
              Color.systemBackground
                .shadow(color: .gray.opacity(0.33), radius: 8, x: 0, y: 4)
                .mask(Rectangle().padding(.top, -20))
            )
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
