import Combine
import Models
import SwiftUI

public final class PrimaryContentViewModel: ObservableObject {
  let homeFeedViewModel: HomeFeedViewModel
  let profileContainerViewModel: ProfileContainerViewModel

  public init(
    homeFeedViewModel: HomeFeedViewModel,
    profileContainerViewModel: ProfileContainerViewModel
  ) {
    self.homeFeedViewModel = homeFeedViewModel
    self.profileContainerViewModel = profileContainerViewModel
  }
}

public struct PrimaryContentView: View {
  @ObservedObject private var viewModel: PrimaryContentViewModel

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
    HomeFeedView(viewModel: viewModel.homeFeedViewModel)
  }

  // ipad and mac view container
  private var regularView: some View {
    let categories = [
      PrimaryContentCategory.feed(viewModel: viewModel.homeFeedViewModel),
      PrimaryContentCategory.profile(viewModel: viewModel.profileContainerViewModel)
    ]

    return NavigationView {
      // The first column is the sidebar.
      PrimaryContentSidebar(categories: categories)
        .navigationTitle("Categories")

      // Initial Content of second column
      if let destinationView = categories.first?.destinationView {
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
