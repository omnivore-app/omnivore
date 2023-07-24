import Models
import Services
import SwiftUI
import Views

@MainActor public struct PrimaryContentView: View {
  let categories = [
    PrimaryContentCategory.feed,
    PrimaryContentCategory.profile
  ]

  public var body: some View {
    innerBody
  }

  public var innerBody: some View {
    #if os(iOS)
      if UIDevice.isIPad {
        return AnyView(splitView)
      } else {
        return AnyView(LibraryTabView())
      }
    #else
      return AnyView(splitView)
    #endif
  }

  #if os(macOS)
    private var splitView: some View {
      NavigationView {
        PrimaryContentCategory.feed.destinationView
        Text(LocalText.navigationSelectLink)
      }
      .accentColor(.appGrayTextContrast)
    }
  #endif

  #if os(iOS)
    private var splitView: some View {
      NavigationView {
        // The first column is the sidebar.
        PrimaryContentSidebar(categories: categories)

        // Second column is the Primary Nav Stack
        PrimaryContentCategory.feed.destinationView
      }
      .accentColor(.appGrayTextContrast)
      .introspectSplitViewController {
        $0.preferredSplitBehavior = .tile
        $0.preferredPrimaryColumnWidth = 160
        $0.presentsWithGesture = false
        $0.displayModeButtonVisibility = .always
      }
    }
  #endif
}

@MainActor struct PrimaryContentSidebar: View {
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
      #if os(iOS)
        .listRowBackground(
          category == selectedCategory
            ? Color.appGraySolid.opacity(0.4).cornerRadius(8)
            : Color.clear.cornerRadius(8)
        )
      #endif
    }
    .dynamicTypeSize(.small ... .large)
    .listStyle(.sidebar)
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
              label: { Label(LocalText.navigationSelectSidebarToggle, systemImage: "sidebar.left") }
            )
          }
        }
    #endif
  }
}
