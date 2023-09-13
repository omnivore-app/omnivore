import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class BriefingViewModel: ObservableObject {
  @Published var item: LinkedItem?

  func loadItem(articleId: String, dataService: DataService) async {
    let item = await dataService.viewContext.perform {
      LinkedItem.lookup(byID: articleId, inContext: dataService.viewContext)
      // dataService.viewContext.object(with: linkedItemObjectID) as? LinkedItem
    }

    if let item = item {
      self.item = item
    }
  }

//  func handleArchiveAction(dataService: DataService) {
//    guard let objectID = item?.objectID ?? pdfItem?.objectID else { return }
//    dataService.archiveLink(objectID: objectID, archived: !isItemArchived)
//    showInSnackbar(!isItemArchived ? "Link archived" : "Link moved to Inbox")
//  }
//
//  func handleDeleteAction(dataService: DataService) {
//    guard let objectID = item?.objectID ?? pdfItem?.objectID else { return }
//    showInSnackbar("Link removed")
//    dataService.removeLink(objectID: objectID)
//  }
//
//  func updateItemReadStatus(dataService: DataService) {
//    guard let itemID = item?.unwrappedID ?? pdfItem?.itemID else { return }
//
//    dataService.updateLinkReadingProgress(
//      itemID: itemID,
//      readingProgress: isItemRead ? 0 : 100,
//      anchorIndex: 0
//    )
//  }

//  private func trackReadEvent() {
//    guard let itemID = item?.unwrappedID ?? pdfItem?.itemID else { return }
//    guard let slug = item?.unwrappedSlug ?? pdfItem?.slug else { return }
//    guard let originalArticleURL = item?.unwrappedPageURLString ?? pdfItem?.originalArticleURL else { return }
//
//    EventTracker.track(
//      .linkRead(
//        linkID: itemID,
//        slug: slug,
//        originalArticleURL: originalArticleURL
//      )
//    )
//  }
}

struct BriefingView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>

  static let navBarHeight = 50.0
  let articleId: String

  @StateObject private var viewModel = BriefingViewModel()
  @State private var showFontSizePopover = false
  @State private var showTitleEdit = false
  @State private var navBarVisibilityRatio = 1.0
  @State private var showDeleteConfirmation = false

  var removeLinkToolbarItem: some View {
    Button(
      action: { print("delete item action") },
      label: {
        Image(systemName: "trash")
      }
    )
  }

  var body: some View {
    ZStack { // Using ZStack so .task can be used on if/else body
      if let item = viewModel.item {
        WebReaderContainerView(item: item, pop: {})
      }
    }
    .task {
      await viewModel.loadItem(articleId: articleId, dataService: dataService)
      NotificationCenter.default.post(Notification(name: Notification.Name("ReaderSettingsChanged")))
//      static var readerSettingsChangedPublisher: NotificationCenter.Publisher {
//        NotificationCenter.default.publisher(for: ReaderSettingsChanged)
//      }
    }
    #if os(iOS)
      .navigationBarHidden(true)
    #endif
  }

  var navBar: some View {
    HStack(alignment: .center) {
      Spacer()
      Button(
        action: { showFontSizePopover.toggle() },
        label: {
          Image(systemName: "textformat.size")
            .font(.appTitleTwo)
        }
      )
      .padding(.horizontal)
      .scaleEffect(navBarVisibilityRatio)
      Menu(
        content: {
          Group {
            Button(
              action: { showTitleEdit = true },
              label: { Label("Edit Info", systemImage: "info.circle") }
            )
//            Button(
//              action: { viewModel.handleArchiveAction(dataService: dataService) },
//              label: {
//                Label(
//                  viewModel.isItemArchived ? "Unarchive" : "Archive",
//                  systemImage: viewModel.isItemArchived ? "tray.and.arrow.down.fill" : "archivebox"
//                )
//              }
//            )
            Button(
              action: { showDeleteConfirmation = true },
              label: { Label("Delete", systemImage: "trash") }
            )
          }
        },
        label: {
          Image(systemName: "ellipsis")
            .padding(.horizontal)
            .scaleEffect(navBarVisibilityRatio)
        }
      )
    }
    .frame(height: readerViewNavBarHeight * navBarVisibilityRatio)
    .opacity(navBarVisibilityRatio)
    .background(Color.systemBackground)
    .onTapGesture {
      showFontSizePopover = false
    }
    .alert("Are you sure?", isPresented: $showDeleteConfirmation) {
//      Button("Remove Link", role: .destructive) {
//        viewModel.handleDeleteAction(dataService: dataService)
//      }
      Button(LocalText.cancelGeneric, role: .cancel, action: {})
    }
    .sheet(isPresented: $showTitleEdit) {
      if let item = viewModel.item {
        LinkedItemMetadataEditView(item: item)
      }
    }
  }
}
