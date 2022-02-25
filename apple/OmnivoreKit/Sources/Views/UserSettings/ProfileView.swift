import Models
import SwiftUI
import Utils

public enum ProfileViewAction {
  case loadProfileAction
  case logout
  case showIntercomMessenger
}

public struct ProfileView: View {
  @State private var showLogoutConfirmation = false

  let profileCardData: ProfileCardData
  let webAppBaseURL: URL
  let actionHandler: (ProfileViewAction) -> Void

  public init(
    profileCardData: ProfileCardData,
    webAppBaseURL: URL,
    actionHandler: @escaping (ProfileViewAction) -> Void
  ) {
    self.profileCardData = profileCardData
    self.webAppBaseURL = webAppBaseURL
    self.actionHandler = actionHandler
  }

  public var body: some View {
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
          .onAppear { actionHandler(.loadProfileAction) }
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
              actionHandler(.showIntercomMessenger)
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
                actionHandler(.logout)
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
    let url: URL = {
      var urlComponents = URLComponents()
      urlComponents.path = path
      return urlComponents.url(relativeTo: baseURL)!
    }()

    return BasicWebAppView(request: URLRequest(url: url))
  }
}
