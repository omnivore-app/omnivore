import Foundation
import Models
import Services
import SwiftUI

@MainActor
public struct SelectBadgeFilterView: View {
  @ObservedObject var viewModel: FiltersViewModel

  public var body: some View {
    List {
      Section(header: Text("Filter")) {
        ForEach(viewModel.libraryFilters) { filter in
          Button {
            viewModel.badgeFilter = filter.filter
          } label: {
            HStack {
              Text(filter.name)
              Spacer()
              if isSelected(filter) {
                Image(systemName: "checkmark")
              }
            }.onTapGesture {}
          }.contentShape(Rectangle())
        }
      }
      Section {
        Text("Your selected filter will be used to display a badge value on the application icon.")
      }
    }.navigationTitle("Badge Filter")
  }

  func isSelected(_ filter: InternalFilter) -> Bool {
    viewModel.badgeFilter == filter.filter
  }
}
