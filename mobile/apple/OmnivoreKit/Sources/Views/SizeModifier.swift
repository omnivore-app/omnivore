import SwiftUI

public struct SizePreferenceKey: PreferenceKey {
  public static var defaultValue: CGSize = .zero

  public static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
    value = nextValue()
  }
}

public struct SizeModifier: ViewModifier {
  public init() {}

  private var sizeView: some View {
    GeometryReader { geometry in
      Color.clear.preference(key: SizePreferenceKey.self, value: geometry.size)
    }
  }

  public func body(content: Content) -> some View {
    content.background(sizeView)
  }
}
