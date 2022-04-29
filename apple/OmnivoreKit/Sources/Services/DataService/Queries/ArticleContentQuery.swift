import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func prefetchPages(itemSlugs: [String]) async {
    guard let username = currentViewer?.username else { return }

    for slug in itemSlugs {
      // TODO: maybe check for cached content before downloading again? check timestamp?
      _ = try? await articleContent(username: username, slug: slug, useCache: false)
    }
  }

  public func articleContent(username: String, slug: String, useCache: Bool) async throws -> ArticleContent {
    struct ArticleProps {
      let htmlContent: String
      let highlights: [InternalHighlight]
    }

    if useCache, let cachedContent = cachedArticleContent(slug: slug) {
      return cachedContent
    }

    enum QueryResult {
      case success(result: ArticleProps)
      case error(error: String)
    }

    let articleSelection = Selection.Article {
      ArticleProps(
        htmlContent: try $0.content(),
        highlights: try $0.highlights(selection: highlightSelection.list)
      )
    }

    let selection = Selection<QueryResult, Unions.ArticleResult> {
      try $0.on(
        articleSuccess: .init {
          QueryResult.success(result: try $0.article(selection: articleSelection))
        },
        articleError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        }
      )
    }

    let query = Selection.Query {
      try $0.article(username: username, slug: slug, selection: selection)
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
          self?.persistArticleContent(
            htmlContent: result.htmlContent,
            slug: slug,
            highlights: result.highlights
          )

          let articleContent = ArticleContent(
            htmlContent: result.htmlContent,
            highlightsJSONString: result.highlights.asJSONString
          )

          continuation.resume(returning: articleContent)
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "LinkedItem fetch error"))
        }
      }
    }
  }

  func persistArticleContent(htmlContent: String, slug: String, highlights: [InternalHighlight]) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "%K == %@", #keyPath(LinkedItem.slug), slug)

      let linkedItem = try? self.backgroundContext.fetch(fetchRequest).first

      guard let linkedItem = linkedItem else { return }

      let highlightObjects = highlights.map {
        $0.asManagedObject(context: self.backgroundContext)
      }
      linkedItem.addToHighlights(NSSet(array: highlightObjects))
      linkedItem.htmlContent = htmlContent

      if linkedItem.isPDF {
        self.fetchPDFData(slug: slug, pageURLString: linkedItem.unwrappedPageURLString)
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

  func cachedArticleContent(slug: String) -> ArticleContent? {
    let linkedItemFetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
    linkedItemFetchRequest.predicate = NSPredicate(
      format: "slug == %@", slug
    )

    guard let linkedItem = try? persistentContainer.viewContext.fetch(linkedItemFetchRequest).first else { return nil }
    guard let htmlContent = linkedItem.htmlContent else { return nil }

    let highlights = linkedItem
      .highlights
      .asArray(of: Highlight.self)
      .filter { $0.serverSyncStatus != ServerSyncStatus.needsDeletion.rawValue }

    return ArticleContent(
      htmlContent: htmlContent,
      highlightsJSONString: highlights.map { InternalHighlight.make(from: $0) }.asJSONString
    )
  }
}
