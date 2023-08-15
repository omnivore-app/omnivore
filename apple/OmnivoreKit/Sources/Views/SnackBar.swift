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
  private let operation: SnackbarOperation

  @Environment(\.colorScheme) private var colorScheme: ColorScheme

  public init(
    isShowing: Binding<Bool>,
    operation: SnackbarOperation
  ) {
    self._isShowing = isShowing
    self.operation = operation
  }

  public var body: some View {
    VStack(alignment: .center) {
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
      .frame(maxWidth: 380)
      .frame(height: 44)
      .padding(.horizontal, 10)
      .background(self.colorScheme == .light ? Color.black : Color.white)
      .cornerRadius(5)
      .clipped()

      Spacer(minLength: 20)
    }
    .padding(.horizontal, 10)
    .background(Color.clear)
    .frame(height: 44 + 22)
  }
}

public extension View {
  func snackBar(isShowing: Binding<Bool>, operation: SnackbarOperation?) -> some View {
    if let operation = operation {
      return AnyView(Snackbar(isShowing: isShowing, operation: operation))
    } else {
      return AnyView(self)
    }
  }
}
