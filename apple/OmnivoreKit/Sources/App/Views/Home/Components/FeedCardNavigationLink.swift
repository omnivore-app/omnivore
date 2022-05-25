import Models
import Services
import SwiftUI
import Views

struct FeedCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService

  let item: LinkedItem

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    let destination = LinkItemDetailView(
      viewModel: LinkItemDetailViewModel(
        linkedItemObjectID: item.objectID,
        dataService: dataService
      )
    )
    #if os(iOS)
      let modifiedDestination = destination
        .navigationTitle("")
    #else
      let modifiedDestination = destination
    #endif

    return ZStack {
      NavigationLink(
        destination: modifiedDestination,
        tag: item.objectID,
        selection: $viewModel.selectedLinkItem
      ) {
        EmptyView()
      }
      .opacity(0)
      .buttonStyle(PlainButtonStyle())
      .onAppear {
        Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
      }
      FeedCard(item: item)
    }
  }
}

struct GridCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService

  @State private var scale = 1.0

  let item: LinkedItem
  let actionHandler: (GridCardAction) -> Void

  @Binding var isContextMenuOpen: Bool

  @ObservedObject var viewModel: HomeFeedViewModel

  func tapAction() {
    scale = 0.95
    DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(150)) {
      scale = 1.0
      viewModel.selectedLinkItem = item.objectID
    }
  }

  var body: some View {
    let destination = LinkItemDetailView(
      viewModel: LinkItemDetailViewModel(
        linkedItemObjectID: item.objectID,
        dataService: dataService
      )
    )
    #if os(iOS)
      let modifiedDestination = destination
        .navigationTitle("")
    #else
      let modifiedDestination = destination
    #endif

    return ZStack {
      NavigationLink(
        destination: modifiedDestination,
        tag: item.objectID,
        selection: $viewModel.selectedLinkItem
      ) {
        EmptyView()
      }
      GridCard(item: item, isContextMenuOpen: $isContextMenuOpen, actionHandler: actionHandler, tapAction: {
        withAnimation { tapAction() }
      })
        .onAppear {
          Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
        }
    }
    .aspectRatio(1.8, contentMode: .fill)
    .scaleEffect(scale)
    .background(
      Color.secondarySystemGroupedBackground
        .onTapGesture {
          if isContextMenuOpen {
            isContextMenuOpen = false
          } else {
            withAnimation {
              tapAction()
            }
          }
        }
    )
    .cornerRadius(6)
  }
}
