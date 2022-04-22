import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func archiveLinkPublisher(
    itemID: String,
    archived: Bool
  ) -> AnyPublisher<String, BasicError> {
    enum MutationResult {
      case success(linkId: String)
      case error(errorCode: Enums.ArchiveLinkErrorCode)
    }

    let selection = Selection<MutationResult, Unions.ArchiveLinkResult> {
      try $0.on(
        archiveLinkSuccess: .init { .success(linkId: try $0.linkId()) },
        archiveLinkError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setLinkArchived(
        input: InputObjects.ArchiveLinkInput(
          linkId: itemID,
          archived: archived
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
              promise(.failure(.message(messageText: "Error archiving link")))
            }

            switch payload.data {
            case let .success(linkId):
              if let linkedItem = LinkedItem.lookup(byID: itemID, inContext: self.backgroundContext) {
                linkedItem.update(
                  inContext: self.backgroundContext,
                  newIsArchivedValue: archived
                )
              }
              promise(.success(linkId))
            case .error:
              promise(.failure(.message(messageText: "Error archiving link")))
            }
          case .failure:
            promise(.failure(.message(messageText: "Error archiving link")))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
