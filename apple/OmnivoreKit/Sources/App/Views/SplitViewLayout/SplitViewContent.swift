import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

struct LibraryContainerView: View {
  @State var hasHighlightMutations = false
  @State var searchPresented = false
  @State var addLinkPresented = false
  @State var settingsPresented = false

  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @State var prefersListLayout = true
  @AppStorage(UserDefaultKey.shouldPromptCommunityModal.rawValue) var shouldPromptCommunityModal = true
  @ObservedObject var viewModel: LibraryViewModel

  func loadItems(isRefresh: Bool) {
    Task { await viewModel.loadItems(dataService: dataService, isRefresh: isRefresh) }
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
      LibraryListView(viewModel: viewModel)
        .refreshable { loadItems(isRefresh: true) }
        .onChange(of: viewModel.searchTerm) { _ in loadItems(isRefresh: true) }
        .onChange(of: viewModel.selectedLabels) { _ in loadItems(isRefresh: true) }
        .onChange(of: viewModel.negatedLabels) { _ in loadItems(isRefresh: true) }
        .onChange(of: viewModel.appliedFilter) { _ in loadItems(isRefresh: true) }
        .onChange(of: viewModel.appliedSort) { _ in loadItems(isRefresh: true) }
        .sheet(item: $viewModel.itemUnderLabelEdit) { item in
          ApplyLabelsView(mode: .item(item), isSearchFocused: false, onSave: nil)
        }
        .sheet(item: $viewModel.itemUnderTitleEdit) { item in
          LinkedItemMetadataEditView(item: item)
        }
        .sheet(item: $viewModel.itemForHighlightsView) { item in
          NotebookView(itemObjectID: item.objectID, hasHighlightMutations: $hasHighlightMutations)
        }
        .sheet(isPresented: $viewModel.showCommunityModal) {
          CommunityModal()
            .onAppear {
              shouldPromptCommunityModal = false
            }
        }
        .toolbar {
          ToolbarItem(placement: .barLeading) {
            Button(action: {
              viewModel.showCommunityModal = true
            }, label: {
              Image.smallOmnivoreLogo
                .renderingMode(.template)
                .resizable()
                .frame(width: 24, height: 24)
                .foregroundColor(.appGrayTextContrast)
                .overlay(alignment: .topTrailing, content: {
                  if shouldPromptCommunityModal {
                    Circle()
                      .fill(Color.red)
                      .frame(width: 6, height: 6)
                  }
                })
            })
          }
          ToolbarItem(placement: .barTrailing) {
            Button("", action: {})
              .disabled(true)
              .overlay {
                if viewModel.isLoading {
                  ProgressView()
                }
              }
          }
          ToolbarItem(placement: .barTrailing) {
            Button(
              action: { searchPresented = true },
              label: {
                Image(systemName: "magnifyingglass")
                  .resizable()
                  .frame(width: 18, height: 18)
                  .padding(.vertical)
                  .foregroundColor(.appGrayTextContrast)
              }
            )
          }
          ToolbarItem(placement: .barTrailing) {
            EmptyView()
          }
        }
    }
    .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
      loadItems(isRefresh: false)
    }
    .onReceive(NotificationCenter.default.publisher(for: Notification.Name("PushJSONArticle"))) { notification in
      guard let jsonArticle = notification.userInfo?["article"] as? JSONArticle else { return }
      guard let objectID = dataService.persist(jsonArticle: jsonArticle) else { return }
      guard let linkedItem = dataService.viewContext.object(with: objectID) as? LinkedItem else { return }
      viewModel.pushFeedItem(item: linkedItem)
      viewModel.selectedItem = linkedItem
      viewModel.linkIsActive = true
    }
    .onReceive(NSNotification.pushReaderItemPublisher) { notification in
      if let objectID = notification.userInfo?["objectID"] as? NSManagedObjectID {
        viewModel.handleReaderItemNotification(objectID: objectID, dataService: dataService)
      }
    }
    .onOpenURL { url in
      withoutAnimation {
        viewModel.linkRequest = nil
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
          if let linkRequestID = DeepLink.make(from: url)?.linkRequestID {
            viewModel.linkRequest = LinkRequest(id: UUID(), serverID: linkRequestID)
          }
        }
      }
    }
    .formSheet(isPresented: $viewModel.snoozePresented) {
      SnoozeView(
        snoozePresented: $viewModel.snoozePresented,
        itemToSnoozeID: $viewModel.itemToSnoozeID
      ) { snoozeParams in
        Task {
          await viewModel.snoozeUntil(
            dataService: dataService,
            linkId: snoozeParams.feedItemId,
            until: snoozeParams.snoozeUntilDate,
            successMessage: snoozeParams.successMessage
          )
        }
      }
    }
    .fullScreenCover(isPresented: $searchPresented) {
      LibrarySearchView(homeFeedViewModel: self.viewModel)
    }
    .sheet(isPresented: $addLinkPresented) {
      NavigationView {
        LibraryAddLinkView()
      }
    }
    .sheet(isPresented: $settingsPresented) {
      NavigationView {
        ProfileView()
      }
    }
    .task {
      if viewModel.items.isEmpty {
        loadItems(isRefresh: false)
      }
    }
  }
}

