
import CoreData
import Foundation
import Models
import Services
import Views

func removeLibraryItemAction(dataService: DataService, objectID: NSManagedObjectID) {
  dataService.viewContext.performAndWait {
    if let item = dataService.viewContext.object(with: objectID) as? LinkedItem {
      item.state = "DELETED"
      try? dataService.viewContext.save()
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

  Snackbar.show(message: "Item removed", undoAction: {
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
