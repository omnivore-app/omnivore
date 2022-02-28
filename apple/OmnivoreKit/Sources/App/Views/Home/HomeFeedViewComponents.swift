import Models
import Services
import SwiftUI
import Utils
import Views

struct FeedItemContextMenuView: View {
  @EnvironmentObject var dataService: DataService

  let item: FeedItem

  @Binding var selectedLinkItem: FeedItem?
  @Binding var snoozePresented: Bool
  @Binding var itemToSnooze: FeedItem?

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    if !item.isArchived {
      Button(action: {
        withAnimation(.linear(duration: 0.4)) {
          viewModel.setLinkArchived(dataService: dataService, linkId: item.id, archived: true)
          if item == selectedLinkItem {
            selectedLinkItem = nil
          }
        }
      }, label: { Label("Archive", systemImage: "archivebox") })
    } else {
      Button(action: {
        withAnimation(.linear(duration: 0.4)) {
          viewModel.setLinkArchived(dataService: dataService, linkId: item.id, archived: false)
        }
      }, label: { Label("Unarchive", systemImage: "tray.and.arrow.down.fill") })
    }
    if FeatureFlag.enableSnooze {
      Button {
        itemToSnooze = item
        snoozePresented = true
      } label: {
        Label { Text("Snooze") } icon: { Image.moon }
      }
    }
  }
}

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

struct LoadingSection: View {
  var body: some View {
    Section {
      HStack(alignment: .center) {
        Spacer()
        Text("Loading...")
        Spacer()
      }
      .frame(maxWidth: .infinity)
    }
  }
}
