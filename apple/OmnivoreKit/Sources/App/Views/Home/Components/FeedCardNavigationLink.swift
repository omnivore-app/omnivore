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
    .onAppear {
      Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
    }
  }
}

struct FeedCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  let item: Models.LibraryItem
  let isInMultiSelectMode: Bool
  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      LibraryItemCard(item: item, viewer: dataService.currentViewer)
      PresentationLink(
        transition: PresentationLinkTransition.slide(
          options: PresentationLinkTransition.SlideTransitionOptions(edge: .trailing,
                                                                     options:
                                                                     PresentationLinkTransition.Options(
                                                                       modalPresentationCapturesStatusBarAppearance: true
                                                                     ))),
        destination: {
          LinkItemDetailView(
            linkedItemObjectID: item.objectID,
            isPDF: item.isPDF
          )
        }, label: {
          EmptyView()
        }
      )
    }
    .onAppear {
      Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
    }
  }
}

struct GridCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @State private var scale = 1.0

  let item: Models.LibraryItem
  let actionHandler: (GridCardAction) -> Void

  @Binding var isContextMenuOpen: Bool

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    PresentationLink(
      transition: PresentationLinkTransition.slide(
        options: PresentationLinkTransition.SlideTransitionOptions(edge: .trailing,
                                                                   options:
                                                                   PresentationLinkTransition.Options(
                                                                     modalPresentationCapturesStatusBarAppearance: true
                                                                   ))),
      destination: {
        LinkItemDetailView(
          linkedItemObjectID: item.objectID,
          isPDF: item.isPDF
        )
      }, label: {
        GridCard(item: item, isContextMenuOpen: $isContextMenuOpen, actionHandler: actionHandler)
      }
    )
//    NavigationLink(destination: LinkItemDetailView(
//      linkedItemObjectID: item.objectID,
//      isPDF: item.isPDF
//    )) {
//
//    }
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
