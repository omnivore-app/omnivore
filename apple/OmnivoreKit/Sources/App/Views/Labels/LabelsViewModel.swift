import Combine
import Models
import Services
import SwiftUI
import Views

final class LabelsViewModel: ObservableObject {
  private var hasLoadedInitialLabels = false
  @Published var isLoading = false
  @Published var selectedLabels = [FeedItemLabelDep]()
  @Published var unselectedLabels = [FeedItemLabelDep]()
  @Published var labels = [FeedItemLabelDep]()
  @Published var showCreateEmailModal = false

  var subscriptions = Set<AnyCancellable>()

  /// Loads initial set of labels when a edit labels list is displayed
  /// - Parameters:
  ///   - dataService: `DataService` reference
  ///   - item: Optional `FeedItem` for applying labels to a single item
  ///   - initiallySelectedLabels: Optional `[FeedItemLabel]` for filtering a list of items
  func loadLabels(dataService: DataService, item: FeedItemDep? = nil, initiallySelectedLabels: [FeedItemLabelDep]? = nil) {
    guard !hasLoadedInitialLabels else { return }
    isLoading = true

    dataService.labelsPublisher().sink(
      receiveCompletion: { _ in },
      receiveValue: { [weak self] allLabels in
        self?.isLoading = false
        self?.labels = allLabels
        self?.hasLoadedInitialLabels = true
        if let item = item {
          self?.selectedLabels = item.labels
          self?.unselectedLabels = allLabels.filter { label in
            !item.labels.contains(where: { $0.id == label.id })
          }
        }
        if let initiallySelectedLabels = initiallySelectedLabels {
          self?.selectedLabels = initiallySelectedLabels
          self?.unselectedLabels = allLabels.filter { label in
            !initiallySelectedLabels.contains(where: { $0.id == label.id })
          }
        }
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

  func saveItemLabelChanges(itemID: String, dataService: DataService, onComplete: @escaping ([FeedItemLabelDep]) -> Void) {
    isLoading = true
    dataService.updateArticleLabelsPublisher(itemID: itemID, labelIDs: selectedLabels.map(\.id)).sink(
      receiveCompletion: { [weak self] _ in
        self?.isLoading = false
      },
      receiveValue: { onComplete($0) }
    )
    .store(in: &subscriptions)
  }

  func addLabelToItem(_ label: FeedItemLabelDep) {
    selectedLabels.insert(label, at: 0)
    unselectedLabels.removeAll { $0.id == label.id }
  }

  func removeLabelFromItem(_ label: FeedItemLabelDep) {
    unselectedLabels.insert(label, at: 0)
    selectedLabels.removeAll { $0.id == label.id }
  }
}
