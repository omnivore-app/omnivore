
import SwiftUI

enum OperationStatus {
  case none
  case isPerforming
  case success
  case failure
}

struct OperationToast: View {
  @Binding var operationMessage: String?
  @Binding var showOperationToast: Bool
  @Binding var operationStatus: OperationStatus

  var body: some View {
    VStack {
      HStack {
        if operationStatus == .isPerforming {
          Text(operationMessage ?? "Performing...")
          Spacer()
          ProgressView()
        } else if operationStatus == .success {
          Text(operationMessage ?? "Success")
          Spacer()
        } else if operationStatus == .failure {
          Text(operationMessage ?? "Failure")
          Spacer()
          Button(action: { showOperationToast = false }, label: {
            Text("Done").bold()
          })
        }
      }
      .padding(10)
      .frame(minHeight: 50)
      .frame(maxWidth: 380)
      .background(Color(hex: "2A2A2A"))
      .foregroundColor(Color(hex: "EBEBEB"))
      .cornerRadius(4.0)
      .tint(Color.green)
    }
    .padding(.bottom, 60)
    .padding(.horizontal, 10)
    .ignoresSafeArea(.all, edges: .bottom)
  }
}
