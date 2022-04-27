import Combine
import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  // swiftlint:disable:next function_body_length
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
              self.backgroundContext.perform {
                guard let linkedItem = LinkedItem.lookup(byID: itemID, inContext: self.backgroundContext) else {
                  promise(.failure(.message(messageText: "failed to set labels")))
                  return
                }

                if let existingLabels = linkedItem.labels {
                  linkedItem.removeFromLabels(existingLabels)
                }
                for label in labels {
                  if let labelObject = LinkedItemLabel.lookup(byName: label.name, inContext: self.backgroundContext) {
                    linkedItem.addToLabels(labelObject)
                  }
                }

                do {
                  try self.backgroundContext.save()
                  logger.debug("Item labels updated")
                  let labelObjects = linkedItem.labels.asArray(of: LinkedItemLabel.self)
                  promise(.success(labelObjects.map(\.objectID)))
                } catch {
                  self.backgroundContext.rollback()
                  logger.debug("Failed to update item labels: \(error.localizedDescription)")
                  promise(.failure(.message(messageText: "failed to set labels")))
                }
              }
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
