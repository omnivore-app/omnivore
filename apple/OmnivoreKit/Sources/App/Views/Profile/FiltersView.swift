import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class FiltersViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var isCreating = false
  @Published var networkError = false

  @Published var hasBadgePermission = false
  @Published var libraryFilters = [InternalFilter]()

  @Published var badgeFilter = BadgeCountHandler.badgeFilter {
    didSet {
      BadgeCountHandler.badgeFilter = badgeFilter
    }
  }

  @AppStorage("LibraryTabView::hideFollowingTab") var hideFollowingTab = false
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

  func loadBadgePermission() {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
      DispatchQueue.main.async {
        if settings.badgeSetting == .enabled {
          self.hasBadgePermission = true
        } else {
          self.hasBadgePermission = false
        }
        print("notification settings: ", settings.badgeSetting.rawValue)
        print("got the notification settings")
      }
    }
  }

  func requestBadgePermission() {
    UNUserNotificationCenter.current().requestAuthorization(options: UNAuthorizationOptions.badge) { success, error in
      DispatchQueue.main.async {
        print("requested badge permission: ", success, error)
      }
    }
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
    .task {
      viewModel.loadBadgePermission()
      await viewModel.loadFilters(dataService: dataService)
    }
  }

  private var innerBody: some View {
    List {
      Section(header: Text("User Interface")) {
        Toggle("Hide following tab", isOn: $viewModel.hideFollowingTab)
        Toggle("Hide feature section", isOn: $viewModel.hideFeatureSection)
      }

      Section(header: Text("Saved Searches")) {
        ForEach(viewModel.libraryFilters) { filter in
          Text(filter.name)
        }
      }

      Section(header: Text("Application Badge")) {
        Toggle("Display Badge Count", isOn: $viewModel.hasBadgePermission)
          .onChange(of: viewModel.hasBadgePermission) { _ in
            if viewModel.hasBadgePermission {
              viewModel.requestBadgePermission()
            }
          }

        if viewModel.hasBadgePermission {
          NavigationLink(destination: {
            SelectBadgeFilterView(viewModel: viewModel)
          }, label: {
            Text(viewModel.badgeFilter)
          })
        }
      }
    }
  }
}
