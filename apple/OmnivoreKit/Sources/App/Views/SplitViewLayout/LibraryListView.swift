import Models
import Services
import SwiftUI
import Utils
import Views

struct LibraryListView: View {
  @EnvironmentObject var dataService: DataService
  
  @ObservedObject var viewModel: LibraryViewModel
  @ObservedObject var navigationModel: NavigationModel
  
  @State private var itemToRemove: LinkedItem?
  @State private var confirmationShown = false
  @State private var showHideFeatureAlert = false
  
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
    List {
      if viewModel.showLoadingBar {
        ShimmeringLoader()
      }
      
      // Only show the feature card section if we have items loaded
      if !viewModel.hideFeatureSection, viewModel.items.count > 0 {
        featureCard
          .listRowInsets(.init(top: 0, leading: 10, bottom: 10, trailing: 10))
          .modifier(AnimatingCellHeight(height: viewModel.featureItems.count > 0 ? 260 : 130))
      }
      
      ForEach(viewModel.items) { item in
        let isSelected = item.objectID == navigationModel.detailViewNavigation.objectID

        Button(
          action: {
            print("tapped on item with objectID: \(item.objectID)")
            navigationModel.detailViewNavigation = .empty
            if item.isPDF {
              navigationModel.detailViewNavigation = DetailViewNavigation.savedItemPDFObject(
                objectID: item.objectID
              )
            } else {
              navigationModel.detailViewNavigation = DetailViewNavigation.savedItemObject(
                objectID: item.objectID
              )
            }
          },
          label: {
            LibraryItemCard(item: item)
              .buttonStyle(PlainButtonStyle())
              .onAppear {
                Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
              }
          }
        )
        .listRowBackground(isSelected ? Color.thBorderColor : Color.clear)
        .listRowSeparatorTint(Color.thBorderColor)
        .listRowInsets(.init(top: 0, leading: 10, bottom: 10, trailing: 10))
      }
    }
  }
  
  var bodyold: some View {
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
//          filtersHeader
//            .listRowInsets(.init(top: 0, leading: 10, bottom: 10, trailing: 10))

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
