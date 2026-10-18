import Services
import SwiftUI
import Views

struct ManageAccountView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService

  @State private var showDeleteAccountConfirmation = false
  @StateObject private var viewModel = ProfileContainerViewModel()

  var body: some View {
    #if os(iOS)
      Form {
        innerBody
      }
    #elseif os(macOS)
      List {
        innerBody
      }
      .listStyle(InsetListStyle())
    #endif
  }

  var innerBody: some View {
    Group {
      Section {
        ProfileCard(data: viewModel.profileCardData)
          .task {
            await viewModel.loadProfileData(dataService: dataService)
          }
      }
      Section {
        Button(
          action: {
            showDeleteAccountConfirmation = true
          },
          label: { Text(LocalText.manageAccountDelete) }
        )
        Button(
          action: {
            dataService.resetLocalStorage()
          },
          label: { Text(LocalText.manageAccountResetCache) }
        )
        .alert(isPresented: $showDeleteAccountConfirmation) {
          Alert(
            title: Text(LocalText.manageAccountConfirmDeleteMessage),
            primaryButton: .destructive(Text(LocalText.manageAccountDelete)) {
              Task {
                await viewModel.deleteAccount(dataService: dataService, authenticator: authenticator)
              }
            },
            secondaryButton: .cancel()
          )
        }
      }

      if let errorMessage = viewModel.deleteAccountErrorMessage {
        Text(errorMessage)
          .font(.appBody)
          .foregroundColor(.red)
          .multilineTextAlignment(.leading)
      }
    }
  }
}
