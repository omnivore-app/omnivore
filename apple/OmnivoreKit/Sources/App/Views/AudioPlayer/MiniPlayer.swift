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
          if self.audioSession.state != .stopped {
            HStack {
              Text("Title of the playing content")
                .font(.appCallout)
              Spacer()
            }
            .padding()
            .frame(width: geometry.size.width, height: 108)
            .animation(.spring(), value: true)
            .background(Color.systemBackground)
            .shadow(color: .gray, radius: 2)
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
