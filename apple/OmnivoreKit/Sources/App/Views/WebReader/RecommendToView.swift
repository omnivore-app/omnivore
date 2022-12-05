import Models
import Services
import SwiftUI
import Views

@MainActor final class RecommendToViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var networkError = true
  @Published var recommendationGroups = [InternalRecommendationGroup]()
  @Published var selectedGroups = [String]()
  @Published var isRunning = false
  @Published var showError = false

  let pageID: String

  init(pageID: String) {
    self.pageID = pageID
  }

  func loadGroups(dataService: DataService) async {
    isLoading = true

    do {
      recommendationGroups = try await dataService.recommendationGroups()
    } catch {
      print("ERROR fetching recommendationGroups: ", error)
      networkError = true
    }

    isLoading = false
  }

  func recommend(dataService: DataService) async {
    isRunning = true

    do {
      try await dataService.recommendPage(pageID: pageID, groupIDs: selectedGroups)
    } catch {
      showError = true
    }

    isRunning = false
  }
}

struct RecommendToView: View {
  var dataService: DataService
  @StateObject var viewModel: RecommendToViewModel
  @Environment(\.dismiss) private var dismiss

  var nextButton: some View {
    if viewModel.isRunning {
      return AnyView(ProgressView())
    } else {
      return AnyView(Button(action: {
        Task {
          await viewModel.recommend(dataService: dataService)
          Snackbar.show(message: "Recommendation sent")
          dismiss()
        }
      }, label: {
        Text("Next")
      })
        .disabled(viewModel.selectedGroups.isEmpty)
      )
    }
  }

  var body: some View {
    VStack {
      List {
        Section("Select groups to recommend to") {
          ForEach(viewModel.recommendationGroups) { group in
            HStack {
              Text(group.name)

              Spacer()

              if viewModel.selectedGroups.contains(group.id) {
                Image(systemName: "checkmark")
              }
            }
            .contentShape(Rectangle())
            .onTapGesture {
              let idx = viewModel.selectedGroups.firstIndex(of: group.id)
              if let idx = idx {
                viewModel.selectedGroups.remove(at: idx)
              } else {
                viewModel.selectedGroups.append(group.id)
              }
            }
          }
        }
      }
      .listStyle(.grouped)

      Spacer()
    }
    .alert(isPresented: $viewModel.showError) {
      Alert(
        title: Text("Error recommending this page"),
        dismissButton: .cancel(Text("Ok")) {
          viewModel.showError = false
        }
      )
    }
    .navigationBarTitle("Recommend")
    .navigationBarTitleDisplayMode(.inline)
    .navigationViewStyle(.stack)
    .navigationBarItems(leading: Button(action: {
      dismiss()
    }, label: { Text("Cancel") }),
    trailing: nextButton)
    .task {
      await viewModel.loadGroups(dataService: dataService)
    }
  }
}
