import CoreData
import Foundation
import Models
import Utils

public extension DataService {
  func syncOfflineItemsWithServerIfNeeded() async throws {
    var unsyncedLinkedItems = [LibraryItem]()
    var unsyncedHighlights = [Highlight]()

    // LinkedItems
    let itemsFetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
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

  private func updateLinkedItemStatus(id: String, newId: String?, status: ServerSyncStatus) async throws {
    backgroundContext.performAndWait {
      let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "id == %@", id)

      guard let linkedItem = (try? backgroundContext.fetch(fetchRequest))?.first else { return }
      if let newId = newId {
        linkedItem.id = newId
      }
      linkedItem.serverSyncStatus = Int64(status.rawValue)
    }
  }

  func createPageFromPdf(id: String, localPdfURL: URL, url: String) async throws {
    do {
      try await updateLinkedItemStatus(id: id, newId: nil, status: .isSyncing)

      let uploadRequest = try await uploadFileRequest(id: id, url: url)
      if let urlString = uploadRequest.urlString, let uploadUrl = URL(string: urlString) {
        try await uploadFile(id: uploadRequest.pageId, localPdfURL: localPdfURL, url: uploadUrl)
      } else {
        throw SaveArticleError.badData
      }

      try await updateLinkedItemStatus(id: id, newId: uploadRequest.pageId, status: .isNSync)
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

  func createPage(id: String, originalHtml: String, title: String?, url: String) async throws -> String {
    do {
      try await updateLinkedItemStatus(id: id, newId: nil, status: .isSyncing)

      let newId = try await savePage(id: id, url: url, title: title ?? url, originalHtml: originalHtml)
      try await updateLinkedItemStatus(id: id, newId: newId, status: .isNSync)
      try backgroundContext.performAndWait {
        try backgroundContext.save()
      }
      return newId ?? id
    } catch {
      backgroundContext.performAndWait {
        backgroundContext.rollback()
      }
      throw error
    }
  }

  func createPageFromUrl(id: String, url: String) async throws -> String {
    do {
      try await updateLinkedItemStatus(id: id, newId: nil, status: .isSyncing)

      let newId = try await saveURL(id: id, url: url)
      try await updateLinkedItemStatus(id: id, newId: newId, status: .isNSync)
      try backgroundContext.performAndWait {
        try backgroundContext.save()
      }
      return newId ?? id
    } catch {
      backgroundContext.performAndWait {
        backgroundContext.rollback()
      }
      throw error
    }
  }

  func syncLocalCreatedLinkedItem(item: LibraryItem) {
    switch item.contentReader {
    case "PDF":
      let id = item.unwrappedID
      let url = item.unwrappedPageURLString
      if let localPDF = item.localPDF, let localPdfURL = PDFUtils.localPdfURL(filename: localPDF) {
        Task {
          try await createPageFromPdf(id: id, localPdfURL: localPdfURL, url: url)
        }
      }
    case "WEB":
      let id = item.unwrappedID
      let url = item.unwrappedPageURLString
      let title = item.unwrappedTitle
      let originalHtml = item.originalHtml

      Task {
        if let originalHtml = originalHtml {
          _ = try await createPage(id: id, originalHtml: originalHtml, title: title, url: url)
        } else {
          _ = try await createPageFromUrl(id: id, url: url)
        }
      }
    default:
      break
    }
  }

  private func syncLinkedItems(unsyncedLinkedItems: [LibraryItem]) {
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
        syncLinkDeletion(itemID: item.unwrappedID)
      case .needsUpdate:
        item.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
        syncLinkArchiveStatus(itemID: item.unwrappedID, archived: item.isArchived)

        item.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
        syncLinkReadingProgress(
          itemID: item.unwrappedID,
          readingProgress: item.readingProgress,
          anchorIndex: Int(item.readingProgressAnchor),
          force: item.isPDF
        )
        // If the items folder might have changed, sync that.
        if let itemID = item.id, let folder = item.folder, folder != "following" {
          syncMoveToFolder(itemID: itemID, folder: folder)
        }
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
        syncHighlightDeletion(highlightID: highlight.unwrappedID)
      case .needsUpdate:
        if let annotation = highlight.annotation {
          highlight.serverSyncStatus = Int64(ServerSyncStatus.isSyncing.rawValue)
          syncHighlightAttributes(highlightID: highlight.unwrappedID, annotation: annotation)
        } else {
          highlight.serverSyncStatus = Int64(ServerSyncStatus.isNSync.rawValue)
        }
      }
    }
  }
}
