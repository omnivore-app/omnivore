import Models
import Services
import SwiftUI
import Transmission
import Views

struct MacFeedCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  let item: Models.LibraryItem

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      LibraryItemCard(item: item, viewer: dataService.currentViewer)
      NavigationLink(destination: LinkItemDetailView(
        linkedItemObjectID: item.objectID,
        isPDF: item.isPDF
      ), label: {
        EmptyView()
      }).opacity(0)
    }
  }
}

struct LibraryItemListNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  let item: Models.LibraryItem
  let viewModel: HomeFeedViewModel

  var body: some View {
    Button(action: {
      viewModel.presentItem(item: item)
    }, label: {
      LibraryItemCard(item: item, viewer: dataService.currentViewer)
    })
  }
}

struct LibraryItemGridCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @State private var scale = 1.0

  @ObservedObject var item: Models.LibraryItem
  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    Button(action: {
      viewModel.presentItem(item: item)
    }, label: {
      GridCard(item: item)
    })
    .buttonStyle(.plain)
    .aspectRatio(1.0, contentMode: .fill)
    .background(Color.systemBackground)
    .cornerRadius(6)
  }
}
