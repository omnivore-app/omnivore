import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  // swiftlint:disable:next function_parameter_count function_body_length
  func mergeHighlightPublisher(
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    articleId: String,
    overlapHighlightIdList: [String]
  ) -> AnyPublisher<[String: Any]?, BasicError> {
    enum MutationResult {
      case saved(highlight: InternalHighlight)
      case error(errorCode: Enums.MergeHighlightErrorCode)
    }

    let selection = Selection<MutationResult, Unions.MergeHighlightResult> {
      try $0.on(
        mergeHighlightSuccess: .init {
          .saved(highlight: try $0.highlight(selection: highlightSelection))
        },
        mergeHighlightError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.mergeHighlight(
        input: InputObjects.MergeHighlightInput(
          id: highlightID,
          shortId: shortId,
          articleId: articleId,
          patch: patch,
          quote: quote,
          prefix: .absent(),
          suffix: .absent(),
          annotation: .absent(),
          overlapHighlightIdList: overlapHighlightIdList
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
              promise(.failure(.message(messageText: "graphql error: \(graphqlError)")))
            }

            switch payload.data {
            case let .saved(highlight: highlight):
              highlight.persist(
                context: self.backgroundContext,
                associatedItemID: articleId,
                oldHighlightsIds: overlapHighlightIdList
              )
              promise(.success(highlight.encoded()))
            case let .error(errorCode: errorCode):
              promise(.failure(.message(messageText: errorCode.rawValue)))
            }
          case .failure:
            promise(.failure(.message(messageText: "graphql error")))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
