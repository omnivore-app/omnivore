import CoreData
import Foundation
import Models

public extension DataService {
  internal func syncOfflineItemsWithServerIfNeeded() async throws {
    // TODO: send a simple request to see if we're online?
    var unsyncedLinkedItems = [LinkedItem]()
    var unsyncedHighlights = [Highlight]()

    // LinkedItems
    let itemsFetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
    itemsFetchRequest.predicate = NSPredicate(
      format: "serverSyncStatus != %i", Int64(ServerSyncStatus.isNSync.rawValue)
    )

    // Highlights
    let highlightsFetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
    highlightsFetchRequest.predicate = NSPredicate(
      format: "serverSyncStatus != %i", Int64(ServerSyncStatus.isNSync.rawValue)
    )

    try await backgroundContext.perform { [weak self] in
      guard let self = self else { return }

      do {
        unsyncedLinkedItems = try itemsFetchRequest.execute()
        unsyncedHighlights = try highlightsFetchRequest.execute()
      } catch {
        throw CoreDataError.general
      }

      self.syncLinkedItems(unsyncedLinkedItems: unsyncedLinkedItems)
      self.syncHighlights(unsyncedHighlights: unsyncedHighlights)
    }
  }

//  func syncPdf(item: LinkedItem, usingSession session: URLSession) async throws -> Bool {
//    try backgroundContext.performAndWait {
//      item.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
//      try self.backgroundContext.save()
//    }
//
//    let id = item.unwrappedID
//    let localPdfURL = item.localPdfURL
//    let url = item.unwrappedPageURLString
//    let uploadRequestUrl = try await uploadFileRequest(id: id, url: url)
//    return await try uploadFile(id: id, localPdfURL: localPdfURL, url: uploadRequestUrl, usingSession: session)
//  }

  func syncPdf(id: String, localPdfURL: URL, url: String) async throws {
//    try backgroundContext.performAndWait {
//      item.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
//      try self.backgroundContext.save()
//    }

    let uploadRequest = try await uploadFileRequest(id: id, url: url)
    if let urlString = uploadRequest.urlString, let uploadUrl = URL(string: urlString) {
      try await uploadFile(id: id, localPdfURL: localPdfURL, url: uploadUrl)
      // try await services.dataService.saveFilePublisher(requestId: requestId, uploadFileId: uploadFileID, url: url)
    } else {
      throw SaveArticleError.badData
    }
  }

  func syncPage(id: String, originalHtml: String, title: String?, url: String) async throws {
    //    try backgroundContext.performAndWait {
    //      item.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
    //      try self.backgroundContext.save()
    //    }
    try await savePage(id: id, url: url, title: title ?? url, originalHtml: originalHtml)
  }

  func syncUrl(id: String, url: String) async throws {
    try await saveURL(id: id, url: url)
  }

  func syncLocalCreatedLinkedItem(item: LinkedItem) {
    switch item.contentReader {
    case "PDF":
//      let id = item.unwrappedID
//      let localPdfURL = item.localPdfURL
//      let url = item.unwrappedPageURLString
//      Task {
//        let uploadRequestUrl = try await uploadFileRequest(id: id, url: url)
//        uploadFile(id: id, localPdfURL: localPdfURL, url: uploadRequestUrl)
//        try await backgroundContext.perform {
//          item.serverSyncStatus = Int64(ServerSyncStatus.isNSync.rawValue)
//          try self.backgroundContext.save()
//        }
//      }
      break
    case "WEB":
      let id = item.unwrappedID
      let url = item.unwrappedPageURLString
      let title = item.unwrappedTitle
      let originalHtml = item.originalHtml

      Task {
        if let originalHtml = originalHtml {
          try await savePage(id: id, url: url, title: title, originalHtml: originalHtml)
        } else {
          try await saveURL(id: id, url: url)
        }
        try await backgroundContext.perform {
          item.serverSyncStatus = Int64(ServerSyncStatus.isNSync.rawValue)
          try self.backgroundContext.save()
        }
      }
    default:
      break
    }
  }

  private func syncLinkedItems(unsyncedLinkedItems: [LinkedItem]) {
    for item in unsyncedLinkedItems {
      guard let syncStatus = ServerSyncStatus(rawValue: Int(item.serverSyncStatus)) else { continue }

      switch syncStatus {
      case .needsCreation:
        item.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
        syncLocalCreatedLinkedItem(item: item)
      case .isNSync, .isSyncing:
        break
      case .needsDeletion:
        item.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
        syncLinkDeletion(itemID: item.unwrappedID, objectID: item.objectID)
      case .needsUpdate:
        item.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
        syncLinkArchiveStatus(itemID: item.unwrappedID, objectID: item.objectID, archived: item.isArchived)
        syncLinkReadingProgress(
          itemID: item.unwrappedID,
          objectID: item.objectID,
          readingProgress: item.readingProgress,
          anchorIndex: Int(item.readingProgressAnchor)
        )
      }
    }
  }

  private func syncHighlights(unsyncedHighlights: [Highlight]) {
    for highlight in unsyncedHighlights {
      guard let syncStatus = ServerSyncStatus(rawValue: Int(highlight.serverSyncStatus)) else { continue }

      switch syncStatus {
      case .isNSync, .isSyncing:
        break
      case .needsCreation:
        highlight.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
        syncHighlightCreation(
          highlight: InternalHighlight.make(from: highlight),
          articleId: highlight.linkedItem?.unwrappedID ?? ""
        )
      case .needsDeletion:
        highlight.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
        syncHighlightDeletion(highlightID: highlight.unwrappedID, objectID: highlight.objectID)
      case .needsUpdate:
        if let annotation = highlight.annotation {
          highlight.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
          syncHighlightAttributes(
            highlightID: highlight.unwrappedID,
            objectID: highlight.objectID,
            annotation: annotation
          )
        } else {
          highlight.serverSyncStatus = Int64(ServerSyncStatus.isNSync.rawValue)
        }
      }
    }
  }

  @objc
  func locallyCreatedItemSynced(notification: NSNotification) {
    print("SYNCED LOCALLY CREATED ITEM", notification)
    if let objectId = notification.userInfo?["objectID"] as? String {
      do {
        try backgroundContext.performAndWait {
          let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
          fetchRequest.predicate = NSPredicate(format: "id == %@", objectId)
          if let existingItem = try? self.backgroundContext.fetch(fetchRequest).first {
            existingItem.serverSyncStatus = Int64(ServerSyncStatus.isNSync.rawValue)
            try self.backgroundContext.save()
          }
        }
      } catch {
        print("ERROR", error)
      }
    }
  }
}
