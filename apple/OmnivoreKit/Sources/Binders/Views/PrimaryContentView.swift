import Models
import Services
import SwiftUI
import Views

public struct PrimaryContentView: View {
  let homeFeedViewModel: HomeFeedViewModel

  public init(services: Services) {
    self.homeFeedViewModel = HomeFeedViewModel.make(services: services)
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
    HomeFeedView(viewModel: homeFeedViewModel)
  }

  // ipad and mac view container
  private var regularView: some View {
    let categories = [
      PrimaryContentCategory.feed(viewModel: homeFeedViewModel),
      PrimaryContentCategory.profile
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
