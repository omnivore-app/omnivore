import Combine
import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func updateHighlightAttributesPublisher(
    highlightID: String,
    annotation: String?,
    sharedAt: Date?
  ) -> AnyPublisher<String, BasicError> {
    enum MutationResult {
      case saved(highlight: InternalHighlight)
      case error(errorCode: Enums.UpdateHighlightErrorCode)
    }

    let selection = Selection<MutationResult, Unions.UpdateHighlightResult> {
      try $0.on(
        updateHighlightSuccess: .init {
          .saved(highlight: try $0.highlight(selection: highlightSelection))
        },
        updateHighlightError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.updateHighlight(
        input: InputObjects.UpdateHighlightInput(
          highlightId: highlightID,
          annotation: OptionalArgument(annotation),
          sharedAt: OptionalArgument(sharedAt.flatMap { DateTime(from: $0) })
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
              self.backgroundContext.perform {
                highlight.persist(context: self.backgroundContext, associatedItemID: nil)
              }
              promise(.success(highlight.id))
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
