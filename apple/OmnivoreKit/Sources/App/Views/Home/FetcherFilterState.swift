import Foundation
import Models
import Services
import SwiftUI
import Utils

@MainActor
class FetcherFilterState: ObservableObject {
  let folder: String

  @Published var searchTerm = ""
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()

  @Published var appliedFilter: InternalFilter?
  @Published var appliedSort = LinkedItemSort.newest.rawValue

  init(folder: String) {
    self.folder = folder
  }
}
