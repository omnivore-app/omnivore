import SwiftUI

public struct ShimmeringLoader: View {
  @State private var phase: CGFloat = 0

  public init() {}

  public var body: some View {
    ZStack {
      Color.systemBackground
      Color.appGraySolid
        .contentShape(Rectangle())
        .modifier(AnimatedMask(phase: phase).animation(
          Animation.linear(duration: 2.0)
            .repeatForever(autoreverses: false)
        ))
        .onAppear { phase = 0.8 }
    }
    .frame(height: 2)
    .frame(maxWidth: .infinity)
  }

  /// An animatable modifier to interpolate between `phase` values.
  struct AnimatedMask: AnimatableModifier {
    var phase: CGFloat = 0

    var animatableData: CGFloat {
      get { phase }
      set { phase = newValue }
    }

    func body(content: Content) -> some View {
      content
        .mask(GradientMask(phase: phase).scaleEffect(3))
    }
  }

  /// An animatable gradient between transparent and opaque to use as mask.
  /// The `phase` parameter shifts the gradient, moving the opaque band.
  struct GradientMask: View {
    let phase: CGFloat
    let centerColor = Color.appGraySolid
    let edgeColor = Color.clear

    var body: some View {
      LinearGradient(gradient:
        Gradient(stops: [
          .init(color: edgeColor, location: phase),
          .init(color: centerColor, location: phase + 0.1),
          .init(color: edgeColor, location: phase + 0.2)
        ]), startPoint: .leading, endPoint: .trailing)
    }
  }
}
