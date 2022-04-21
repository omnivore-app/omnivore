import Combine
import Foundation
import Models
import SwiftGraphQL

let setBookmarkedArticleSelection = Selection.Article {
  try $0.id()
}

public extension DataService {
  func removeLinkPublisher(
    itemID: String
  ) -> AnyPublisher<String, BasicError> {
    enum MutationResult {
      case success(linkId: String)
      case error(errorCode: Enums.SetBookmarkArticleErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SetBookmarkArticleResult> {
      try $0.on(
        setBookmarkArticleSuccess: .init {
          .success(
            linkId: try $0.bookmarkedArticle(selection: setBookmarkedArticleSelection)
          )
        },
        setBookmarkArticleError: .init { .error(errorCode: try $0.errorCodes().first ?? .notFound) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setBookmarkArticle(
        input: InputObjects.SetBookmarkArticleInput(
          articleId: itemID,
          bookmark: false
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
            if payload.errors != nil {
              promise(.failure(.message(messageText: "Error removing link")))
            }

            switch payload.data {
            case let .success(item):
              if let linkedItem = LinkedItem.lookup(byID: itemID, inContext: self.persistentContainer.viewContext) {
                linkedItem.remove(inContext: self.persistentContainer.viewContext)
              }
              promise(.success(item))
            case .error(errorCode: _):
              promise(.failure(.message(messageText: "Error removing link")))
            }
          case .failure:
            promise(.failure(.message(messageText: "Error removing link")))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
