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
    } else {
      Button(
        action: { viewModel.recoverItem(dataService: dataService, itemID: item.unwrappedID) },
        label: { Label("Recover", systemImage: "trash.slash") }
      )
    }
  }
}
