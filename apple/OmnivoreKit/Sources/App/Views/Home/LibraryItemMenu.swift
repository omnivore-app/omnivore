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
        action: { viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: !item.isArchived) },
        label: {
          Label(
            item.isArchived ? "Unarchive" : "Archive",
            systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
          )
        }
      )
      Button(
        action: { viewModel.removeLibraryItem(dataService: dataService, objectID: item.objectID) },
        label: { Label("Remove", systemImage: "trash") }
      )
      Button(
        action: { viewModel.itemUnderLabelEdit = item },
        label: { Label(item.labels?.count == 0 ? "Add Labels" : "Edit Labels", systemImage: "tag") }
      )
    } else {
      Button(
        action: { viewModel.recoverItem(dataService: dataService, itemID: item.unwrappedID) },
        label: { Label("Recover", systemImage: "trash.slash") }
      )
    }
  }
}
