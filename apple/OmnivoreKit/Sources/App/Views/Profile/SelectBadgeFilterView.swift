import Foundation
import SwiftUI

struct SelectBadgeFilterView: View {
  @ObservedObject var viewModel: FiltersViewModel

  var body: some View {
    List {
      ForEach(viewModel.libraryFilters) { filter in
        HStack {
          Text(filter.name)
          Spacer()
        }
      }
    }
  }
}
