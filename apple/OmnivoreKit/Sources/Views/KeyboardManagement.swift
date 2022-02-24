import Combine
import SwiftUI

#if !os(macOS)
  import UIKit
#endif

public extension Publishers {
  static var keyboardHeight: AnyPublisher<CGFloat, Never> {
    #if os(iOS)
      let willShow = NotificationCenter.default
        .publisher(for: UIApplication.keyboardWillShowNotification)
        .map(\.keyboardHeight)
        .eraseToAnyPublisher()

      let willHide = NotificationCenter.default
        .publisher(for: UIApplication.keyboardWillHideNotification)
        .map { _ in CGFloat(0) }
        .eraseToAnyPublisher()

      return Merge(willShow, willHide)
        .eraseToAnyPublisher()
    #elseif os(macOS)
      Future { $0(.success(CGFloat.zero)) }
        .eraseToAnyPublisher()
    #endif
  }
}

extension Notification {
  var keyboardHeight: CGFloat {
    #if os(iOS)
      (userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect)?.height ?? 0
    #elseif os(macOS)
      0
    #endif
  }
}

struct KeyboardAdaptive: ViewModifier {
  @State private var keyboardHeight: CGFloat = 0

  func body(content: Content) -> some View {
    content
      .padding(.bottom, keyboardHeight)
      .onReceive(Publishers.keyboardHeight) { self.keyboardHeight = $0 }
  }
}

extension View {
  func keyboardAdaptive() -> some View {
    ModifiedContent(content: self, modifier: KeyboardAdaptive())
  }
}

extension View {
  func hideKeyboard() {
    #if os(iOS)
      UIApplication.shared
        .sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    #endif
  }
}
