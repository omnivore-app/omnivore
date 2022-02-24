import Combine
import Services
import SwiftUI
import Utils
import Views

struct WelcomeView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @State private var showRegistrationView = false
  @State private var isKeyboardOnScreen = false
  @State private var showDebugModal = false

  func handleHiddenGestureAction() {
    if !Bundle.main.isAppStoreBuild {
      showDebugModal = true
    }
  }

  @ViewBuilder func userInteractiveView(width: CGFloat) -> some View {
    Group {
      if showRegistrationView {
        RegistrationView()
      } else {
        GetStartedView(showRegistrationView: $showRegistrationView)
      }
    }
    .frame(width: width)
    .zIndex(2)
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
              RegistrationHeroImageView(tapGestureHandler: handleHiddenGestureAction)
            }
            userInteractiveView(width: geometry.size.width)
            Spacer()
          }
        }
      }
    } else {
      GeometryReader { geometry in
        ZStack(alignment: .leading) {
          SplitColorBackground(width: geometry.size.width)

          VStack {
            TitleLogoView(handleHiddenGestureAction: handleHiddenGestureAction)
            Spacer()
          }
          .padding()

          HStack(spacing: 0) {
            userInteractiveView(width: geometry.size.width * 0.5)
            ReadingIllustrationXXLView(width: geometry.size.width * 0.5)
          }
        }
      }
    }
  }

  public var body: some View {
    primaryContent()
      .sheet(isPresented: $showDebugModal) {
        DebugMenuView(initialEnvironment: dataService.appEnvironment)
      }
      .onReceive(Publishers.keyboardHeight) { isKeyboardOnScreen = $0 > 1 }
  }
}
