import Combine
import Models
import Services
import SwiftUI
import Views

final class LabelsViewModel: ObservableObject {
  private var hasLoadedInitialLabels = false
  @Published var isLoading = false
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var unselectedLabels = [LinkedItemLabel]()
  @Published var labels = [LinkedItemLabel]()
  @Published var showCreateEmailModal = false
  @Published var labelSearchFilter = ""

  var subscriptions = Set<AnyCancellable>()

  func loadLabels(
    dataService: DataService,
    item: LinkedItem? = nil,
    initiallySelectedLabels: [LinkedItemLabel]? = nil
  ) {
    guard !hasLoadedInitialLabels else { return }
    isLoading = true

    dataService.labelsPublisher().sink(
      receiveCompletion: { _ in },
      receiveValue: { [weak self] labelIDs in
        guard let self = self else { return }
        dataService.viewContext.performAndWait {
          self.labels = labelIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItemLabel }
        }
        let selLabels = initiallySelectedLabels ?? item?.labels.asArray(of: LinkedItemLabel.self) ?? []
        for label in self.labels {
          if selLabels.contains(label) {
            self.selectedLabels.append(label)
          } else {
            self.unselectedLabels.append(label)
          }
        }
        self.hasLoadedInitialLabels = true
        self.isLoading = false
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
      receiveValue: { [weak self] labelID in
        if let label = dataService.viewContext.object(with: labelID) as? LinkedItemLabel {
          self?.labels.insert(label, at: 0)
          self?.unselectedLabels.insert(label, at: 0)
        }
        self?.isLoading = false
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

  func saveItemLabelChanges(
    itemID: String,
    dataService: DataService,
    onComplete: @escaping ([LinkedItemLabel]) -> Void
  ) {
    isLoading = true
    dataService.updateArticleLabelsPublisher(itemID: itemID, labelIDs: selectedLabels.map(\.unwrappedID)).sink(
      receiveCompletion: { [weak self] _ in
        self?.isLoading = false
      },
      receiveValue: { labelIDs in
        onComplete(
          labelIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItemLabel }
        )
      }
    )
    .store(in: &subscriptions)
  }

  func addLabelToItem(_ label: LinkedItemLabel) {
    selectedLabels.insert(label, at: 0)
    unselectedLabels.removeAll { $0.id == label.id }
  }

  func removeLabelFromItem(_ label: LinkedItemLabel) {
    unselectedLabels.insert(label, at: 0)
    selectedLabels.removeAll { $0.id == label.id }
  }
}
