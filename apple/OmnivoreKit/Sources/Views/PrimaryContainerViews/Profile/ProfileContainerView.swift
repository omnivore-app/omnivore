import Combine
import Models
import SwiftUI
import Utils

public final class ProfileContainerViewModel: ObservableObject {
  @Published public var isLoading = false
  @Published public var profileCardData = ProfileCardData()

  public enum Action {
    case logout
    case loadProfileData
    case showIntercomMessenger
    case deleteAccount
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init() {}
}

public struct ProfileContainerView: View {
  @ObservedObject private var viewModel: ProfileContainerViewModel
  @State private var showLogoutConfirmation = false

  public init(viewModel: ProfileContainerViewModel) {
    self.viewModel = viewModel
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
