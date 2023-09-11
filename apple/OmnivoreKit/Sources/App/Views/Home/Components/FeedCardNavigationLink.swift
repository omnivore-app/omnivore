import Models
import Services
import SwiftUI
import Views

struct MacFeedCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  let item: LinkedItem

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    NavigationLink(
      destination: LinkItemDetailView(
        linkedItemObjectID: item.objectID,
        isPDF: item.isPDF
      ),
      tag: item.objectID,
      selection: $viewModel.selectedLinkItem
    ) {
      LibraryItemCard(item: item, viewer: dataService.currentViewer)
    }
    .opacity(0)
    .buttonStyle(PlainButtonStyle())
    .onAppear {
      Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
    }
  }
}

struct FeedCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  let item: LinkedItem

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    NavigationLink(destination: LinkItemDetailView(
      linkedItemObjectID: item.objectID,
      isPDF: item.isPDF
    ), label: {
      LibraryItemCard(item: item, viewer: dataService.currentViewer)
        .padding(.top, 15)
    })
      .onAppear {
        Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
      }
  }
}

struct GridCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @State private var scale = 1.0

  let item: LinkedItem
  let actionHandler: (GridCardAction) -> Void

  @Binding var isContextMenuOpen: Bool

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    NavigationLink(destination: LinkItemDetailView(
      linkedItemObjectID: item.objectID,
      isPDF: item.isPDF
    )) {
      GridCard(item: item, isContextMenuOpen: $isContextMenuOpen, actionHandler: actionHandler)
    }
    .onAppear {
      Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
    }
    .aspectRatio(1.0, contentMode: .fill)
    .background(
      Color.secondarySystemGroupedBackground
        .onTapGesture {
          if isContextMenuOpen {
            isContextMenuOpen = false
          }
        }
    )
    .cornerRadius(6)
  }
}
