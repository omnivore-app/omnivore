import Models
import Services
import SwiftUI
import Utils
import Views

struct DeleteAccountView: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var authenticator: Authenticator

  public var body: some View {
    VStack(alignment: .center) {
      Text("Deleting account...")
      ProgressView()
        .frame(maxWidth: .infinity)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .task {
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(300)) {
        authenticator.logout(dataService: dataService, isAccountDeletion: true)
      }
    }
  }
}
