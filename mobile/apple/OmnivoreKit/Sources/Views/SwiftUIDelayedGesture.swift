//
// FROM: https://github.com/ciaranrobrien/SwiftUIDelayedGesture/tree/main
//

import SwiftUI

public extension View {
  /// Sequences a gesture with a long press and attaches the result to the view,
  /// which results in the gesture only receiving events after the long press
  /// succeeds.
  ///
  /// Use this view modifier *instead* of `.gesture` to delay a gesture:
  ///
  ///     ScrollView {
  ///         FooView()
  ///             .delayedGesture(someGesture, delay: 0.2)
  ///     }
  ///
  /// - Parameters:
  ///    - gesture: A gesture to attach to the view.
  ///    - mask: A value that controls how adding this gesture to the view
  ///      affects other gestures recognized by the view and its subviews.
  ///    - delay: A value that controls the duration of the long press that
  ///      must elapse before the gesture can be recognized by the view.
  ///    - action: An action to perform if a tap gesture is recognized
  ///      before the long press can be recognized by the view.
  func delayedGesture<T: Gesture>(_ gesture: T,
                                  including mask: GestureMask = .all,
                                  delay: TimeInterval = 0.25,
                                  onTapGesture action: @escaping () -> Void = {}) -> some View
  {
    modifier(DelaysTouches(duration: delay, action: action))
      .gesture(gesture, including: mask)
  }

  /// Attaches a long press gesture to the view, which results in gestures with a
  /// lower precedence only receiving events after the long press succeeds.
  ///
  /// Use this view modifier *before* `.gesture` to delay a gesture:
  ///
  ///     ScrollView {
  ///         FooView()
  ///             .delayedInput(delay: 0.2)
  ///             .gesture(someGesture)
  ///     }
  ///
  /// - Parameters:
  ///    - delay: A value that controls the duration of the long press that
  ///      must elapse before lower precedence gestures can be recognized by
  ///      the view.
  ///    - action: An action to perform if a tap gesture is recognized
  ///      before the long press can be recognized by the view.
  func delayedInput(delay: TimeInterval = 0.25,
                    onTapGesture action: @escaping () -> Void = {}) -> some View
  {
    modifier(DelaysTouches(duration: delay, action: action))
  }
}

private struct DelaysTouches: ViewModifier {
  @State private var disabled = false
  @State private var touchDownDate: Date? = nil

  var duration: TimeInterval
  var action: () -> Void

  func body(content: Content) -> some View {
    Button(action: action) {
      content
    }
    .buttonStyle(DelaysTouchesButtonStyle(disabled: $disabled, duration: duration, touchDownDate: $touchDownDate))
    .disabled(disabled)
  }
}

private struct DelaysTouchesButtonStyle: ButtonStyle {
  @Binding var disabled: Bool
  var duration: TimeInterval
  @Binding var touchDownDate: Date?

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .onChange(of: configuration.isPressed, perform: handleIsPressed)
  }

  private func handleIsPressed(isPressed: Bool) {
    if isPressed {
      let date = Date()
      touchDownDate = date

      DispatchQueue.main.asyncAfter(deadline: .now() + max(duration, 0)) {
        if date == touchDownDate {
          disabled = true

          DispatchQueue.main.async {
            disabled = false
          }
        }
      }
    } else {
      touchDownDate = nil
      disabled = false
    }
  }
}
