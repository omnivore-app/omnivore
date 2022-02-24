import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

// TODO: remove this view model
extension ProfileContainerViewModel {
  static func make(services: Services) -> ProfileContainerViewModel {
    let viewModel = ProfileContainerViewModel()
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case .logout:
        services.authenticator.logout()
      case .loadProfileData:
        self?.loadProfileData(dataService: services.dataService)
      case .showIntercomMessenger:
        DataService.showIntercomMessenger?()
      case .deleteAccount:
        print("delete account")
      }
    }
    .store(in: &subscriptions)
  }

  private func loadProfileData(dataService: DataService) {
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

final class ProfileContainerViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var profileCardData = ProfileCardData()

  enum Action {
    case logout
    case loadProfileData
    case showIntercomMessenger
    case deleteAccount
  }

  var subscriptions = Set<AnyCancellable>()
  let performActionSubject = PassthroughSubject<Action, Never>()

  init() {}
}

struct ProfileContainerView: View {
  @ObservedObject private var viewModel: ProfileContainerViewModel
  @State private var showLogoutConfirmation = false

  init(viewModel: ProfileContainerViewModel) {
    self.viewModel = viewModel
  }

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

  private var innerBody: some View {
    Group {
      Section {
        ProfileCard(data: viewModel.profileCardData)
          .onAppear {
            viewModel.performActionSubject.send(.loadProfileData)
          }
      }

      Section {
        NavigationLink(destination: BasicWebAppView.privacyPolicyWebView) {
          Text("Privacy Policy")
        }

        NavigationLink(destination: BasicWebAppView.termsConditionsWebView) {
          Text("Terms and Conditions")
        }

        #if os(iOS)
          Button(
            action: {
              viewModel.performActionSubject.send(.showIntercomMessenger)
            },
            label: { Text("Feedback") }
          )
        #endif
      }

      Section {
        if FeatureFlag.showAccountDeletion {
          NavigationLink(
            destination: ManageAccountView(handleAccountDeletion: {
              viewModel.performActionSubject.send(.deleteAccount)
            })
          ) {
            Text("Manage Account")
          }
        }

        Text("Logout")
          .onTapGesture {
            showLogoutConfirmation = true
          }
          .alert(isPresented: $showLogoutConfirmation) {
            Alert(
              title: Text("Are you sure you want to logout?"),
              primaryButton: .destructive(Text("Confirm")) {
                viewModel.performActionSubject.send(.logout)
              },
              secondaryButton: .cancel()
            )
          }
      }
    }
    .navigationTitle("Profile")
  }
}

private extension BasicWebAppView {
  static let privacyPolicyWebView: BasicWebAppView = {
    omnivoreWebView(path: "privacy")
  }()

  static let termsConditionsWebView: BasicWebAppView = {
    omnivoreWebView(path: "terms")
  }()

  private static func omnivoreWebView(path: String) -> BasicWebAppView {
    let urlString = "https://omnivore.app/\(path)?isAppEmbedView=true"
    return BasicWebAppView(request: URLRequest(url: URL(string: urlString)!))
  }
}
