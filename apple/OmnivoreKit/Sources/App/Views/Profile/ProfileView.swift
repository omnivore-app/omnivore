import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class ProfileContainerViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var profileCardData = ProfileCardData()

  var appVersionString: String {
    if let appVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String {
      return "Omnivore Version \(appVersion)"
    } else {
      return ""
    }
  }

  func loadProfileData(dataService: DataService) async {
    if let currentViewer = dataService.currentViewer {
      loadProfileCardData(viewer: currentViewer)
      return
    }

    guard let viewerObjectID = try? await dataService.fetchViewer() else { return }

    await dataService.viewContext.perform {
      if let viewer = dataService.viewContext.object(with: viewerObjectID) as? Viewer {
        self.loadProfileCardData(viewer: viewer)
      }
    }
  }

  private func loadProfileCardData(viewer: Viewer) {
    profileCardData = ProfileCardData(
      name: viewer.unwrappedName,
      username: viewer.unwrappedUsername,
      imageURL: viewer.profileImageURL.flatMap { URL(string: $0) }
    )
  }
}

struct ProfileView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService

  @StateObject private var viewModel = ProfileContainerViewModel()

  @State private var showLogoutConfirmation = false

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
          .task {
            await viewModel.loadProfileData(dataService: dataService)
          }
      }

      Section {
        NavigationLink(destination: LabelsView()) {
          Text("Labels")
        }

        NavigationLink(destination: NewsletterEmailsView()) {
          Text("Emails")
        }

        NavigationLink(destination: SubscriptionsView()) {
          Text("Subscriptions")
        }
      }

      Section {
        NavigationLink(
          destination: BasicWebAppView.privacyPolicyWebView(baseURL: dataService.appEnvironment.webAppBaseURL)
        ) {
          Text("Privacy Policy")
        }

        NavigationLink(
          destination: BasicWebAppView.termsConditionsWebView(baseURL: dataService.appEnvironment.webAppBaseURL)
        ) {
          Text("Terms and Conditions")
        }

        #if os(iOS)
          Button(
            action: { DataService.showIntercomMessenger?() },
            label: { Text("Feedback") }
          )
        #endif
      }

      Section(footer: Text(viewModel.appVersionString)) {
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
                authenticator.logout()
              },
              secondaryButton: .cancel()
            )
          }
      }
    }
    .navigationTitle("Profile")
  }
}

extension BasicWebAppView {
  static func privacyPolicyWebView(baseURL: URL) -> BasicWebAppView {
    omnivoreWebView(path: "/app/privacy", baseURL: baseURL)
  }

  static func termsConditionsWebView(baseURL: URL) -> BasicWebAppView {
    omnivoreWebView(path: "/app/terms", baseURL: baseURL)
  }

  private static func omnivoreWebView(path: String, baseURL: URL) -> BasicWebAppView {
    let url: URL = {
      var urlComponents = URLComponents()
      urlComponents.path = path
      return urlComponents.url(relativeTo: baseURL)!
    }()

    return BasicWebAppView(request: URLRequest(url: url))
  }
}
