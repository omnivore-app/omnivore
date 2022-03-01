import Combine
import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

#if os(macOS)
  struct HomeFeedView: View {
    @EnvironmentObject var dataService: DataService
    @State var searchQuery = ""
    @State private var selectedLinkItem: FeedItem?
    @State private var itemToRemove: FeedItem?
    @State private var confirmationShown = false
    @State private var snoozePresented = false
    @State private var itemToSnooze: FeedItem?

    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      List {
        Section {
          ForEach(viewModel.items) { item in
            FeedCardNavigationLink(
              item: item,
              searchQuery: searchQuery,
              selectedLinkItem: $selectedLinkItem,
              viewModel: viewModel
            )
            .contextMenu {
              FeedItemContextMenuView(
                item: item,
                selectedLinkItem: $selectedLinkItem,
                snoozePresented: $snoozePresented,
                itemToSnooze: $itemToSnooze,
                viewModel: viewModel
              )
            }
          }
        }

        if viewModel.isLoading {
          LoadingSection()
        }
      }
      .listStyle(PlainListStyle())
      .navigationTitle("Home")
      .toolbar {
        ToolbarItem {
          Button(
            action: {
              viewModel.loadItems(dataService: dataService, searchQuery: searchQuery, isRefresh: true)
            },
            label: { Label("Refresh Feed", systemImage: "arrow.clockwise") }
          )
        }
      }
      .onAppear {
        if viewModel.items.isEmpty {
          viewModel.loadItems(dataService: dataService, searchQuery: searchQuery, isRefresh: true)
        }
      }
    }
  }

#endif
