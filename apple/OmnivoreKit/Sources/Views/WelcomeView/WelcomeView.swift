import Combine
import Models
import SwiftUI

public final class WelcomeViewModel: ObservableObject {
  @Published public var showDebugModal: Bool = false
  @Published public var showRegistrationModal: Bool = false

  public let registrationViewModel: RegistrationViewModel
  public var debugMenuViewModel: DebugMenuViewModel?

  public enum Action {
    case hiddenGesturePerformed
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init(registrationViewModel: RegistrationViewModel) {
    self.registrationViewModel = registrationViewModel
  }
}

public struct WelcomeView: View {
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @ObservedObject private var viewModel: WelcomeViewModel
  @State private var showRegistrationView = false
  @State private var isKeyboardOnScreen = false

  public init(viewModel: WelcomeViewModel) {
    self.viewModel = viewModel
  }

  @ViewBuilder func userInteractiveView(width: CGFloat) -> some View {
    Group {
      if showRegistrationView {
        RegistrationView(viewModel: viewModel.registrationViewModel)
      } else {
        getStartedView
      }
    }
    .frame(width: width)
    .zIndex(2)
  }

  var titleLogo: some View {
    Image.omnivoreTitleLogo
      .renderingMode(.template)
      .foregroundColor(.appGrayTextContrast)
      .frame(height: 40)
      .gesture(
        TapGesture(count: 2)
          .onEnded {
            viewModel.performActionSubject.send(.hiddenGesturePerformed)
          }
      )
  }

  var getStartedView: some View {
    HStack {
      VStack(alignment: .leading, spacing: 32) {
        Text("A better social\nreading experience\nstarts with Omnivore.")
          .font(.appTitle)
          .multilineTextAlignment(.leading)

        BorderedButton(color: .appGrayTextContrast, text: "Get Started") {
          showRegistrationView = true
        }
        .frame(width: 220)
      }
      .padding(.leading, horizontalSizeClass == .compact ? 16 : 80)
      .padding(.top, horizontalSizeClass == .compact ? 16 : 0)

      Spacer()
    }
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

          if geometry.size.width < geometry.size.height, !isKeyboardOnScreen {
            VStack {
              Color.appDeepBackground.frame(height: 100)
              Spacer()
            }
            .edgesIgnoringSafeArea(.all)
          }

          VStack {
            if geometry.size.width < geometry.size.height, !isKeyboardOnScreen {
              RegistrationHeroImageView(
                tapGestureHandler: { viewModel.performActionSubject.send(.hiddenGesturePerformed) }
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
      .sheet(isPresented: $viewModel.showDebugModal) {
        if let debugMenuViewModel = viewModel.debugMenuViewModel {
          DebugMenuView(viewModel: debugMenuViewModel)
        }
      }
      .onReceive(Publishers.keyboardHeight) { isKeyboardOnScreen = $0 > 1 }
  }
}
