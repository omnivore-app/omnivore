import SwiftUI

public struct Snackbar: View {
  @Binding var isShowing: Bool
  private let presentingView: AnyView
  private let text: Text

  @Environment(\.colorScheme) private var colorScheme: ColorScheme

  init<PresentingView>(
    isShowing: Binding<Bool>,
    presentingView: PresentingView,
    text: Text
  ) where PresentingView: View {
    self._isShowing = isShowing
    self.presentingView = AnyView(presentingView)
    self.text = text
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
                .foregroundColor(self.colorScheme == .light ? .appGrayText : .appTextDefault)
              Spacer()
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
  func snackBar(isShowing: Binding<Bool>, message: String?) -> some View {
    Snackbar(isShowing: isShowing, presentingView: self, text: Text(message ?? ""))
  }
}
