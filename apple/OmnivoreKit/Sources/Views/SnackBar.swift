import SwiftUI

public typealias SnackbarUndoAction = (() -> Void)

public struct SnackbarOperation {
  let message: String
  let undoAction: SnackbarUndoAction?

  public init(message: String, undoAction: SnackbarUndoAction?) {
    self.message = message
    self.undoAction = undoAction
  }
}

public struct Snackbar: View {
  @Binding var isShowing: Bool
  private let presentingView: AnyView
  private let operation: SnackbarOperation

  @Environment(\.colorScheme) private var colorScheme: ColorScheme

  init<PresentingView>(
    isShowing: Binding<Bool>,
    presentingView: PresentingView,
    operation: SnackbarOperation
  ) where PresentingView: View {
    self._isShowing = isShowing
    self.presentingView = AnyView(presentingView)
    self.operation = operation
  }

  public var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .center) {
        presentingView
        VStack {
          Spacer()
          if isShowing {
            HStack {
              Text(operation.message)
                .font(.appCallout)
                .foregroundColor(self.colorScheme == .light ? .white : .appTextDefault)
              Spacer()
              if let undoAction = operation.undoAction {
                Button("Undo", action: {
                  isShowing = false
                  undoAction()
                })
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
  func snackBar(isShowing: Binding<Bool>, operation: SnackbarOperation?) -> some View {
    if let operation = operation {
      return AnyView(Snackbar(isShowing: isShowing, presentingView: self, operation: operation))
    } else {
      return AnyView(self)
    }
  }
}
