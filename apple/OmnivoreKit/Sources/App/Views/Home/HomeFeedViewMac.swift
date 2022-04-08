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
    @State private var itemToRemove: FeedItem?
    @State private var confirmationShown = false

    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      if #available(macOS 12.0, *) {
        innerBody
      } else {
        innerBodyMac11
      }
    }

    @available(macOS 12.0, *)
    var innerBody: some View {
      List {
        Section {
          ForEach(viewModel.items) { item in
            FeedCardNavigationLink(
              item: item,
              viewModel: viewModel
            )
            .contextMenu {
              Button(action: {
                viewModel.setLinkArchived(dataService: dataService, linkId: item.id, archived: !item.isArchived)
              }, label: {
                Label(
                  item.isArchived ? "Unarchive" : "Archive",
                  systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
                )
              })
              Button(
                action: {
                  itemToRemove = item
                  confirmationShown = true
                },
                label: { Label("Delete", systemImage: "trash") }
              )
              if FeatureFlag.enableSnooze {
                Button {
                  viewModel.itemToSnooze = item
                  viewModel.snoozePresented = true
                } label: {
                  Label { Text("Snooze") } icon: { Image.moon }
                }
              }
            }
            .alert("Are you sure?", isPresented: $confirmationShown) {
              Button("Remove Link", role: .destructive) {
                if let itemToRemove = itemToRemove {
                  withAnimation {
                    viewModel.removeLink(dataService: dataService, linkId: itemToRemove.id)
                    self.itemToRemove = nil
                  }
                }
              }
              Button("Cancel", role: .cancel) { self.itemToRemove = nil }
            }
          }
        }

        if viewModel.isLoading {
          LoadingSection()
        }
      }
      .listStyle(PlainListStyle())
      .navigationTitle("Home")
      .searchable(
        text: $viewModel.searchQuery,
        placement: .toolbar
      ) {
        if viewModel.searchQuery.isEmpty {
          Text("Inbox").searchCompletion("in:inbox ")
          Text("All").searchCompletion("in:all ")
          Text("Archived").searchCompletion("in:archive ")
          Text("Files").searchCompletion("type:file ")
        }
      }
      .onChange(of: viewModel.searchQuery) { _ in
        // Maybe we should debounce this, but
        // it feels like it works ok without
        viewModel.loadItems(dataService: dataService, isRefresh: true)
      }
      .onSubmit(of: .search) {
        viewModel.loadItems(dataService: dataService, isRefresh: true)
      }
      .toolbar {
        ToolbarItem {
          Button(
            action: {
              viewModel.loadItems(dataService: dataService, isRefresh: true)
            },
            label: { Label("Refresh Feed", systemImage: "arrow.clockwise") }
          )
          .disabled(viewModel.isLoading)
          .opacity(viewModel.isLoading ? 0 : 1)
          .overlay {
            if viewModel.isLoading {
              ProgressView()
            }
          }
        }
      }
      .onAppear {
        if viewModel.items.isEmpty {
          viewModel.loadItems(dataService: dataService, isRefresh: true)
        }
      }
    }

    var innerBodyMac11: some View {
      List {
        Section {
          ForEach(viewModel.items) { item in
            FeedCardNavigationLink(
              item: item,
              viewModel: viewModel
            )
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
              viewModel.loadItems(dataService: dataService, isRefresh: true)
            },
            label: { Label("Refresh Feed", systemImage: "arrow.clockwise") }
          )
        }
      }
      .onAppear {
        if viewModel.items.isEmpty {
          viewModel.loadItems(dataService: dataService, isRefresh: true)
        }
      }
    }
  }

#endif
