
import CoreData
import Foundation
import Models
import Services
import Utils
import Views

func removeLibraryItemAction(dataService: DataService, objectID: NSManagedObjectID) {
  dataService.viewContext.performAndWait {
    if let item = dataService.viewContext.object(with: objectID) as? LinkedItem {
      item.state = "DELETED"
      try? dataService.viewContext.save()

      // Delete local PDF file if it exists
      if let localPdf = item.localPDF, let localPdfURL = PDFUtils.localPdfURL(filename: localPdf) {
        try? FileManager.default.removeItem(at: localPdfURL)
      }
    }
  }

  let syncTask = Task.detached(priority: .background) {
    do {
      try await Task.sleep(nanoseconds: 4_000_000_000)
      let canceled = Task.isCancelled
      if !canceled {
        print("syncing link deletion")
        dataService.removeLink(objectID: objectID, sync: true)
      }
    } catch {
      print("error running task: ", error)
    }
    print("checking if task is canceled: ", Task.isCancelled)
  }

  Snackbar.showInLibrary(message: "Item removed", undoAction: {
    print("canceling task", syncTask)
    syncTask.cancel()
    dataService.viewContext.performAndWait {
      if let item = dataService.viewContext.object(with: objectID) as? LinkedItem {
        item.state = "SUCCEEDED"
        try? dataService.viewContext.save()
      }
    }
  })
}
