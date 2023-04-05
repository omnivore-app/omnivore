import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

#if os(macOS)
  struct HomeFeedView: View {
    @EnvironmentObject var dataService: DataService
    @EnvironmentObject var audioController: AudioController
    @State private var itemToRemove: LinkedItem?
    @State private var confirmationShown = false

    @ObservedObject var viewModel: HomeFeedViewModel

    func loadItems(isRefresh: Bool) {
      Task {
        await viewModel.loadItems(
          dataService: dataService,
          isRefresh: isRefresh
        )
      }
    }

    var body: some View {
      ZStack {
        if let linkRequest = viewModel.linkRequest {
          NavigationLink(
            destination: WebReaderLoadingContainer(requestID: linkRequest.serverID),
            tag: linkRequest,
            selection: $viewModel.linkRequest
          ) {
            EmptyView()
          }
        }
        List {
          Section {
            ForEach(viewModel.items) { item in
              MacFeedCardNavigationLink(
                item: item,
                viewModel: viewModel
              )
              .contextMenu {
                Button(
                  action: { viewModel.itemUnderTitleEdit = item },
                  label: { Label("Edit Info", systemImage: "info.circle") }
                )
                Button(
                  action: { viewModel.itemUnderLabelEdit = item },
                  label: { Label(item.labels?.count == 0 ? "Add Labels" : "Edit Labels", systemImage: "tag") }
                )
                Button(action: {
                  withAnimation(.linear(duration: 0.4)) {
                    viewModel.setLinkArchived(
                      dataService: dataService,
                      objectID: item.objectID,
                      archived: !item.isArchived
                    )
                  }
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
                    viewModel.itemToSnoozeID = item.id
                    viewModel.snoozePresented = true
                  } label: {
                    Label { Text(LocalText.genericSnooze) } icon: { Image.moon }
                  }
                }
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
          text: $viewModel.searchTerm,
          placement: .toolbar
        ) {
          if viewModel.searchTerm.isEmpty {
            Text(LocalText.inboxGeneric).searchCompletion("in:inbox ")
            Text(LocalText.allGeneric).searchCompletion("in:all ")
            Text(LocalText.archivedGeneric).searchCompletion("in:archive ")
            Text(LocalText.filesGeneric).searchCompletion("type:file ")
          }
        }
        .onChange(of: viewModel.searchTerm) { _ in
          // Maybe we should debounce this, but
          // it feels like it works ok without
          loadItems(isRefresh: true)
        }
        .onSubmit(of: .search) {
          loadItems(isRefresh: true)
        }
        .toolbar {
          ToolbarItem {
            Button(
              action: {
                loadItems(isRefresh: true)
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
      }
      .alert("Are you sure?", isPresented: $confirmationShown) {
        Button("Remove Link", role: .destructive) {
          if let itemToRemove = itemToRemove {
            withAnimation {
              viewModel.removeLink(dataService: dataService, objectID: itemToRemove.objectID)
              self.itemToRemove = nil
            }
          }
        }
        Button(LocalText.cancelGeneric, role: .cancel) { self.itemToRemove = nil }
      }
      .sheet(item: $viewModel.itemUnderLabelEdit) { item in
        ApplyLabelsView(mode: .item(item), isSearchFocused: false, onSave: nil)
      }
      .sheet(item: $viewModel.itemUnderTitleEdit) { item in
        LinkedItemMetadataEditView(item: item)
      }
      .task {
        if viewModel.items.isEmpty {
          loadItems(isRefresh: true)
        }
      }
      .handlesExternalEvents(preferring: Set(["shareExtensionRequestID"]), allowing: Set(["*"]))
      .onOpenURL { url in
        viewModel.linkRequest = nil
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
          if let linkRequestID = DeepLink.make(from: url)?.linkRequestID {
            viewModel.linkRequest = LinkRequest(id: UUID(), serverID: linkRequestID)
          }
        }
      }
    }
  }

#endif
