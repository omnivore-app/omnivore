import Combine
import Models
import Services
import SwiftUI
import Views

final class LabelsViewModel: ObservableObject {
  private var hasLoadedInitialLabels = false
  @Published var isLoading = false
  @Published var selectedLabels = [FeedItemLabel]()
  @Published var unselectedLabels = [FeedItemLabel]()
  @Published var labels = [FeedItemLabel]()
  @Published var showCreateEmailModal = false

  var subscriptions = Set<AnyCancellable>()

  func loadLabels(dataService: DataService) {
    guard !hasLoadedInitialLabels else { return }
    isLoading = true

    dataService.labelsPublisher().sink(
      receiveCompletion: { _ in },
      receiveValue: { [weak self] result in
        self?.isLoading = false
        self?.labels = result
        self?.hasLoadedInitialLabels = true
      }
    )
    .store(in: &subscriptions)
  }

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

  func createLabel(dataService: DataService, name: String, color: Color, description: String?) {
    isLoading = true

    dataService.createLabelPublisher(
      name: name,
      color: color.hex ?? "",
      description: description
    ).sink(
      receiveCompletion: { [weak self] _ in
        self?.isLoading = false
      },
      receiveValue: { [weak self] result in
        self?.isLoading = false
        self?.labels.insert(result, at: 0)
        self?.unselectedLabels.insert(result, at: 0)
        self?.showCreateEmailModal = false
      }
    )
    .store(in: &subscriptions)
  }

  func deleteLabel(dataService: DataService, labelID: String) {
    isLoading = true

    dataService.removeLabelPublisher(labelID: labelID).sink(
      receiveCompletion: { [weak self] _ in
        self?.isLoading = false
      },
      receiveValue: { [weak self] _ in
        self?.isLoading = false
        self?.labels.removeAll { $0.id == labelID }
      }
    )
    .store(in: &subscriptions)
  }

  func saveChanges(itemID: String, dataService: DataService, onComplete: @escaping ([FeedItemLabel]) -> Void) {
    isLoading = true
    dataService.updateArticleLabelsPublisher(itemID: itemID, labelIDs: selectedLabels.map(\.id)).sink(
      receiveCompletion: { [weak self] _ in
        self?.isLoading = false
      },
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
