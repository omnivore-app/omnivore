import SwiftUI
import Views

struct InformationalSnackbar: View {
  let message: String?
  let undoAction: (() -> Void)?

  var body: some View {
    VStack {
      HStack {
        if let message = message {
          Text(message)
        }
          Spacer()

        if let undoAction = self.undoAction {
          Button(action: {
            undoAction()
          }, label: {
            Text("Undo")
              .bold()
              .foregroundColor(.blue)
            
          })
          .padding(.trailing, 2)
        }
      }
      .padding(10)
      .frame(height: 50)
      .frame(maxWidth: 380)
      .background(Color(hex: "2A2A2A"))
      .foregroundColor(Color(hex: "EBEBEB"))
      .cornerRadius(4.0)
    }
    .padding(.bottom, 60)
    .padding(.horizontal, 10)
    .ignoresSafeArea(.all, edges: .bottom)
  }
}
