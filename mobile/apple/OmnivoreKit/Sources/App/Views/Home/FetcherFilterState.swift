import Foundation
import Models
import Services
import SwiftUI
import Utils

@MainActor
struct FetcherFilterState {
  let folder: String

  let searchTerm: String
  let selectedLabels: [LinkedItemLabel]
  let negatedLabels: [LinkedItemLabel]
  let appliedSort: String

  let appliedFilter: InternalFilter?
}
