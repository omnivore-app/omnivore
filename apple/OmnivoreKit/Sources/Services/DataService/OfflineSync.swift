import CoreData
import Foundation
import Models

extension DataService {
  func syncOfflineItemsWithServerIfNeeded() async throws {
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

  public func syncLocalCreatedLinkedItem(item: LinkedItem) {
    switch item.contentReader {
    case "PDF":
      let id = item.unwrappedID
      let localPdfURL = item.localPdfURL
      let url = item.unwrappedPageURLString
      Task {
        let uploadRequestUrl = try await uploadFileRequest(id: id, url: url)
        await uploadFile(localPdfURL: localPdfURL, url: uploadRequestUrl)
        try await backgroundContext.perform {
          item.serverSyncStatus = Int64(ServerSyncStatus.isNSync.rawValue)
          try self.backgroundContext.save()
        }
      }
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
        // TODO: We will want to sync items that need creation in the background
        // these items are forced to sync when saved, but should be re-tried in
        // the background.
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
}
