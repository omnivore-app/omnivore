import Combine
import Models
import SwiftUI

public final class PrimaryContentViewModel: ObservableObject {
  let categories: [PrimaryContentCategory]

  public enum Action {
    case nothing
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init(
    homeFeedViewModel: HomeFeedViewModel,
    profileContainerViewModel: ProfileContainerViewModel
  ) {
    self.categories = [
      .feed(viewModel: homeFeedViewModel),
      .profile(viewModel: profileContainerViewModel)
    ]
  }
}

public struct PrimaryContentView: View {
  @ObservedObject private var viewModel: PrimaryContentViewModel
  @State private var currentTab = 0

  public init(viewModel: PrimaryContentViewModel) {
    self.viewModel = viewModel
  }

  public var body: some View {
    #if os(iOS)
      if UIDevice.isIPad {
        regularView
      } else {
        compactView
      }
    #elseif os(macOS)
      regularView
    #endif
  }

  // iphone view container
  private var compactView: some View {
    TabView(selection: $currentTab) {
      ForEach(viewModel.categories.indices, id: \.self) { index in
        viewModel.categories[index].destinationView
          .tabItem {
            TabIcon(isSelected: currentTab == index, primaryContentCategory: viewModel.categories[index])
          }
          .tag(index)
      }
    }
    .accentColor(.appGrayTextContrast)
  }

  // ipad and mac view container
  private var regularView: some View {
    NavigationView {
      // The first column is the sidebar.
      PrimaryContentSidebar(categories: viewModel.categories)
        .navigationTitle("Categories")

      // Initial Content of second column
      if let destinationView = viewModel.categories.first?.destinationView {
        destinationView
      } else {
        Text("Select a Category")
      }

      // Initial content of detail view
      Text("No Selection")
    }
    .accentColor(.appGrayTextContrast)
  }
}

struct PrimaryContentSidebar: View {
  @State private var selectedCategory: PrimaryContentCategory?
  let categories: [PrimaryContentCategory]

  var innerBody: some View {
    List(categories) { category in
      NavigationLink(
        destination: category.destinationView,
        tag: category,
        selection: $selectedCategory,
        label: { category.listLabel }
      )
    }
    .listStyle(SidebarListStyle())
  }

  var body: some View {
    #if os(iOS)
      innerBody
    #elseif os(macOS)
      innerBody
        .frame(minWidth: 200)
        .toolbar {
          ToolbarItem {
            Button(
              action: {
                NSApp.keyWindow?.firstResponder?.tryToPerform(
                  #selector(NSSplitViewController.toggleSidebar(_:)), with: nil
                )
              },
              label: { Label("Toggle sidebar", systemImage: "sidebar.left") }
            )
          }
        }
    #endif
  }
}
