
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class FiltersViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var isCreating = false
  @Published var networkError = false
  @Published var libraryFilters = [InternalFilter]()

  @AppStorage(UserDefaultKey.hideFeatureSection.rawValue) var hideFeatureSection = false

  func loadFilters(dataService: DataService) async {
    isLoading = true

    do {
      libraryFilters = try await dataService.filters()
    } catch {
      networkError = true
    }

    isLoading = false
  }
}

struct FiltersView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = FiltersViewModel()

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
        }
      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
    .navigationTitle(LocalText.filtersGeneric)
    .task { await viewModel.loadFilters(dataService: dataService) }
  }

  private var innerBody: some View {
    List {
      Section {
        Toggle("Hide Feature Section", isOn: $viewModel.hideFeatureSection)
      }

      Section(header: Text("Saved Searches")) {
        ForEach(viewModel.libraryFilters) { filter in
          Text(filter.name)
        }
      }
    }
  }
}
