import SwiftUI

public struct ReadingIllustrationXXLView: View {
  let width: CGFloat

  public init(width: CGFloat) {
    self.width = width
  }

  public var body: some View {
    Image.readingIllustrationXXL
      .resizable()
      .aspectRatio(contentMode: .fill)
      .frame(width: width)
      .clipped()
      .edgesIgnoringSafeArea([.vertical, .trailing])
  }
}

public struct TitleLogoView: View {
  let handleHiddenGestureAction: () -> Void

  public init(handleHiddenGestureAction: @escaping () -> Void) {
    self.handleHiddenGestureAction = handleHiddenGestureAction
  }

  public var body: some View {
    Image.omnivoreTitleLogo
      .renderingMode(.template)
      .foregroundColor(.appGrayTextContrast)
      .frame(height: 40)
      .gesture(
        TapGesture(count: 2)
          .onEnded {
            handleHiddenGestureAction()
          }
      )
  }
}

public struct GetStartedView: View {
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @Binding var showRegistrationView: Bool

  public init(showRegistrationView: Binding<Bool>) {
    self._showRegistrationView = showRegistrationView
  }

  public var body: some View {
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
}

public struct SplitColorBackground: View {
  let width: CGFloat

  public init(width: CGFloat) {
    self.width = width
  }

  public var body: some View {
    HStack(spacing: 0) {
      Color.systemBackground.frame(width: width * 0.5)
      Color.appBackground.frame(width: width * 0.5)
    }
    .edgesIgnoringSafeArea(.all)
  }
}
