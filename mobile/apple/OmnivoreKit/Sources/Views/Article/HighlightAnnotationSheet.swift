import Introspect
import SwiftUI

public struct HighlightAnnotationSheet: View {
  @Binding var annotation: String
  @Binding var errorAlertMessage: String?
  @Binding var showErrorAlertMessage: Bool

  enum FocusField: Hashable {
    case textEditor
  }

  @FocusState private var focusedField: FocusField?

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
      TextEditor(text: $annotation)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .focused($focusedField, equals: .textEditor)
        .padding(.horizontal)
        .task {
          focusedField = .textEditor
        }
    }
    .navigationTitle("Note")
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)

      .navigationBarItems(leading: Button(action: onCancel, label: {
        Text("Cancel")
      }))
      .navigationBarItems(trailing: Button(action: onSave, label: {
        Text("Save").bold()
      }))
    #endif
    .listStyle(PlainListStyle())
      .alert(errorAlertMessage ?? LocalText.readerError, isPresented: $showErrorAlertMessage) {
        Button(LocalText.genericOk, role: .cancel, action: {
          errorAlertMessage = nil
          showErrorAlertMessage = false
        })
      }
  }
}
