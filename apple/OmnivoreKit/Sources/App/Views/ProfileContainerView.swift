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

  var body: some View {
    ProfileView(
      profileCardData: viewModel.profileCardData,
      webAppBaseURL: dataService.appEnvironment.webAppBaseURL,
      onAppearAction: { viewModel.loadProfileData(dataService: dataService) },
      logoutAction: authenticator.logout
    )
  }
}

struct ProfileView: View {
  @State private var showLogoutConfirmation = false

  let profileCardData: ProfileCardData
  let webAppBaseURL: URL
  let onAppearAction: () -> Void
  let logoutAction: () -> Void

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
        ProfileCard(data: profileCardData)
          .onAppear { onAppearAction() }
      }

      Section {
        NavigationLink(
          destination: BasicWebAppView.privacyPolicyWebView(baseURL: webAppBaseURL)
        ) {
          Text("Privacy Policy")
        }

        NavigationLink(
          destination: BasicWebAppView.termsConditionsWebView(baseURL: webAppBaseURL)
        ) {
          Text("Terms and Conditions")
        }

        #if os(iOS)
          Button(
            action: {
              DataService.showIntercomMessenger?()
            },
            label: { Text("Feedback") }
          )
        #endif
      }

      Section {
        if FeatureFlag.showAccountDeletion {
          NavigationLink(
            destination: ManageAccountView(handleAccountDeletion: {
              print("delete account")
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
                logoutAction()
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
  static func privacyPolicyWebView(baseURL: URL) -> BasicWebAppView {
    omnivoreWebView(path: "/app/privacy", baseURL: baseURL)
  }

  static func termsConditionsWebView(baseURL: URL) -> BasicWebAppView {
    omnivoreWebView(path: "/app/terms", baseURL: baseURL)
  }

  private static func omnivoreWebView(path: String, baseURL: URL) -> BasicWebAppView {
    let urlRequest = URLRequest.webRequest(
      baseURL: baseURL,
      urlPath: path,
      queryParams: nil
    )

    return BasicWebAppView(request: urlRequest)
  }
}
