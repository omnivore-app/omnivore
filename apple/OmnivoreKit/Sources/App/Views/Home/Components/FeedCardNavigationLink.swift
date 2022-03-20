import Models
import Services
import SwiftUI
import Views

struct FeedCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService

  let item: FeedItem
  let searchQuery: String

  @Binding var selectedLinkItem: FeedItem?

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      NavigationLink(
        destination: LinkItemDetailView(viewModel: LinkItemDetailViewModel(item: item, homeFeedViewModel: viewModel)),
        tag: item,
        selection: $selectedLinkItem
      ) {
        EmptyView()
      }
      .opacity(0)
      .buttonStyle(PlainButtonStyle())
      .onAppear {
        viewModel.itemAppeared(item: item, searchQuery: searchQuery, dataService: dataService)
      }
      FeedCard(item: item)
    }
  }
}

struct GridCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService

  @State private var scale = 1.0
  @State private var isActive = false

  let item: FeedItem
  let searchQuery: String
  let actionHandler: (GridCardAction) -> Void

  @Binding var selectedLinkItem: FeedItem?
  @Binding var isContextMenuOpen: Bool

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      NavigationLink(
        destination: LinkItemDetailView(viewModel: LinkItemDetailViewModel(item: item, homeFeedViewModel: viewModel)),
        isActive: $isActive
      ) {
        EmptyView()
      }
      GridCard(item: item, isContextMenuOpen: $isContextMenuOpen, actionHandler: actionHandler, tapAction: {
        withAnimation {
          scale = 0.95
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(150)) {
            scale = 1.0
            isActive = true
          }
        }
      })
        .onAppear {
          viewModel.itemAppeared(item: item, searchQuery: searchQuery, dataService: dataService)
        }
    }
    .aspectRatio(2.1, contentMode: .fill)
    .scaleEffect(scale)
  }
}
