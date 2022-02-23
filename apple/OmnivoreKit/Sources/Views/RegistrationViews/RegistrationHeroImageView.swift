import SwiftUI

public struct RegistrationHeroImageView: View {
  let tapGestureHandler: () -> Void

  public init(tapGestureHandler: @escaping () -> Void) {
    self.tapGestureHandler = tapGestureHandler
  }

  public var body: some View {
    ZStack(alignment: .topLeading) {
      Image.readingIllustration
        .resizable()
        .aspectRatio(contentMode: .fit)
      Image.omnivoreTitleLogo
        .padding()
        .gesture(
          TapGesture(count: 2)
            .onEnded {
              tapGestureHandler()
            }
        )
    }
  }
}
