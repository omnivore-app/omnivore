import Models
import Services
import SwiftUI
import Views

public struct PrimaryContentView: View {
  let categories = [
    PrimaryContentCategory.feed,
    PrimaryContentCategory.profile
  ]

  public var body: some View {
    #if os(iOS)
      if UIDevice.isIPad {
        splitView
      } else {
        HomeView()
      }
    #elseif os(macOS)
      splitView
    #endif
  }

  #if os(macOS)
    private var splitView: some View {
      NavigationView {
        // The first column is the sidebar.
        PrimaryContentSidebar(categories: categories)
          .navigationTitle("Categories")

        // Second column is the Primary Nav Stack
        PrimaryContentCategory.feed.destinationView

        // Third column is the detail view
        Text("Select a link from the feed")
      }
      .accentColor(.appGrayTextContrast)
    }
  #endif

  #if os(iOS)
    private var splitView: some View {
      NavigationView {
        // The first column is the sidebar.
        PrimaryContentSidebar(categories: categories)
          .navigationTitle("Categories")

        // Second column is the Primary Nav Stack
        PrimaryContentCategory.feed.destinationView
      }
      .accentColor(.appGrayTextContrast)
    }
  #endif
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
