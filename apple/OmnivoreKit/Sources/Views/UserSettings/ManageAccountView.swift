import SwiftUI

struct ManageAccountView: View {
  let handleAccountDeletion: () -> Void
  @State private var showDeleteAccountConfirmation = false

  var body: some View {
    Button(
      action: {
        showDeleteAccountConfirmation = true
      },
      label: { Text("Delete my account") }
    )
    .alert(isPresented: $showDeleteAccountConfirmation) {
      Alert(
        title: Text("Are you sure you want to delete your account? This action can't be undone."),
        primaryButton: .destructive(Text("Delete Account")) {
          handleAccountDeletion()
        },
        secondaryButton: .cancel()
      )
    }
  }
}
