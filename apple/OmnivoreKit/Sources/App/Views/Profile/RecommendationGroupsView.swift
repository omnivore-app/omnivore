import Models
import Services
import SwiftUI
import Views

@MainActor final class RecommendationsGroupsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var isCreating = false
  @Published var networkError = false
  @Published var recommendationGroups = [InternalRecommendationGroup]()

  @Published var showCreateSheet = false

  @Published var showCreateError = false
  @Published var createGroupError: String?

  @Published var onlyAdminCanPost = false
  @Published var onlyAdminCanSeeMembers = false

  func loadGroups(dataService: DataService) async {
    isLoading = true

    do {
      recommendationGroups = try await dataService.recommendationGroups()
    } catch {
      networkError = true
    }

    isLoading = false
  }

  func createGroup(dataService: DataService, name: String) async {
    isCreating = true

    let group = try? await dataService.createRecommendationGroup(name: name,
                                                                 onlyAdminCanPost: onlyAdminCanPost,
                                                                 onlyAdminCanSeeMembers: onlyAdminCanSeeMembers)

    if group != nil {
      await loadGroups(dataService: dataService)
      showCreateSheet = false
    } else {
      createGroupError = "Error creating club"
      showCreateError = true
    }

    isCreating = false
  }
}

struct CreateRecommendationGroupView: View {
  @State var name = ""
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = RecommendationsGroupsViewModel()

  var nextButton: some View {
    if viewModel.isCreating {
      return AnyView(ProgressView())
    } else {
      return AnyView(Button(action: {
        Task {
          await viewModel.createGroup(dataService: dataService, name: self.name)
        }
      }, label: {
        Text("Next")
      })
        .disabled(name.isEmpty)
      )
    }
  }

  var body: some View {
    NavigationView {
      Form {
        TextField("Name", text: $name, prompt: Text("Club Name"))

        Section("Club Rules") {
          Toggle("Only admins can post", isOn: $viewModel.onlyAdminCanPost)
          Toggle("Only admins can see members", isOn: $viewModel.onlyAdminCanSeeMembers)
        }

        Section {
          Section {
            Text("""
            [Learn more about clubs](https://blog.omnivore.app/p/dca38ba4-8a74-42cc-90ca-d5ffa5d075cc)
            """)
              .accentColor(.blue)
          }
        }
      }
      .alert(isPresented: $viewModel.showCreateError) {
        Alert(
          title: Text(viewModel.createGroupError ?? "Error creating group"),
          dismissButton: .cancel(Text("Ok")) {
            viewModel.createGroupError = nil
            viewModel.showCreateError = false
          }
        )
      }
    }
    .navigationViewStyle(.stack)
    .navigationTitle("Create Club")
    .navigationBarTitleDisplayMode(.inline)
    .navigationBarItems(leading:
      Button(action: {
        viewModel.showCreateSheet = false
      }, label: { Text("Cancel") }),
      trailing: nextButton)
  }
}

struct GroupsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = RecommendationsGroupsViewModel()

  var body: some View {
    Group {
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
    .sheet(isPresented: $viewModel.showCreateSheet) {
      NavigationView {
        CreateRecommendationGroupView(viewModel: self.viewModel)
      }
    }
    .task { await viewModel.loadGroups(dataService: dataService) }
    .navigationTitle("Clubs")
  }

  private var innerBody: some View {
    Group {
      Section {
        Button(
          action: { viewModel.showCreateSheet = true },
          label: {
            HStack {
              Image(systemName: "plus.circle.fill").foregroundColor(.green)
              Text("Create a new club")
              Spacer()
            }
          }
        )
      }

      if !viewModel.isLoading {
        if viewModel.recommendationGroups.count > 0 {
          Section(header: Text("Your clubs")) {
            ForEach(viewModel.recommendationGroups) { recommendationGroup in
              let vm = RecommendationsGroupViewModel(recommendationGroup: recommendationGroup)
              NavigationLink(
                destination: RecommendationGroupView(viewModel: vm)
              ) {
                Text(recommendationGroup.name)
              }
            }
          }
        } else {
          Section {
            Text("""
            You are not a member of any clubs.
            Create a new club and send the invite link to your friends get started.

            During the beta you are limited to creating three clubs, and each club
            can have a maximum of twelve users.

            [Learn more about clubs](https://blog.omnivore.app/p/dca38ba4-8a74-42cc-90ca-d5ffa5d075cc)
            """)
              .accentColor(.blue)
          }
        }
      }
    }
  }
}
