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
    @EnvironmentObject var authenticator: Authenticator

    @State private var itemToRemove: Models.LibraryItem?
    @State private var confirmationShown = false
    @State private var presentProfileSheet = false
    @State private var addLinkPresented = false

    @Namespace var mainNamespace

    @ObservedObject var viewModel: HomeFeedViewModel

    func loadItems(isRefresh: Bool) {
      Task {
        await viewModel.loadItems(
          dataService: dataService,
          isRefresh: isRefresh
        )
      }
    }

    func menuItems(_ item: Models.LibraryItem) -> some View {
      Group {
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
          label: { Label("Remove", systemImage: "trash") }
        )
      }
    }

    var addLinkButton: some View {
      Button(
        action: {
          addLinkPresented = true
        },
        label: { Label("Add link", systemImage: "plus") }
      )
    }

    var refreshButton: some View {
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
            .controlSize(.small)
        }
      }
    }

    var itemsList: some View {
      VStack {
        MacSearchBar(searchTerm: $viewModel.searchTerm)
          .padding(.leading, 10)
          .padding(.trailing, 10)
          .prefersDefaultFocus(false, in: mainNamespace)

        List {
          ForEach(viewModel.items) { item in
            MacFeedCardNavigationLink(
              item: item,
              viewModel: viewModel
            )
            .listRowInsets(EdgeInsets())
            .contextMenu {
              menuItems(item)
            }
          }

          if viewModel.isLoading {
            LoadingSection()
          }
        }
        .padding(0)
        .listStyle(InsetListStyle())
        .navigationTitle("Library")
        .onChange(of: viewModel.searchTerm) { _ in
          loadItems(isRefresh: true)
        }
        .toolbar {
          Spacer()
          addLinkButton
          refreshButton
        }
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
        itemsList
      }
      .alert("Are you sure?", isPresented: $confirmationShown) {
        Button("Remove Link", role: .destructive) {
          if let itemToRemove = itemToRemove {
            withAnimation {
              viewModel.removeLibraryItem(dataService: dataService, objectID: itemToRemove.objectID)
              self.itemToRemove = nil
            }
          }
        }
        Button(LocalText.cancelGeneric, role: .cancel) { self.itemToRemove = nil }
      }
      .sheet(item: $viewModel.itemUnderLabelEdit) { item in
        ApplyLabelsView(mode: .item(item), onSave: nil)
      }
      .sheet(item: $viewModel.itemUnderTitleEdit) { item in
        LinkedItemMetadataEditView(item: item)
      }
      .sheet(isPresented: $presentProfileSheet) {
        ProfileView()
      }
      .sheet(isPresented: $addLinkPresented) {
        LibraryAddLinkView()
          .frame(width: 450, height: 160)
      }
      .onReceive(NSNotification.displayProfilePublisher) { _ in
        presentProfileSheet = true
      }
      .onReceive(NSNotification.logoutPublisher) { _ in
        authenticator.logout(dataService: dataService)
      }
      .task {
        if viewModel.items.isEmpty {
          loadItems(isRefresh: true)
        }
      }
      .focusScope(mainNamespace)
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
