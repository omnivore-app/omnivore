import CoreData
import Foundation
import Models
import Utils

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

      // Check for an updated itemID
      // May have changed in the loadArticleContent call
      let updatedItemID = await linkedItemID(from: itemID)

      return try await loadArticleContentWithRetries(
        itemID: updatedItemID ?? itemID,
        username: username,
        requestCount: requestCount + 1
      )
    case .succeeded, .unknown:
      return fetchedContent
    }
  }
}
