import SwiftUI

public struct Snackbar: View {
  @Binding var isShowing: Bool
  private let presentingView: AnyView
  private let text: Text

  private let undoAction: (() -> Void)?

  @Environment(\.colorScheme) private var colorScheme: ColorScheme

  init<PresentingView>(
    isShowing: Binding<Bool>,
    presentingView: PresentingView,
    text: Text,
    undoAction: (() -> Void)?
  ) where PresentingView: View {
    self._isShowing = isShowing
    self.presentingView = AnyView(presentingView)
    self.text = text
    self.undoAction = undoAction
  }

  public var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .center) {
        presentingView
        VStack {
          Spacer()
          if self.isShowing {
            HStack {
              self.text
                .font(.appCallout)
                .foregroundColor(self.colorScheme == .light ? .white : .appTextDefault)
              Spacer()
              if let undoAction = undoAction {
                Button("Undo", action: undoAction)
                  .font(.system(size: 16, weight: .bold))
              }
            }
            .padding()
            .frame(width: min(380, geometry.size.width * 0.96), height: 44)
            .background(self.colorScheme == .light ? Color.black : Color.white)
            .cornerRadius(5)
            .offset(x: 0, y: -8)
            .shadow(color: .gray, radius: 2)
            .animation(.spring(), value: true)
          }
        }
      }
    }
  }
}

public extension View {
  func snackBar(isShowing: Binding<Bool>, message: String?, undoAction: (() -> Void)?) -> some View {
    Snackbar(isShowing: isShowing, presentingView: self, text: Text(message ?? ""), undoAction: undoAction)
  }
}
