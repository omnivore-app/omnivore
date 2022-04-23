import Combine
import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func updateArticleLabelsPublisher(
    itemID: String,
    labelIDs: [String]
  ) -> AnyPublisher<[NSManagedObjectID], BasicError> {
    enum MutationResult {
      case saved(feedItem: [InternalLinkedItemLabel])
      case error(errorCode: Enums.SetLabelsErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SetLabelsResult> {
      try $0.on(
        setLabelsSuccess: .init { .saved(feedItem: try $0.labels(selection: feedItemLabelSelection.list)) },
        setLabelsError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setLabels(
        input: InputObjects.SetLabelsInput(
          pageId: itemID,
          labelIds: labelIDs
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
              promise(.failure(.message(messageText: graphqlError.first.debugDescription)))
            }

            switch payload.data {
            case let .saved(labels):
              // TODO: update CoreData and fix dis
              promise(.failure(.message(messageText: "failed to set labels")))
//              promise(.success(labels))
            case .error:
              promise(.failure(.message(messageText: "failed to set labels")))
            }
          case .failure:
            promise(.failure(.message(messageText: "failed to set labels")))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
