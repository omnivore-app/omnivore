import Models
import Services
import SwiftUI
import Views

@MainActor final class RecommendToViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var networkError = false
  @Published var recommendationGroups = [InternalRecommendationGroup]()
  @Published var selectedGroups = [InternalRecommendationGroup]()
  @Published var isRunning = false
  @Published var showError = false
  @Published var showNoteView = false
  @Published var note: String = ""

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
      try await dataService.recommendPage(pageID: pageID, groupIDs: selectedGroups.map(\.id), note: note.isEmpty ? nil : note)
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
    Button(action: {
      self.viewModel.showNoteView = true
    }, label: {
      Text("Next")
        .bold()
    })
      .disabled(viewModel.selectedGroups.isEmpty)
  }

  var sendButton: some View {
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
        Text("Send")
          .bold()
      })
        .disabled(viewModel.selectedGroups.isEmpty)
      )
    }
  }

  var noteView: some View {
    VStack {
      HStack {
        Text("To:")
          .font(.appCaption)
          .foregroundColor(.appGrayText)
        Text(InternalRecommendationGroup.readable(list: viewModel.selectedGroups))
          .font(.appCaption)
          .foregroundColor(.appGrayTextContrast)
        Spacer()
      }
      TextEditor(text: $viewModel.note)
        .lineSpacing(6)
        .accentColor(.appGraySolid)
        .foregroundColor(.appGrayTextContrast)
        .font(.appBody)
        .padding(12)
        .frame(height: 200)
        .background(
          RoundedRectangle(cornerRadius: 8)
            .strokeBorder(Color.appGrayBorder, lineWidth: 1)
            .background(RoundedRectangle(cornerRadius: 8).fill(Color.systemBackground))
        )
        .overlay(
          Text("Add a note (optional)")
            .allowsHitTesting(false)
            .opacity(viewModel.note.isEmpty ? 0.4 : 0.0)
            .font(.appBody)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding(.top, 24)
            .padding(.leading, 16)
        )
      Spacer()
    }
    .padding(16)
    .navigationBarTitleDisplayMode(.inline)
    .navigationViewStyle(.stack)
    .navigationBarItems(trailing: sendButton)
  }

  var body: some View {
    VStack {
      NavigationLink(destination: noteView,
                     isActive: $viewModel.showNoteView) {
        EmptyView()
      }
      List {
        Section("Select groups to recommend to") {
          ForEach(viewModel.recommendationGroups) { group in
            HStack {
              Text(group.name)

              Spacer()

              if viewModel.selectedGroups.contains(where: { $0.id == group.id }) {
                Image(systemName: "checkmark")
              }
            }
            .contentShape(Rectangle())
            .onTapGesture {
              let idx = viewModel.selectedGroups.firstIndex(where: { $0.id == group.id })
              if let idx = idx {
                viewModel.selectedGroups.remove(at: idx)
              } else {
                viewModel.selectedGroups.append(group)
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
