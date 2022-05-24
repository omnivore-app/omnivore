import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

struct WelcomeView: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var authenticator: Authenticator
  @Environment(\.horizontalSizeClass) var horizontalSizeClass

  @StateObject private var viewModel = RegistrationViewModel()

  @State private var showRegistrationView = false
  @State private var showDebugModal = false
  @State private var selectedEnvironment = AppEnvironment.initialAppEnvironment

  func handleHiddenGestureAction() {
    if !Bundle.main.isAppStoreBuild {
      showDebugModal = true
    }
  }

  var headlineView: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("Everything you read. Safe, organized, and easy to share.")
        .font(.appLargeTitle)

      Button(
        action: { print("learn more button tapped") },
        label: {
          HStack(spacing: 4) {
            Text("Learn more")
            Image(systemName: "arrow.right")
          }
          .font(.appTitleThree)
        }
      )
      .foregroundColor(.appGrayTextContrast)
    }
  }

  var footerView: some View {
    Text("By signing up, you agree to Omnivore’s\nTerms of Service and Privacy Policy")
      .font(.appSubheadline)
  }

  var logoView: some View {
    Image.omnivoreTitleLogo
      .gesture(
        TapGesture(count: 2)
          .onEnded {
            if !Bundle.main.isAppStoreBuild {
              showDebugModal = true
            }
          }
      )
  }

  var authProviderButtonStack: some View {
    let buttonGroup = Group {
      AppleSignInButton {
        viewModel.handleAppleSignInCompletion(result: $0, authenticator: authenticator)
      }

      if AppKeys.sharedInstance?.iosClientGoogleId != nil {
        GoogleAuthButton {
          viewModel.handleGoogleAuth(authenticator: authenticator)
        }
      }
    }
    return VStack(alignment: .center, spacing: 16) {
      if horizontalSizeClass == .regular {
        HStack { buttonGroup }
      } else {
        buttonGroup
      }

      if let loginError = viewModel.loginError {
        LoginErrorMessageView(loginError: loginError)
      }
    }
  }

  var compactContent: some View {
    VStack(alignment: .leading) {
      logoView
      Spacer()
      headlineView
      Spacer()
      authProviderButtonStack
      Spacer()
      footerView
    }
    .padding()
  }

  var wideContent: some View {
    GeometryReader { _ in
      VStack(alignment: .leading) {
        logoView
        Spacer()
        headlineView
        Spacer()
        authProviderButtonStack
        Spacer()
        footerView
      }
      .padding()
    }
  }

  public var body: some View {
    ZStack(alignment: .leading) {
      Color.appDeepBackground
        .edgesIgnoringSafeArea(.all)
      if let registrationState = viewModel.registrationState {
        if case let RegistrationViewModel.RegistrationState.createProfile(userProfile) = registrationState {
          CreateProfileView(userProfile: userProfile)
        } else if case let RegistrationViewModel.RegistrationState.newAppleSignUp(userProfile) = registrationState {
          NewAppleSignupView(
            userProfile: userProfile,
            showProfileEditView: { viewModel.registrationState = .createProfile(userProfile: userProfile) }
          )
        } else {
          EmptyView() // will never be caled
        }
      } else {
        if horizontalSizeClass == .compact {
          compactContent
        } else {
          wideContent
        }
      }
    }
    .sheet(isPresented: $showDebugModal) {
      DebugMenuView(selectedEnvironment: $selectedEnvironment)
    }
    .task { selectedEnvironment = dataService.appEnvironment }
  }
}
