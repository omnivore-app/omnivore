import CoreData
import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

@MainActor func libraryItemMenu(dataService: DataService, viewModel: HomeFeedViewModel, item: Models.LibraryItem) -> some View {
  Group {
    if item.state != "DELETED" {
      Button(
        action: { viewModel.itemUnderTitleEdit = item },
        label: { Label("Edit Info", systemImage: "info.circle") }
      )
      Button(
        action: { viewModel.itemUnderLabelEdit = item },
        label: { Label(item.labels?.count == 0 ? "Add Labels" : "Edit Labels", systemImage: "tag") }
      )
//      Button(action: {
//        withAnimation(.linear(duration: 0.4)) {
//          viewModel.setLinkArchived(
//            dataService: dataService,
//            objectID: item.objectID,
//            archived: !item.isArchived
//          )
//        }
//      }, label: {
//        Label(
//          item.isArchived ? "Unarchive" : "Archive",
//          systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
//        )
//      })
//      Button("Remove Item", role: .destructive) {
//        viewModel.removeLink(dataService: dataService, objectID: item.objectID)
//      }
//      if let author = item.author {
//        Button(
//          action: {
//            viewModel.filterState.searchTerm = "author:\"\(author)\""
//          },
//          label: {
//            Label(String("More by \(author)"), systemImage: "person")
//          }
//        )
//      }
    } else {
      Button(
        action: { viewModel.recoverItem(dataService: dataService, itemID: item.unwrappedID) },
        label: { Label("Recover", systemImage: "trash.slash") }
      )
    }
  }
}
