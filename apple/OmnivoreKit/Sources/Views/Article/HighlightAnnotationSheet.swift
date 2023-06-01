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
//      HStack {
//        Button(LocalText.cancelGeneric, action: onCancel)
//        Spacer()
//        Text("Note").font(Font.system(size: 18, weight: .bold))
//        Spacer()
//        Button(LocalText.genericSave) {
//          onSave()
//        }
//      }
//      .foregroundColor(.appGrayTextContrast)

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
