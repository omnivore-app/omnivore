import Combine
import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  struct ArticleProps {
    let htmlContent: String
    let highlights: [InternalHighlight]
  }

  func articleContentPublisher(username: String, slug: String) -> AnyPublisher<ArticleContent, ServerError> {
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

    return Deferred {
      Future { promise in
        send(query, to: path, headers: headers) { [weak self] result in
          switch result {
          case let .success(payload):
            switch payload.data {
            case let .success(result: result):
              // store result in core data
              self?.persistArticleContent(
                htmlContent: result.htmlContent,
                slug: slug,
                highlights: result.highlights
              )
              promise(.success(
                ArticleContent(
                  htmlContent: result.htmlContent,
                  highlightsJSONString: result.highlights.asJSONString
                ))
              )
            case .error:
              promise(.failure(.unknown))
            }
          case .failure:
            promise(.failure(.unknown))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}

extension DataService {
  func persistArticleContent(htmlContent: String, slug: String, highlights: [InternalHighlight]) {
    let fetchContentRequest: NSFetchRequest<Models.PersistedArticleContent> = PersistedArticleContent.fetchRequest()
    fetchContentRequest.predicate = NSPredicate(
      format: "slug == %@", slug
    )

    if let content = (try? persistentContainer.viewContext.fetch(fetchContentRequest))?.first {
      content.htmlContent = htmlContent
    } else {
      let persistedArticleContent = PersistedArticleContent(
        entity: PersistedArticleContent.entity(),
        insertInto: persistentContainer.viewContext
      )
      persistedArticleContent.htmlContent = htmlContent
      persistedArticleContent.slug = slug
    }

    let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "slug == %@", slug
    )

    if let linkedItemID = try? persistentContainer.viewContext.fetch(fetchRequest).first?.id {
      _ = highlights.map {
        $0.asManagedObject(context: persistentContainer.viewContext, associatedItemID: linkedItemID)
      }
    }

    do {
      try persistentContainer.viewContext.save()
      print("ArticleContent saved succesfully")
    } catch {
      persistentContainer.viewContext.rollback()
      print("Failed to save ArticleContent: \(error)")
    }
  }
}
