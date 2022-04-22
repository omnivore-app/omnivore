import Combine
import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func updateArticleReadingProgressPublisher(
    itemID: String,
    readingProgress: Double,
    anchorIndex: Int
  ) -> AnyPublisher<FeedItemDep, SaveArticleError> {
    enum MutationResult {
      case saved(feedItem: FeedItemDep)
      case error(errorCode: Enums.SaveArticleReadingProgressErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SaveArticleReadingProgressResult> {
      try $0.on(
        saveArticleReadingProgressSuccess: .init {
          .saved(
            feedItem: try $0.updatedArticle(selection: homeFeedItemSelection)
          )
        },
        saveArticleReadingProgressError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.saveArticleReadingProgress(
        input: InputObjects.SaveArticleReadingProgressInput(
          id: itemID,
          readingProgressPercent: readingProgress,
          readingProgressAnchorIndex: anchorIndex
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return Deferred {
      Future { promise in
        send(mutation, to: path, headers: headers) { result in
          switch result {
          case let .success(payload):
            if let graphqlError = payload.errors {
              promise(.failure(.unknown(description: graphqlError.first.debugDescription)))
            }

            switch payload.data {
            case let .saved(feedItem):
              if let linkedItem = LinkedItem.lookup(byID: itemID, inContext: self.backgroundContext) {
                linkedItem.update(
                  inContext: self.backgroundContext,
                  newReadingProgress: readingProgress,
                  newAnchorIndex: anchorIndex
                )
              }
              promise(.success(feedItem))
            case let .error(errorCode: errorCode):
              switch errorCode {
              case .unauthorized:
                promise(.failure(.unauthorized))
              case .badData, .notFound:
                promise(.failure(.badData))
              }
            }
          case .failure:
            promise(.failure(.badData))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
