import Models
import Services
import SwiftUI
import Views

@MainActor final class RecommendationsGroupViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var networkError = true
  @Published var recommendationGroup: InternalRecommendationGroup

  init(recommendationGroup: InternalRecommendationGroup) {
    self.recommendationGroup = recommendationGroup
  }

  func loadGroups(dataService _: DataService) async {
    isLoading = true

//    do {
//      recommendationGroups = try await dataService.recommendationGroups()
//    } catch {
//      networkError = true
//    }

    isLoading = false
  }
}

struct RecommendationGroupView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel: RecommendationsGroupViewModel

  @State var presentShareSheet = false

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
    .task { await viewModel.loadGroups(dataService: dataService) }
  }

  private var shareView: some View {
    if let shareLink = URL(string: viewModel.recommendationGroup.inviteUrl) {
      return AnyView(ShareSheet(activityItems: [shareLink]))
    } else {
      return AnyView(Text("Error copying invite URL"))
    }
  }

  private var innerBody: some View {
    Group {
      Section("Name") {
        Text(viewModel.recommendationGroup.name)
      }

      Section("Invite Link") {
        Button(action: {
          presentShareSheet = true
        }, label: {
          Text("[\(viewModel.recommendationGroup.inviteUrl)](\(viewModel.recommendationGroup.inviteUrl))")
        })
      }
    }
    .formSheet(isPresented: $presentShareSheet) {
      shareView
    }
    .navigationTitle(viewModel.recommendationGroup.name)
  }
}
