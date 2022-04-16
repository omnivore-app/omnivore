import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func articleContentPublisher(username: String, slug: String) -> AnyPublisher<ArticleContent, ServerError> {
    enum QueryResult {
      case success(result: ArticleContent)
      case error(error: String)
    }

    let articleSelection = Selection.Article {
      ArticleContent(
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
              self?.persistArticleContent(htmlContent: result.htmlContent, slug: slug)
              promise(.success(result))
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
  func persistArticleContent(htmlContent: String, slug: String) {
    let persistedArticleContent = PersistedArticleContent(context: persistentContainer.viewContext)
    persistedArticleContent.htmlContent = htmlContent
    persistedArticleContent.slug = slug

    do {
      try persistentContainer.viewContext.save()
      print("PersistedArticleContent saved succesfully")
    } catch {
      persistentContainer.viewContext.rollback()
      print("Failed to save PersistedArticleContent: \(error)")
    }
  }
}
