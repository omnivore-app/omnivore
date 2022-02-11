import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func deleteHighlightPublisher(
    highlightId: String
  ) -> AnyPublisher<String, BasicError> {
    enum MutationResult {
      case saved(id: String)
      case error(errorCode: Enums.DeleteHighlightErrorCode)
    }

    let selection = Selection<MutationResult, Unions.DeleteHighlightResult> {
      try $0.on(
        deleteHighlightSuccess: .init {
          .saved(id: try $0.highlight(selection: Selection.Highlight { try $0.id() }))
        },
        deleteHighlightError: .init { .error(errorCode: try $0.errorCodes().first ?? .unauthorized) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.deleteHighlight(
        highlightId: highlightId.lowercased(),
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
            case let .saved(id: id):
              promise(.success(id))
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
