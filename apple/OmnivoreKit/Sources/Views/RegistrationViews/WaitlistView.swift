import Combine
import Models
import SwiftUI

public final class WaitlistViewModel: ObservableObject {
  public enum Action {
    case logout
    case checkStatus
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init() {}
}

public struct WaitlistView: View {
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @ObservedObject private var viewModel: WaitlistViewModel

  public init(viewModel: WaitlistViewModel) {
    self.viewModel = viewModel
  }

  @ViewBuilder func userInteractiveView(width: CGFloat) -> some View {
    waitlistButtonView
      .frame(width: width)
      .zIndex(2)
  }

  var titleLogo: some View {
    Image.omnivoreTitleLogo
      .renderingMode(.template)
      .foregroundColor(.appGrayTextContrast)
      .frame(height: 40)
  }

  var waitlistButtonView: some View {
    VStack(alignment: .center, spacing: 32) {
      Text("Your username has been reserved. We will inform you by email when we open up Omnivore to more users.")
        .font(.appHeadline)
        .multilineTextAlignment(.center)
        .frame(maxWidth: 300)

      BorderedButton(color: .appGrayTextContrast, text: "Check Status") {
        viewModel.performActionSubject.send(.checkStatus)
      }
      .frame(width: 220)

      BorderedButton(color: .appGrayTextContrast, text: "Logout") {
        viewModel.performActionSubject.send(.logout)
      }
      .frame(width: 220)
    }
    .padding(.horizontal, horizontalSizeClass == .compact ? 16 : 80)
    .padding(.top, horizontalSizeClass == .compact ? 16 : 0)
  }

  @ViewBuilder func splitColorBackground(width: CGFloat) -> some View {
    HStack(spacing: 0) {
      Color.systemBackground.frame(width: width * 0.5)
      Color.appBackground.frame(width: width * 0.5)
    }
    .edgesIgnoringSafeArea(.all)
  }

  @ViewBuilder func largeBackgroundImage(width: CGFloat) -> some View {
    Image.readingIllustrationXXL
      .resizable()
      .aspectRatio(contentMode: .fill)
      .frame(width: width)
      .clipped()
      .edgesIgnoringSafeArea([.vertical, .trailing])
  }

  @ViewBuilder func primaryContent() -> some View {
    if horizontalSizeClass == .compact {
      GeometryReader { geometry in
        ZStack(alignment: .leading) {
          Color.systemBackground
            .edgesIgnoringSafeArea(.all)

          if geometry.size.width < geometry.size.height {
            VStack {
              Color.appDeepBackground.frame(height: 100)
              Spacer()
            }
            .edgesIgnoringSafeArea(.all)
          }

          VStack {
            if geometry.size.width < geometry.size.height {
              RegistrationHeroImageView(
                tapGestureHandler: {}
              )
            }
            userInteractiveView(width: geometry.size.width)
            Spacer()
          }
        }
      }
    } else {
      GeometryReader { geometry in
        ZStack(alignment: .leading) {
          splitColorBackground(width: geometry.size.width)

          VStack {
            titleLogo
            Spacer()
          }
          .padding()

          HStack(spacing: 0) {
            userInteractiveView(width: geometry.size.width * 0.5)
            largeBackgroundImage(width: geometry.size.width * 0.5)
          }
        }
      }
    }
  }

  public var body: some View {
    primaryContent()
  }
}
