import CoreData
import Foundation
import Models
import Utils

extension DataService {
  public func prefetchPage(itemID: String, retryCount: Int, username: String) async {
    let content = try? await loadArticleContent(username: username, itemID: itemID, useCache: true)

    if content?.contentStatus == .processing, retryCount < 4 {
      let retryDelayInNanoSeconds = UInt64(retryCount * 2 * 1_000_000_000)

      do {
        try await Task.sleep(nanoseconds: retryDelayInNanoSeconds)
        logger.debug("fetching content for \(itemID). retry count: \(retryCount)")

        await prefetchPage(
          itemID: itemID,
          retryCount: retryCount + 1,
          username: username
        )
      } catch {
        logger.debug("prefetching task was cancelled")
      }
    }
  }

  func loadArticleContent(username: String, itemID: String, useCache: Bool) async throws -> ArticleContent {
    var objectID: NSManagedObjectID?
    if useCache, let cachedContent = await cachedArticleContent(itemID: itemID) {
      return cachedContent
    }

    // If the page was locally created, make sure they are synced before we pull content
    await syncUnsyncedArticleContent(itemID: itemID)

    let fetchResult = try await articleContentFetch(username: username, itemID: itemID)
    let contentStatus = fetchResult.item.isPDF ? .succeeded : fetchResult.item.state

    if contentStatus == .succeeded {
      do {
        objectID = try await persistArticleContent(articleProps: fetchResult)
      } catch {
        print("caught article content error: ", error)
        var message = "unknown error"
        let basicError = (error as? BasicError) ?? BasicError.message(messageText: "unknown error")
        if case let BasicError.message(messageText) = basicError {
          message = messageText
        }
        throw ContentFetchError.unknown(description: message)
      }
    }

    return ArticleContent(
      title: fetchResult.item.title,
      htmlContent: fetchResult.htmlContent,
      highlightsJSONString: fetchResult.highlights.asJSONString,
      contentStatus: fetchResult.item.isPDF ? .succeeded : fetchResult.item.state,
      objectID: objectID,
      downloadURL: fetchResult.item.downloadURL
    )
  }

  func cachedArticleContent(itemID: String) async -> ArticleContent? {
    let linkedItemFetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
    linkedItemFetchRequest.predicate = NSPredicate(
      format: "id == %@", itemID
    )

    let context = backgroundContext

    return await context.perform(schedule: .immediate) {
      guard let linkedItem = try? context.fetch(linkedItemFetchRequest).first else { return nil }
      guard let htmlContent = linkedItem.htmlContent else { return nil }

      let highlights = linkedItem
        .highlights
        .asArray(of: Highlight.self)
        .filter { $0.serverSyncStatus != ServerSyncStatus.needsDeletion.rawValue }

      return ArticleContent(
        title: linkedItem.unwrappedTitle,
        htmlContent: htmlContent,
        highlightsJSONString: highlights
          .filter { $0.serverSyncStatus != ServerSyncStatus.needsDeletion.rawValue }
          .map { InternalHighlight.make(from: $0) }.asJSONString,
        contentStatus: .succeeded,
        objectID: linkedItem.objectID,
        downloadURL: linkedItem.downloadURL ?? ""
      )
    }
  }

  // swiftlint:disable:next function_body_length
  func persistArticleContent(articleProps: ArticleProps) async throws -> NSManagedObjectID? {
    var needsPDFDownload = false
    var objectID: NSManagedObjectID?

    await backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "id == %@", articleProps.item.id)

      let existingItem = try? self.backgroundContext.fetch(fetchRequest).first
      let linkedItem = existingItem ?? LibraryItem(entity: LibraryItem.entity(), insertInto: self.backgroundContext)
      objectID = linkedItem.objectID

      let highlightObjects = articleProps.highlights.map {
        $0.asManagedObject(context: self.backgroundContext)
      }

      let unsyncedHighlights = existingItem?.highlights?.filter { highlight in
        if let highlight = highlight as? Highlight, highlight.serverSyncStatus == ServerSyncStatus.isNSync.rawValue {
          return false
        }
        return true
      }.compactMap { $0 as? Highlight } ?? []

      linkedItem.highlights = NSSet(array: highlightObjects + unsyncedHighlights)
      linkedItem.htmlContent = articleProps.htmlContent
      linkedItem.id = articleProps.item.id
      linkedItem.state = articleProps.item.state.rawValue
      linkedItem.title = articleProps.item.title
      linkedItem.createdAt = articleProps.item.createdAt
      linkedItem.savedAt = articleProps.item.savedAt
      linkedItem.readingProgress = articleProps.item.readingProgress
      linkedItem.readingProgressAnchor = Int64(articleProps.item.readingProgressAnchor)
      linkedItem.imageURLString = articleProps.item.imageURLString
      linkedItem.onDeviceImageURLString = articleProps.item.onDeviceImageURLString
      linkedItem.pageURLString = articleProps.item.pageURLString
      linkedItem.descriptionText = articleProps.item.descriptionText
      linkedItem.publisherURLString = articleProps.item.publisherURLString
      linkedItem.author = articleProps.item.author
      linkedItem.publishDate = articleProps.item.publishDate
      linkedItem.slug = articleProps.item.slug
      linkedItem.readAt = articleProps.item.readAt
      linkedItem.isArchived = articleProps.item.isArchived
      linkedItem.contentReader = articleProps.item.contentReader
      linkedItem.serverSyncStatus = Int64(ServerSyncStatus.isNSync.rawValue)

      if articleProps.item.isPDF {
        needsPDFDownload = true

        // Check if we already have the PDF item locally. Either in temporary
        // space, or in the documents directory
        if let localPDF = existingItem?.localPDF {
          if PDFUtils.exists(filename: localPDF) {
            linkedItem.localPDF = localPDF
            needsPDFDownload = false
          }
        }

        if let tempPDFURL = existingItem?.tempPDFURL {
          linkedItem.localPDF = try? PDFUtils.moveToLocal(url: tempPDFURL)
          _ = PDFUtils.exists(filename: linkedItem.localPDF)
          if linkedItem.localPDF != nil {
            needsPDFDownload = false
          }
        }
      }
    }

    if articleProps.item.isPDF, needsPDFDownload {
      _ = try await loadPDFData(slug: articleProps.item.slug, downloadURL: articleProps.item.downloadURL)
    }

    try await backgroundContext.perform { [weak self] in
      do {
        try self?.backgroundContext.save()
        logger.debug("ArticleContent saved succesfully")
      } catch {
        self?.backgroundContext.rollback()
        logger.debug("Failed to save ArticleContent")
        throw error
      }
    }

    return objectID
  }

  /// Queries CoreData for a LinkedItem using a requestID.
  /// - Parameter requestID: A requestID used to check on a newly created item.
  /// - Returns: The id of the CoreData object if found.
  func linkedItemID(from requestID: String) async -> String? {
    await backgroundContext.perform(schedule: .immediate) {
      let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "createdId == %@ OR id == %@", requestID, requestID)
      return try? self.backgroundContext.fetch(fetchRequest).first?.unwrappedID
    }
  }

  func syncUnsyncedArticleContent(itemID: String) async {
    let linkedItemFetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
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
      // We don't propagate these errors, we just let it pass through so
      // the user can attempt to fetch content again.
      print("Error syncUnsyncedArticleContent", error)
    }
  }
}
