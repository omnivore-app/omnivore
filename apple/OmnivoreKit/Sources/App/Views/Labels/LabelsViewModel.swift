import Combine
import Models
import Services
import SwiftUI
import Views

// TODO: -labels fix file
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

  func createLabel(dataService _: DataService, name _: String, color _: Color, description _: String?) {
//    isLoading = true
//
//    dataService.createLabelPublisher(
//      name: name,
//      color: color.hex ?? "",
//      description: description
//    ).sink(
//      receiveCompletion: { [weak self] _ in
//        self?.isLoading = false
//      },
//      receiveValue: { [weak self] result in
//        self?.isLoading = false
//        self?.labels.insert(result, at: 0)
//        self?.unselectedLabels.insert(result, at: 0)
//        self?.showCreateEmailModal = false
//      }
//    )
//    .store(in: &subscriptions)
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
    itemID _: String,
    dataService _: DataService,
    onComplete _: @escaping ([LinkedItemLabel]) -> Void
  ) {
//    isLoading = true
//    dataService.updateArticleLabelsPublisher(itemID: itemID, labelIDs: selectedLabels.map(\.id)).sink(
//      receiveCompletion: { [weak self] _ in
//        self?.isLoading = false
//      },
//      receiveValue: { onComplete($0) }
//    )
//    .store(in: &subscriptions)
  }

  func addLabelToItem(_: LinkedItemLabel) {
//    selectedLabels.insert(label, at: 0)
//    unselectedLabels.removeAll { $0.id == label.id }
  }

  func removeLabelFromItem(_: LinkedItemLabel) {
//    unselectedLabels.insert(label, at: 0)
//    selectedLabels.removeAll { $0.id == label.id }
  }
}
