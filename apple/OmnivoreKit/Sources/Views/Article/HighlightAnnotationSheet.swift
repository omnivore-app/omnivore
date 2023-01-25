import Introspect
import SwiftUI

public struct HighlightAnnotationSheet: View {
  @Binding var annotation: String
  @Binding var errorAlertMessage: String?
  @Binding var showErrorAlertMessage: Bool

  let onSave: () -> Void
  let onCancel: () -> Void

  public init(
    annotation: Binding<String>,
    onSave: @escaping () -> Void,
    onCancel: @escaping () -> Void,
    errorAlertMessage: Binding<String?>,
    showErrorAlertMessage: Binding<Bool>
  ) {
    self._annotation = annotation
    self.onSave = onSave
    self.onCancel = onCancel
    self._errorAlertMessage = errorAlertMessage
    self._showErrorAlertMessage = showErrorAlertMessage
  }

  public var body: some View {
    VStack {
      HStack {
        Button(LocalText.cancelGeneric, action: onCancel)
        Spacer()
        Label("Note", systemImage: "note.text")
        Spacer()
        Button("Save") {
          onSave()
        }
      }
      .foregroundColor(.appGrayTextContrast)

      ScrollView {
        TextEditor(text: $annotation)
          .frame(height: 200)
        #if os(iOS)
          .introspectTextView {
            $0.becomeFirstResponder()
          }
        #endif
      }

      Spacer()
    }
    .padding()
    .alert(errorAlertMessage ?? LocalText.readerError, isPresented: $showErrorAlertMessage) {
      Button("Ok", role: .cancel, action: {
        errorAlertMessage = nil
        showErrorAlertMessage = false
      })
    }
  }
}
