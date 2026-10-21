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

    public var body: some View {
      ZStack(alignment: .center) {
        presentingView
        if self.audioController.itemAudioProperties != nil {
          ZStack(alignment: .bottom) {
            Color.systemBackground.edgesIgnoringSafeArea(.bottom)
              .frame(height: expanded ? 0 : 110, alignment: .bottom)

            VStack {
              Spacer(minLength: 0)
              MiniPlayerViewer()
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
#endif
