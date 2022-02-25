import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

final class ProfileContainerViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var profileCardData = ProfileCardData()

  var subscriptions = Set<AnyCancellable>()

  func loadProfileData(dataService: DataService) {
    dataService.viewerPublisher().sink(
      receiveCompletion: { _ in },
      receiveValue: { [weak self] viewer in
        self?.profileCardData = ProfileCardData(
          name: viewer.name,
          username: viewer.username,
          imageURL: viewer.profileImageURL.flatMap { URL(string: $0) }
        )
      }
    )
    .store(in: &subscriptions)
  }
}

struct ProfileContainerView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService

  @ObservedObject private var viewModel = ProfileContainerViewModel()

  func actionHandler(action: ProfileViewAction) {
    switch action {
    case .loadProfileAction:
      viewModel.loadProfileData(dataService: dataService)
    case .logout:
      authenticator.logout()
    case .showIntercomMessenger:
      DataService.showIntercomMessenger?()
    }
  }

  var body: some View {
    ProfileView(
      profileCardData: viewModel.profileCardData,
      webAppBaseURL: dataService.appEnvironment.webAppBaseURL,
      actionHandler: actionHandler
    )
  }
}
