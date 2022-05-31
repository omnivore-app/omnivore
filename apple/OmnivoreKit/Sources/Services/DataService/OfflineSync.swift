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
      // SaveFile
      uploadFilePublisher(item: item)
        .sink(receiveCompletion: { [weak self] _ in
          print("received PDF saved completion")
        }, receiveValue: { [weak self] _ in
          print("recived save PDF value", item)
        })
        .store(in: &subscriptions)
    case "WEB":
      if item.originalHtml != nil {
        savePagePublisher(item: item)
          .sink(receiveCompletion: { [weak self] _ in
            print("received page saved completion")
          }, receiveValue: { [weak self] _ in
            print("recived save page value", item)
          })
          .store(in: &subscriptions)
      } else {
        saveUrlPublisher(item: item)
          .sink(receiveCompletion: { [weak self] _ in
            print("received url saved completion")
          }, receiveValue: { [weak self] _ in
//            print("recived save url value", item)
          })
          .store(in: &subscriptions)
      }
    case .none:
      print("NONE HANDLER")
    case .some:
      print("SOME HANDLER")
    }
  }

  private func syncLinkedItems(unsyncedLinkedItems: [LinkedItem]) {
    for item in unsyncedLinkedItems {
      guard let syncStatus = ServerSyncStatus(rawValue: Int(item.serverSyncStatus)) else { continue }

      switch syncStatus {
      case .needsCreation:
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
