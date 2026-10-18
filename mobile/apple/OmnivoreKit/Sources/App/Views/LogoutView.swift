import Models
import Services
import SwiftUI
import Utils
import Views

struct LogoutView: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var authenticator: Authenticator
  @Environment(\.openURL) var openURL

  let deletedAccountConfirmationMessage = "Your account has been deleted. Additional steps may be needed if Sign in with Apple was used to register."

  public var body: some View {
    VStack(alignment: .center) {
      Text("Logging out...")
      ProgressView()
        .frame(maxWidth: .infinity)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .task {
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(300)) {
        authenticator.logout(dataService: dataService)
      }
    }
    .alert(deletedAccountConfirmationMessage, isPresented: $authenticator.showAppleRevokeTokenAlert) {
      Button("View Details") {
        openURL(URL(string: "https://support.apple.com/en-us/HT210426")!)
      }
      Button(LocalText.dismissButton) { self.authenticator.showAppleRevokeTokenAlert = false }
    }
  }
}
