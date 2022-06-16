import CoreData
import Foundation
import Models
import SwiftGraphQL
import Utils

extension DataService {
  struct PendingLink {
    let itemID: String
    let retryCount: Int
  }

  public func prefetchPages(itemIDs: [String], username: String) async {
    // TODO: make this concurrent
    for itemID in itemIDs {
      await prefetchPage(pendingLink: PendingLink(itemID: itemID, retryCount: 1), username: username)
    }
  }

  func prefetchPage(pendingLink: PendingLink, username: String) async {
    let content = try? await loadArticleContent(username: username, itemID: pendingLink.itemID, useCache: false)

    if content?.contentStatus == .processing, pendingLink.retryCount < 7 {
      let retryDelayInNanoSeconds = UInt64(pendingLink.retryCount * 2 * 1_000_000_000)

      do {
        try await Task.sleep(nanoseconds: retryDelayInNanoSeconds)
        logger.debug("fetching content for \(pendingLink.itemID). retry count: \(pendingLink.retryCount)")

        await prefetchPage(
          pendingLink: PendingLink(
            itemID: pendingLink.itemID,
            retryCount: pendingLink.retryCount + 1
          ),
          username: username
        )
      } catch {
        logger.debug("prefetching task was cancelled")
      }
    }
  }

  public func loadArticleContent(
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
      return try await loadArticleContent(itemID: itemID, username: username, requestCount: requestCount + 1)
    case .succeeded, .unknown:
      return fetchedContent
    }
  }

  func loadArticleContent(username: String, itemID: String, useCache: Bool) async throws -> ArticleContent {
    if useCache, let cachedContent = await cachedArticleContent(itemID: itemID) {
      return cachedContent
    }

    // If the page was locally created, make sure they are synced before we pull content
    await syncUnsyncedArticleContent(itemID: itemID)

    let fetchResult = try await articleContentFetch(username: username, itemID: itemID)

    let articleContent = ArticleContent(
      title: fetchResult.item.title,
      htmlContent: fetchResult.htmlContent,
      highlightsJSONString: fetchResult.highlights.asJSONString,
      contentStatus: fetchResult.item.isPDF ? .succeeded : fetchResult.item.state
    )

    if articleContent.contentStatus == .succeeded {
      do {
        try await persistArticleContent(articleProps: fetchResult)
      } catch {
        var message = "unknown error"
        let basicError = (error as? BasicError) ?? BasicError.message(messageText: "unknown error")
        if case let BasicError.message(messageText) = basicError {
          message = messageText
        }
        throw ContentFetchError.unknown(description: message)
      }
    }

    return articleContent
  }

  // swiftlint:disable:next function_body_length
  func persistArticleContent(articleProps: ArticleProps) async throws {
    var needsPDFDownload = false

    await backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "id == %@", articleProps.item.id)

      let existingItem = try? self.backgroundContext.fetch(fetchRequest).first
      let linkedItem = existingItem ?? LinkedItem(entity: LinkedItem.entity(), insertInto: self.backgroundContext)

      let highlightObjects = articleProps.highlights.map {
        $0.asManagedObject(context: self.backgroundContext)
      }
      linkedItem.addToHighlights(NSSet(array: highlightObjects))
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
      _ = try await fetchPDFData(slug: articleProps.item.slug, pageURLString: articleProps.item.pageURLString)
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
  }

  public func fetchPDFData(slug: String, pageURLString: String) async throws -> URL? {
    guard let url = URL(string: pageURLString) else {
      throw BasicError.message(messageText: "No PDF URL found")
    }
    let result: (Data, URLResponse)? = try? await URLSession.shared.data(from: url)
    guard let httpResponse = result?.1 as? HTTPURLResponse, 200 ..< 300 ~= httpResponse.statusCode else {
      throw BasicError.message(messageText: "pdfFetch failed. no response or bad status code.")
    }
    guard let data = result?.0 else {
      throw BasicError.message(messageText: "pdfFetch failed. no data received.")
    }

    var localPdfURL: URL?
    let tempPath = FileManager.default
      .urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(UUID().uuidString + ".pdf")

    try await backgroundContext.perform { [weak self] in
      let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "%K == %@", #keyPath(LinkedItem.slug), slug)

      let linkedItem = try? self?.backgroundContext.fetch(fetchRequest).first
      guard let linkedItem = linkedItem else {
        let errorMessage = "pdfFetch failed. could not find LinkedItem from fetch request"
        throw BasicError.message(messageText: errorMessage)
      }

      do {
        try data.write(to: tempPath)
        let localPDF = try PDFUtils.moveToLocal(url: tempPath)
        localPdfURL = PDFUtils.localPdfURL(filename: localPDF)
        linkedItem.tempPDFURL = nil
        linkedItem.localPDF = localPDF
        try self?.backgroundContext.save()
      } catch {
        self?.backgroundContext.rollback()
        let errorMessage = "pdfFetch failed. core data save failed."
        throw BasicError.message(messageText: errorMessage)
      }
    }

    return localPdfURL
  }

  func cachedArticleContent(itemID: String) async -> ArticleContent? {
    let linkedItemFetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
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
        highlightsJSONString: highlights.map { InternalHighlight.make(from: $0) }.asJSONString,
        contentStatus: .succeeded
      )
    }
  }

  public func syncUnsyncedArticleContent(itemID: String) async {
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
