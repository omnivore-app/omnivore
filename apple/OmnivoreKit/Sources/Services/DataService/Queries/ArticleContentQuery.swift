import CoreData
import Foundation
import Models
import SwiftGraphQL
import Utils

struct ArticleProps {
  let item: InternalLibraryItem
  let htmlContent: String
  let highlights: [InternalHighlight]
}

extension DataService {
  // swiftlint:disable:next function_body_length
  func articleContentFetch(username: String, itemID: String) async throws -> ArticleProps {
    enum QueryResult {
      case success(result: ArticleProps)
      case error(error: String)
    }

    let articleContentSelection = Selection.Article {
      ArticleProps(
        item: InternalLibraryItem(
          id: try $0.id(),
          title: try $0.title(),
          createdAt: try $0.createdAt().value ?? Date(),
          savedAt: try $0.savedAt().value ?? Date(),
          readAt: try $0.readAt()?.value,
          updatedAt: try $0.updatedAt()?.value ?? Date(),
          folder: try $0.folder(),
          state: try $0.state()?.rawValue.asArticleContentStatus ?? .succeeded,
          readingProgress: try $0.readingProgressPercent(),
          readingProgressAnchor: try $0.readingProgressAnchorIndex(),
          imageURLString: try $0.image(),
          onDeviceImageURLString: nil,
          documentDirectoryPath: nil,
          pageURLString: try $0.url(),
          descriptionText: try $0.description(),
          publisherURLString: try $0.originalArticleUrl(),
          siteName: try $0.siteName(),
          author: try $0.author(),
          publishDate: try $0.publishedAt()?.value,
          slug: try $0.slug(),
          isArchived: try $0.isArchived(),
          contentReader: try $0.contentReader().rawValue,
          htmlContent: try $0.content(),
          originalHtml: nil,
          language: try $0.language(),
          wordsCount: try $0.wordsCount(),
          downloadURL: try $0.url(),
          recommendations: try $0.recommendations(selection: recommendationSelection.list.nullable) ?? [],
          labels: try $0.labels(selection: feedItemLabelSelection.list.nullable) ?? [],
          highlights: try $0.highlights(selection: highlightSelection.list)
        ),
        htmlContent: try $0.content(),
        highlights: try $0.highlights(selection: highlightSelection.list)
      )
    }

    let selection = Selection<QueryResult, Unions.ArticleResult> {
      try $0.on(
        articleError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        articleSuccess: .init {
          QueryResult.success(result: try $0.article(selection: articleContentSelection))
        }
      )
    }

    let query = Selection.Query {
      try $0.article(slug: itemID, username: username, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: ContentFetchError.network)
          return
        }

        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case .error:
          continuation.resume(throwing: ContentFetchError.badData)
        }
      }
    }
  }
}
