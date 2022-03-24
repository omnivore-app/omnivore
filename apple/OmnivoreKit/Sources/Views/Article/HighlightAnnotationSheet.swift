import Introspect
import SwiftUI

public struct HighlightAnnotationSheet: View {
  @Binding var annotation: String

  let onSave: () -> Void
  let onCancel: () -> Void

  public init(
    annotation: Binding<String>,
    onSave: @escaping () -> Void,
    onCancel: @escaping () -> Void
  ) {
    self._annotation = annotation
    self.onSave = onSave
    self.onCancel = onCancel
  }

  public var body: some View {
    VStack {
      HStack {
        Button("Cancel", action: onCancel)
        Spacer()
        HStack {
          Image(systemName: "note.text")
          Text("Note")
        }
        Spacer()
        Button("Save") {
          onSave()
        }
      }

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
  }
}
