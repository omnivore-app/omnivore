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
    NavigationLink(
      destination: LinkItemDetailView(viewModel: LinkItemDetailViewModel(item: item)),
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

struct GridCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService

  let item: FeedItem
  let searchQuery: String
  let actionHandler: (GridCardAction) -> Void

  @Binding var selectedLinkItem: FeedItem?

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      NavigationLink(
        destination: LinkItemDetailView(viewModel: LinkItemDetailViewModel(item: item)),
        tag: item,
        selection: $selectedLinkItem
      ) {
        GridCard(item: item, actionHandler: actionHandler)
      }
      .buttonStyle(FlatLinkStyle())
      .onAppear {
        viewModel.itemAppeared(item: item, searchQuery: searchQuery, dataService: dataService)
      }
    }
  }
}

struct FlatLinkStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
  }
}
