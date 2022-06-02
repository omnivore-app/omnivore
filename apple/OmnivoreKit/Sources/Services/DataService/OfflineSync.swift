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

  private func updateLinkedItemStatus(id: String, status: ServerSyncStatus) async throws {
    try backgroundContext.performAndWait {
      let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "id == %@", id)

      guard let linkedItem = (try? backgroundContext.fetch(fetchRequest))?.first else { return }
      linkedItem.serverSyncStatus = Int64(status.rawValue)
    }
  }

  func syncPdf(id: String, localPdfURL: URL, url: String) async throws {
    do {
      let uploadRequest = try await uploadFileRequest(id: id, url: url)
      if let urlString = uploadRequest.urlString, let uploadUrl = URL(string: urlString) {
        try await uploadFile(id: id, localPdfURL: localPdfURL, url: uploadUrl)
        // try await services.dataService.saveFilePublisher(requestId: requestId, uploadFileId: uploadFileID, url: url)
      } else {
        throw SaveArticleError.badData
      }

      try await updateLinkedItemStatus(id: id, status: .isNSync)
      try backgroundContext.performAndWait {
        try backgroundContext.save()
      }
    } catch {
      backgroundContext.rollback()
      throw error
    }
  }

  func syncPage(id: String, originalHtml: String, title: String?, url: String) async throws {
    do {
      try await savePage(id: id, url: url, title: title ?? url, originalHtml: originalHtml)
      try await updateLinkedItemStatus(id: id, status: .isNSync)
      try backgroundContext.performAndWait {
        try backgroundContext.save()
      }
    } catch {
      backgroundContext.performAndWait {
        backgroundContext.rollback()
      }
      throw error
    }
  }

  func syncUrl(id: String, url: String) async throws {
    do {
      try await updateLinkedItemStatus(id: id, status: .isSyncing)
      try await saveURL(id: id, url: url)
      try backgroundContext.performAndWait {
        try backgroundContext.save()
      }
    } catch {
      backgroundContext.performAndWait {
        backgroundContext.rollback()
      }
      throw error
    }
  }

  func syncLocalCreatedLinkedItem(item: LinkedItem) {
    switch item.contentReader {
    case "PDF":
      let id = item.unwrappedID
      let localPdfURL = item.localPdfURL
      let url = item.unwrappedPageURLString

      if let pdfUrlStr = localPdfURL, let localPdfURL = URL(string: pdfUrlStr) {
        Task {
          try await syncPdf(id: id, localPdfURL: localPdfURL, url: url)
        }
      } else {
        // TODO: This is an invalid object, we should have a way of reflecting that with an error state
        // updateLinkedItemStatus(id: id, status: .)
      }
    case "WEB":
      let id = item.unwrappedID
      let url = item.unwrappedPageURLString
      let title = item.unwrappedTitle
      let originalHtml = item.originalHtml

      Task {
        if let originalHtml = originalHtml {
          try await syncPage(id: id, originalHtml: originalHtml, title: title, url: url)
        } else {
          try await syncUrl(id: id, url: url)
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
