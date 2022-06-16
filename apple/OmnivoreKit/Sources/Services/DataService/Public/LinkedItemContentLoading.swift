import CoreData
import Foundation
import Models

public extension DataService {
  func prefetchPages(itemIDs: [String], username: String) async {
    // TODO: make this concurrent
    for itemID in itemIDs {
      await prefetchPage(pendingLink: PendingLink(itemID: itemID, retryCount: 1), username: username)
    }
  }

  func loadArticleContentWithRetries(
    itemID: String,
    username: String? = nil,
    requestCount: Int = 1
  ) async throws -> ArticleContent {
    guard requestCount < 7 else {
      throw ContentFetchError.badData
    }

    guard let username = username ?? currentViewer?.username else {
      throw ContentFetchError.unauthorized
    }

    let fetchedContent = try await loadArticleContent(username: username, itemID: itemID, useCache: true)

    switch fetchedContent.contentStatus {
    case .failed:
      throw ContentFetchError.badData
    case .processing:
      let retryDelayInNanoSeconds = UInt64(requestCount * 2 * 1_000_000_000)
      try await Task.sleep(nanoseconds: retryDelayInNanoSeconds)
      logger.debug("fetching content for \(itemID). request count: \(requestCount)")
      return try await loadArticleContentWithRetries(itemID: itemID, username: username, requestCount: requestCount + 1)
    case .succeeded, .unknown:
      return fetchedContent
    }
  }

  func syncUnsyncedArticleContent(itemID: String) async {
    let linkedItemFetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
    linkedItemFetchRequest.predicate = NSPredicate(
      format: "id == %@", itemID
    )

    let context = backgroundContext

    var id: String?
    var url: String?
    var title: String?
    var originalHtml: String?
    var serverSyncStatus: Int64?

    backgroundContext.performAndWait {
      guard let linkedItem = try? context.fetch(linkedItemFetchRequest).first else { return }
      id = linkedItem.unwrappedID
      url = linkedItem.unwrappedPageURLString
      title = linkedItem.unwrappedTitle
      originalHtml = linkedItem.originalHtml
      serverSyncStatus = linkedItem.serverSyncStatus
    }

    guard let id = id, let url = url, let title = title,
          let serverSyncStatus = serverSyncStatus,
          serverSyncStatus == ServerSyncStatus.needsCreation.rawValue
    else {
      return
    }

    do {
      if let originalHtml = originalHtml {
        _ = try await savePage(id: id, url: url, title: title, originalHtml: originalHtml)
      } else {
        _ = try await saveURL(id: id, url: url)
      }
    } catch {
      // We don't propogate these errors, we just let it pass through so
      // the user can attempt to fetch content again.
      print("Error syncUnsyncedArticleContent")
    }
  }
}
