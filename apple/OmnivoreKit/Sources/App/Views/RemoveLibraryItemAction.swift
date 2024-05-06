
import CoreData
import Foundation
import Models
import Services
import Utils
import Views

func removeLibraryItemAction(dataService: DataService, objectID: NSManagedObjectID) {
  var localPdf: String? = nil

  dataService.viewContext.performAndWait {
    if let item = dataService.viewContext.object(with: objectID) as? Models.LibraryItem {
      item.state = "DELETED"
      try? dataService.viewContext.save()
      localPdf = item.localPDF
    }
  }

  if let localPdf = localPdf, let localPdfURL = PDFUtils.localPdfURL(filename: localPdf) {
    try? FileManager.default.removeItem(at: localPdfURL)
  }

  let syncTask = Task.detached(priority: .background) {
    do {
      try await Task.sleep(nanoseconds: 4_000_000_000)
      let canceled = Task.isCancelled
      if !canceled {
        print("syncing link deletion")
        dataService.removeLibraryItem(objectID: objectID, sync: true)
      }
    } catch {
      print("error running task: ", error)
    }
    print("checking if task is canceled: ", Task.isCancelled)
  }

  Snackbar.show(message: "Item removed", undoAction: {
    print("canceling task", syncTask)
    syncTask.cancel()
    dataService.viewContext.performAndWait {
      if let item = dataService.viewContext.object(with: objectID) as? Models.LibraryItem {
        item.state = "SUCCEEDED"
        try? dataService.viewContext.save()
      }
    }
  }, dismissAfter: 2000)
}

func archiveLibraryItemAction(dataService: DataService, objectID: NSManagedObjectID, archived: Bool) {
  var localPdf: String?
  dataService.viewContext.performAndWait {
    if let item = dataService.viewContext.object(with: objectID) as? Models.LibraryItem {
      item.isArchived = archived
      try? dataService.viewContext.save()
      localPdf = item.localPDF
    }
  }

  // Delete local PDF file if it exists
  if let localPdf = localPdf, let localPdfURL = PDFUtils.localPdfURL(filename: localPdf) {
    try? FileManager.default.removeItem(at: localPdfURL)
  }

  let syncTask = Task.detached(priority: .background) {
    do {
      try await Task.sleep(nanoseconds: 4_000_000_000)
      let canceled = Task.isCancelled
      if !canceled {
        dataService.archiveLink(objectID: objectID, archived: archived)
      }
    } catch {
      print("error running task: ", error)
    }
    print("checking if task is canceled: ", Task.isCancelled)
  }

  Snackbar.show(message: "Item archived", undoAction: {
    print("canceling task", syncTask)
    syncTask.cancel()
    dataService.viewContext.performAndWait {
      if let item = dataService.viewContext.object(with: objectID) as? Models.LibraryItem {
        item.state = "SUCCEEDED"
        try? dataService.viewContext.save()
      }
    }
  }, dismissAfter: 2000)
}
