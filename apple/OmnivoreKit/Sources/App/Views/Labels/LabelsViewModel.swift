import CoreData
import Models
import Services
import SwiftUI
import Views

@MainActor final class LabelsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var selectedLabels = Set<LinkedItemLabel>()
  @Published var unselectedLabels = Set<LinkedItemLabel>()
  @Published var labels = [LinkedItemLabel]()
  @Published var showCreateLabelModal = false
  @Published var labelSearchFilter = ""

  func setLabels(_ labels: [LinkedItemLabel]) {
    self.labels = labels.sorted { left, right in
      let aTrimmed = left.unwrappedName.trimmingCharacters(in: .whitespaces)
      let bTrimmed = right.unwrappedName.trimmingCharacters(in: .whitespaces)
      return aTrimmed.caseInsensitiveCompare(bTrimmed) == .orderedAscending
    }
  }

  func loadLabels(
    dataService: DataService,
    item: LinkedItem? = nil,
    highlight: Highlight? = nil,
    initiallySelectedLabels: [LinkedItemLabel]? = nil
  ) async {
    isLoading = true
    let selLabels = initiallySelectedLabels ?? item?.sortedLabels ?? highlight?.sortedLabels ?? []

    await loadLabelsFromStore(dataService: dataService)
    for label in labels {
      if selLabels.contains(label) {
        selectedLabels.insert(label)
      } else {
        unselectedLabels.insert(label)
      }
    }

    Task.detached(priority: .userInitiated) {
      if let labelIDs = try? await dataService.labels() {
        DispatchQueue.main.async {
          dataService.viewContext.performAndWait {
            self.setLabels(labelIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItemLabel })
          }
          for label in self.labels {
            if selLabels.contains(label) {
              self.selectedLabels.insert(label)
            } else {
              self.unselectedLabels.insert(label)
            }
          }
        }
      }
    }

    isLoading = false
  }

  func loadLabelsFromStore(dataService: DataService) async {
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()

    let fetchedLabels = await dataService.viewContext.perform {
      try? fetchRequest.execute()
    }

    setLabels(fetchedLabels ?? [])
    unselectedLabels = Set(fetchedLabels ?? [])
  }

  func fetchLabelsFromNetwork(dataService: DataService) async {
    let labelIDs = try? await dataService.labels()
    guard let labelIDs = labelIDs else { return }

    let fetchedLabels = await dataService.viewContext.perform {
      labelIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItemLabel }
    }

    setLabels(fetchedLabels)
    unselectedLabels = Set(fetchedLabels)
  }

  func createLabel(dataService: DataService, name: String, color: Color, description: String?) {
    isLoading = true

    guard let labelObjectID = try? dataService.createLabel(
      name: name,
      color: color.hex ?? "",
      description: description
    ) else {
      isLoading = false
      return
    }

    if let label = dataService.viewContext.object(with: labelObjectID) as? LinkedItemLabel {
      labels.insert(label, at: 0)
      selectedLabels.insert(label)
    }

    isLoading = false
    showCreateLabelModal = false
  }

  func deleteLabel(dataService: DataService, labelID: String, name: String) {
    dataService.removeLabel(labelID: labelID, name: name)
    labels.removeAll { $0.name == name }
  }

  func saveItemLabelChanges(itemID: String, dataService: DataService) {
    dataService.updateItemLabels(itemID: itemID, labelIDs: selectedLabels.map(\.unwrappedID))
  }

  func saveHighlightLabelChanges(highlightID: String, dataService: DataService) {
    dataService.setLabelsForHighlight(highlightID: highlightID, labelIDs: selectedLabels.map(\.unwrappedID))
  }
}
