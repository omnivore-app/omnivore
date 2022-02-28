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
