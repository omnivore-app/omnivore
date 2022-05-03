import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  struct PendingLink {
    let itemID: String
    let retryCount: Int
  }

  public func prefetchPages(itemIDs: [String]) async {
    guard let username = currentViewer?.username else { return }

    for itemID in itemIDs {
      await prefetchPage(pendingLink: PendingLink(itemID: itemID, retryCount: 1), username: username)
    }
  }

  func prefetchPage(pendingLink: PendingLink, username: String) async {
    let content = try? await articleContent(username: username, itemID: pendingLink.itemID, useCache: false)

    if content?.contentStatus == .processing, pendingLink.retryCount < 6 {
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

  public func fetchArticleContent(
    itemID: String,
    username: String? = nil,
    requestCount: Int = 1
  ) async throws -> ArticleContent {
    guard let username = username ?? currentViewer?.username else {
      throw BasicError.message(messageText: "username could not be fetched from core data")
    }

    guard let fetchedContent = try? await articleContent(username: username, itemID: itemID, useCache: true) else {
      throw BasicError.message(messageText: "networking error")
    }

    switch fetchedContent.contentStatus {
    case .failed, .unknown:
      throw BasicError.message(messageText: "content fetch failed")
    case .processing:
      do {
        let retryDelayInNanoSeconds = UInt64(requestCount * 2 * 1_000_000_000)
        try await Task.sleep(nanoseconds: retryDelayInNanoSeconds)
        logger.debug("fetching content for \(itemID). request count: \(requestCount)")
        return try await fetchArticleContent(itemID: itemID, username: username, requestCount: requestCount + 1)
      } catch {
        throw BasicError.message(messageText: "content fetch failed")
      }
    case .succeeded:
      return fetchedContent
    }
  }

  public func articleContent(username: String, itemID: String, useCache: Bool) async throws -> ArticleContent {
    struct ArticleProps {
      let htmlContent: String
      let highlights: [InternalHighlight]
      let contentStatus: Enums.ArticleSavingRequestStatus?
    }

    if useCache, let cachedContent = await cachedArticleContent(itemID: itemID) {
      return cachedContent
    }

    enum QueryResult {
      case success(result: ArticleProps)
      case error(error: String)
    }

    let articleSelection = Selection.Article {
      ArticleProps(
        htmlContent: try $0.content(),
        highlights: try $0.highlights(selection: highlightSelection.list),
        contentStatus: try $0.state()
      )
    }

    let selection = Selection<QueryResult, Unions.ArticleResult> {
      try $0.on(
        articleError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        articleSuccess: .init {
          QueryResult.success(result: try $0.article(selection: articleSelection))
        }
      )
    }

    let query = Selection.Query {
      // backend has a hack that allows us to pass in itemID in place of slug
      try $0.article(slug: itemID, username: username, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { [weak self] queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case let .success(result: result):
          if let status = result.contentStatus, status == .succeeded {
            self?.persistArticleContent(
              htmlContent: result.htmlContent,
              itemID: itemID,
              highlights: result.highlights
            )
          }

          let articleContent = ArticleContent(
            htmlContent: result.htmlContent,
            highlightsJSONString: result.highlights.asJSONString,
            contentStatus: .make(from: result.contentStatus)
          )

          continuation.resume(returning: articleContent)
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "LinkedItem fetch error"))
        }
      }
    }
  }

  func persistArticleContent(htmlContent: String, itemID: String, highlights: [InternalHighlight]) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "id == %@", itemID)

      let linkedItem = try? self.backgroundContext.fetch(fetchRequest).first

      guard let linkedItem = linkedItem else { return }

      let highlightObjects = highlights.map {
        $0.asManagedObject(context: self.backgroundContext)
      }
      linkedItem.addToHighlights(NSSet(array: highlightObjects))
      linkedItem.htmlContent = htmlContent

      if linkedItem.isPDF {
        self.fetchPDFData(slug: linkedItem.unwrappedSlug, pageURLString: linkedItem.unwrappedPageURLString)
      }

      do {
        try self.backgroundContext.save()
        print("ArticleContent saved succesfully")
      } catch {
        self.backgroundContext.rollback()
        print("Failed to save ArticleContent: \(error)")
      }
    }
  }

  func fetchPDFData(slug: String, pageURLString: String) {
    Task {
      guard let url = URL(string: pageURLString) else { return }
      let result: (Data, URLResponse)? = try? await URLSession.shared.data(from: url)
      guard let httpResponse = result?.1 as? HTTPURLResponse, 200 ..< 300 ~= httpResponse.statusCode else { return }
      guard let data = result?.0 else { return }

      await backgroundContext.perform { [weak self] in
        let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "%K == %@", #keyPath(LinkedItem.slug), slug)

        let linkedItem = try? self?.backgroundContext.fetch(fetchRequest).first
        guard let linkedItem = linkedItem else { return }
        linkedItem.pdfData = data

        do {
          try self?.backgroundContext.save()
          print("PDF data saved succesfully")
        } catch {
          self?.backgroundContext.rollback()
          print("Failed to save PDF data: \(error)")
        }
      }
    }
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
        htmlContent: htmlContent,
        highlightsJSONString: highlights.map { InternalHighlight.make(from: $0) }.asJSONString,
        contentStatus: .succeeded
      )
    }
  }
}

private extension ArticleContentStatus {
  static func make(from savingRequestStatus: Enums.ArticleSavingRequestStatus?) -> ArticleContentStatus {
    guard let savingRequestStatus = savingRequestStatus else { return .unknown }

    switch savingRequestStatus {
    case .failed:
      return .failed
    case .processing:
      return .processing
    case .succeeded:
      return .succeeded
    }
  }
}
