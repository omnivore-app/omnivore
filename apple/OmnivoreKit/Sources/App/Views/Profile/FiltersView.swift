
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class FiltersViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var isCreating = false
  @Published var networkError = false

  @AppStorage(UserDefaultKey.hideFeatureSection.rawValue) var hideFeatureSection = false
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
  }

  private var innerBody: some View {
    Group {
      Section {
        Toggle("Hide Feature Section", isOn: $viewModel.hideFeatureSection)
      }
    }
  }
}
