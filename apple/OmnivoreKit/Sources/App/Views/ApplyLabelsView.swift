import Combine
import Models
import Services
import SwiftUI
import Views

final class ApplyLabelsViewModel: ObservableObject {
  private var hasLoadedInitialLabels = false
  @Published var isLoading = true
  @Published var selectedLabels = [FeedItemLabel]()
  @Published var unselectedLabels = [FeedItemLabel]()

  var subscriptions = Set<AnyCancellable>()

  func load(item: FeedItem, dataService: DataService) {
    guard !hasLoadedInitialLabels else { return }

    dataService.labelsPublisher().sink(
      receiveCompletion: { _ in },
      receiveValue: { [weak self] allLabels in
        self?.isLoading = false
        self?.hasLoadedInitialLabels = true
        self?.selectedLabels = item.labels
        self?.unselectedLabels = allLabels.filter { !item.labels.contains($0) }
      }
    )
    .store(in: &subscriptions)
  }

  func saveChanges(itemID: String, dataService: DataService, onComplete: @escaping ([FeedItemLabel]) -> Void) {
    dataService.updateArticleLabelsPublisher(itemID: itemID, labelIDs: selectedLabels.map(\.id)).sink(
      receiveCompletion: { _ in },
      receiveValue: { onComplete($0) }
    )
    .store(in: &subscriptions)
  }

  func addLabel(_ label: FeedItemLabel) {
    selectedLabels.insert(label, at: 0)
    unselectedLabels.removeAll { $0.id == label.id }
  }

  func removeLabel(_ label: FeedItemLabel) {
    unselectedLabels.insert(label, at: 0)
    selectedLabels.removeAll { $0.id == label.id }
  }
}

struct ApplyLabelsView: View {
  let item: FeedItem
  let commitLabelChanges: ([FeedItemLabel]) -> Void

  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @StateObject var viewModel = ApplyLabelsViewModel()

  var body: some View {
    NavigationView {
      if viewModel.isLoading {
        EmptyView()
      } else {
        List {
          Section(header: Text("Assigned Labels")) {
            if viewModel.selectedLabels.isEmpty {
              Text("No labels are currently assigned.")
            }
            ForEach(viewModel.selectedLabels, id: \.self) { label in
              HStack {
                TextChip(feedItemLabel: label)
                Spacer()
                Button(
                  action: {
                    withAnimation {
                      viewModel.removeLabel(label)
                    }
                  },
                  label: { Image(systemName: "trash") }
                )
              }
            }
          }
          Section(header: Text("Available Labels")) {
            ForEach(viewModel.unselectedLabels, id: \.self) { label in
              HStack {
                TextChip(feedItemLabel: label)
                Spacer()
                Button(
                  action: {
                    withAnimation {
                      viewModel.addLabel(label)
                    }
                  },
                  label: { Image(systemName: "plus") }
                )
              }
            }
          }
        }
        .navigationTitle("Assign Labels")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .navigationBarLeading) {
            Button(
              action: { presentationMode.wrappedValue.dismiss() },
              label: { Text("Cancel") }
            )
          }
          ToolbarItem(placement: .navigationBarTrailing) {
            Button(
              action: {
                viewModel.saveChanges(itemID: item.id, dataService: dataService) { labels in
                  commitLabelChanges(labels)
                  presentationMode.wrappedValue.dismiss()
                }
              },
              label: { Text("Save") }
            )
          }
        }
      }
    }
    .onAppear {
      viewModel.load(item: item, dataService: dataService)
    }
  }
}
