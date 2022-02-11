import SwiftUI

struct RegistrationHeroImageView: View {
  let tapGestureHandler: () -> Void

  var body: some View {
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
