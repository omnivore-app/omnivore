import CoreData
import Models
import Services
import SwiftUI
import Utils

@MainActor public final class LabelsViewModel: ObservableObject {
  let labelNameMaxLength = 64

  @Published var isLoading = false
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var unselectedLabels = Set<LinkedItemLabel>()
  @Published var labels = [LinkedItemLabel]()
  @Published var showCreateLabelModal = false
  @Published var labelSearchFilter = ZWSP

  public init() {}

  func setLabels(_ labels: [LinkedItemLabel]) {
    let hideSystemLabels = PublicValet.hideLabels

    self.labels = labels.filter { !hideSystemLabels || !isSystemLabel($0) }.sorted { left, right in
      let aTrimmed = left.unwrappedName.trimmingCharacters(in: .whitespaces)
      let bTrimmed = right.unwrappedName.trimmingCharacters(in: .whitespaces)
      return aTrimmed.caseInsensitiveCompare(bTrimmed) == .orderedAscending
    }
  }

  func loadLabels(
    dataService: DataService,
    item: Models.LibraryItem? = nil,
    highlight: Highlight? = nil,
    initiallySelectedLabels: [LinkedItemLabel]? = nil
  ) async {
    let selLabels = initiallySelectedLabels ?? item?.sortedLabels ?? highlight?.sortedLabels ?? []

    await loadLabelsFromStore(dataService: dataService)
    for label in labels {
      if selLabels.contains(label) {
        if !selectedLabels.contains(label) {
          selectedLabels.append(label)
        }
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
              if !self.selectedLabels.contains(label) {
                self.selectedLabels.append(label)
              }
            } else {
              self.unselectedLabels.insert(label)
            }
          }
        }
      }
    }
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

    let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
    guard let labelObjectID = try? dataService.createLabel(
      name: trimmedName,
      color: color.hex ?? "",
      description: description
    ) else {
      isLoading = false
      return
    }

    if let label = dataService.viewContext.object(with: labelObjectID) as? LinkedItemLabel {
      labels.insert(label, at: 0)
      selectedLabels.append(label)
    }

    isLoading = false
    showCreateLabelModal = false
  }

  func deleteLabel(dataService: DataService, labelID: String, name: String) {
    dataService.removeLabel(labelID: labelID, name: name)
    labels.removeAll { $0.name == name }
  }

  func saveItemLabelChanges(itemID: String, dataService: DataService) {
    dataService.setItemLabels(itemID: itemID, labels: InternalLinkedItemLabel.make(Set(selectedLabels) as NSSet))
  }

  func saveHighlightLabelChanges(highlightID: String, dataService: DataService) {
    dataService.setLabelsForHighlight(highlightID: highlightID, labelIDs: selectedLabels.map(\.unwrappedID))
  }
}