struct LibraryListView: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @State private var itemToRemove: LinkedItem?
  @State private var confirmationShown = false
  @State private var showHideFeatureAlert = false

  @ObservedObject var viewModel: LibraryViewModel

  var filtersHeader: some View {
    GeometryReader { reader in
      ScrollView(.horizontal, showsIndicators: false) {
        HStack {
          if viewModel.searchTerm.count > 0 {
            TextChipButton.makeSearchFilterButton(title: viewModel.searchTerm) {
              viewModel.searchTerm = ""
            }.frame(maxWidth: reader.size.width * 0.66)
          } else {
            Menu(
              content: {
                ForEach(LinkedItemFilter.allCases, id: \.self) { filter in
                  Button(filter.displayName, action: { viewModel.appliedFilter = filter.rawValue })
                }
              },
              label: {
                TextChipButton.makeMenuButton(
                  title: LinkedItemFilter(rawValue: viewModel.appliedFilter)?.displayName ?? "Filter"
                )
              }
            )
          }
          Menu(
            content: {
              ForEach(LinkedItemSort.allCases, id: \.self) { sort in
                Button(sort.displayName, action: { viewModel.appliedSort = sort.rawValue })
              }
            },
            label: {
              TextChipButton.makeMenuButton(
                title: LinkedItemSort(rawValue: viewModel.appliedSort)?.displayName ?? "Sort"
              )
            }
          )
          TextChipButton.makeAddLabelButton {
            viewModel.showLabelsSheet = true
          }
          ForEach(viewModel.selectedLabels, id: \.self) { label in
            TextChipButton.makeRemovableLabelButton(feedItemLabel: label, negated: false) {
              viewModel.selectedLabels.removeAll { $0.id == label.id }
            }
          }
          ForEach(viewModel.negatedLabels, id: \.self) { label in
            TextChipButton.makeRemovableLabelButton(feedItemLabel: label, negated: true) {
              viewModel.negatedLabels.removeAll { $0.id == label.id }
            }
          }
          Spacer()
        }
        .padding(0)
      }
      .listRowSeparator(.hidden)
    }
  }

  func menuItems(for item: LinkedItem) -> some View {
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
      Button("Remove Item", role: .destructive) {
        itemToRemove = item
        confirmationShown = true
      }
      if FeatureFlag.enableSnooze {
        Button {
          viewModel.itemToSnoozeID = item.id
          viewModel.snoozePresented = true
        } label: {
          Label { Text(LocalText.genericSnooze) } icon: { Image.moon }
        }
      }
      if let author = item.author {
        Button(
          action: {
            viewModel.searchTerm = "author:\"\(author)\""
          },
          label: {
            Label(String("More by \(author)"), systemImage: "person")
          }
        )
      }
    }
  }

  var featureCard: some View {
    VStack(alignment: .leading, spacing: 20) {
      Menu(content: {
        Button(action: {
          viewModel.updateFeatureFilter(.continueReading)
        }, label: {
          Text("Continue Reading")
        })
        Button(action: {
          viewModel.updateFeatureFilter(.pinned)
        }, label: {
          Text("Pinned")
        })
        Button(action: {
          viewModel.updateFeatureFilter(.newsletters)
        }, label: {
          Text("Newsletters")
        })
        Button(action: {
          showHideFeatureAlert = true
        }, label: {
          Text("Hide this Section")
        })
      }, label: {
        HStack(alignment: .center) {
          Text(viewModel.featureFilter.title.uppercased())
            .font(Font.system(size: 14, weight: .regular))
          Image(systemName: "chevron.down")
        }.frame(maxWidth: .infinity, alignment: .leading)
      })
        .padding(.top, 20)
        .padding(.bottom, 0)

      GeometryReader { geo in

        ScrollView(.horizontal, showsIndicators: false) {
          if viewModel.featureItems.count > 0 {
            LazyHStack(alignment: .top, spacing: 20) {
              ForEach(viewModel.featureItems) { item in
                LibraryFeatureCardNavigationLink(item: item, viewModel: viewModel)
                  .background(
                    RoundedRectangle(cornerRadius: 12) // << tune as needed
                      .fill(Color(UIColor.systemBackground)) // << fill with system color
                  )
              }
            }
          } else {
            Text(viewModel.featureFilter.emptyMessage)
              .font(Font.system(size: 14, weight: .regular))
              .foregroundColor(Color(hex: "#898989"))
              .frame(maxWidth: geo.size.width)
              .frame(height: 60, alignment: .topLeading)
              .fixedSize(horizontal: false, vertical: true)
          }
        }
      }

      Text((LinkedItemFilter(rawValue: viewModel.appliedFilter)?.displayName ?? "Inbox").uppercased())
        .font(Font.system(size: 14, weight: .regular))
        .padding(.bottom, 5)
    }
  }

  var body: some View {
    ZStack {
      NavigationLink(
        destination: LinkDestination(selectedItem: viewModel.selectedItem),
        isActive: $viewModel.linkIsActive
      ) {
        EmptyView()
      }
      VStack(spacing: 0) {
        if viewModel.showLoadingBar {
          ShimmeringLoader()
        } else {
          Spacer(minLength: 2)
        }

        List {
          filtersHeader
            .listRowInsets(.init(top: 0, leading: 10, bottom: 10, trailing: 10))

          // Only show the feature card section if we have items loaded
          if !viewModel.hideFeatureSection, viewModel.items.count > 0 {
            featureCard
              .listRowInsets(.init(top: 0, leading: 10, bottom: 10, trailing: 10))
              .modifier(AnimatingCellHeight(height: viewModel.featureItems.count > 0 ? 260 : 130))
          }

          ForEach(viewModel.items) { item in
            FeedCardNavigationLink(
              item: item,
              viewModel: viewModel
            )
            .listRowSeparatorTint(Color.thBorderColor)
            .listRowInsets(.init(top: 0, leading: 10, bottom: 10, trailing: 10))
            .contextMenu {
              menuItems(for: item)
            }
            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
              if !item.isArchived {
                Button(action: {
                  withAnimation(.linear(duration: 0.4)) {
                    viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: true)
                  }
                }, label: {
                  Label("Archive", systemImage: "archivebox")
                }).tint(.green)
              } else {
                Button(action: {
                  withAnimation(.linear(duration: 0.4)) {
                    viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: false)
                  }
                }, label: {
                  Label("Unarchive", systemImage: "tray.and.arrow.down.fill")
                }).tint(.indigo)
              }
              Button(
                action: {
                  itemToRemove = item
                  confirmationShown = true
                },
                label: {
                  Image(systemName: "trash")
                }
              ).tint(.red)
            }
            .swipeActions(edge: .leading, allowsFullSwipe: true) {
              if FeatureFlag.enableSnooze {
                Button {
                  viewModel.itemToSnoozeID = item.id
                  viewModel.snoozePresented = true
                } label: {
                  Label { Text(LocalText.genericSnooze) } icon: { Image.moon }
                }.tint(.appYellow48)
              }
            }
          }
        }
        .padding(0)
        .listStyle(PlainListStyle())
        .listRowInsets(.init(top: 0, leading: 0, bottom: 0, trailing: 0))
        .alert("Are you sure you want to delete this item? All associated notes and highlights will be deleted.",
               isPresented: $confirmationShown) {
          Button("Remove Item", role: .destructive) {
            if let itemToRemove = itemToRemove {
              withAnimation {
                viewModel.removeLink(dataService: dataService, objectID: itemToRemove.objectID)
              }
            }
            self.itemToRemove = nil
          }
          Button(LocalText.cancelGeneric, role: .cancel) { self.itemToRemove = nil }
        }
      }
      .alert("The Feature Section will be removed from your library. You can add it back from the filter settings in your profile.",
             isPresented: $showHideFeatureAlert) {
        Button("OK", role: .destructive) {
          viewModel.hideFeatureSection = true
        }
        Button(LocalText.cancelGeneric, role: .cancel) { self.showHideFeatureAlert = false }
      }
    }
  }
}
