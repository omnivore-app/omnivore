import Models
import Services
import SwiftUI
import Views

struct FeedCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioSession: AudioController

  let item: LinkedItem

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      Button(
        action: {
          viewModel.selectedItem = item
          viewModel.linkIsActive = true
        }) {
        NavigationLink(destination: EmptyView()) {
          EmptyView()
        }
        .opacity(0)
        .buttonStyle(PlainButtonStyle())
        .onAppear {
          Task { await viewModel.itemAppeared(item: item, dataService: dataService, audioSession: audioSession) }
        }
        FeedCard(item: item)
      }
    }
  }
}

struct GridCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioSession: AudioController

  @State private var scale = 1.0

  let item: LinkedItem
  let actionHandler: (GridCardAction) -> Void

  @Binding var isContextMenuOpen: Bool

  @ObservedObject var viewModel: HomeFeedViewModel

  func tapAction() {
    scale = 0.95
    DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(150)) {
      scale = 1.0
      viewModel.selectedItem = item
      viewModel.linkIsActive = true
    }
  }

  var body: some View {
    ZStack {
      NavigationLink(destination: EmptyView()) {
        EmptyView()
      }
      GridCard(item: item, isContextMenuOpen: $isContextMenuOpen, actionHandler: actionHandler, tapAction: {
        withAnimation { tapAction() }
      })
        .onAppear {
          Task { await viewModel.itemAppeared(item: item, dataService: dataService, audioSession: audioSession) }
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
