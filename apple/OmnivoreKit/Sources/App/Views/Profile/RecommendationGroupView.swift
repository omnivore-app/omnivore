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

  private var innerBody: some View {
    Group {
      Section("Name") {
        Text(viewModel.recommendationGroup.name)
      }

      Section("Invite Link") {
        Button(action: {
          #if os(iOS)
            UIPasteboard.general.string = viewModel.recommendationGroup.inviteUrl
          #endif

          #if os(macOS)
            let pasteBoard = NSPasteboard.general
            pasteBoard.clearContents()
            pasteBoard.writeObjects([viewModel.recommendationGroup.inviteUrl as NSString])
          #endif

          Snackbar.show(message: "Invite link copied")
        }, label: {
          Text("[\(viewModel.recommendationGroup.inviteUrl)](\(viewModel.recommendationGroup.inviteUrl))")
        })
      }
    }
    .navigationTitle(viewModel.recommendationGroup.name)
  }
}
