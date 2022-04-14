import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func removeLabelPublisher(labelID: String) -> AnyPublisher<Bool, BasicError> {
    enum MutationResult {
      case success(labelID: String)
      case error(errorCode: Enums.DeleteLabelErrorCode)
    }

    let selection = Selection<MutationResult, Unions.DeleteLabelResult> {
      try $0.on(
        deleteLabelSuccess: .init {
          .success(labelID: try $0.label(selection: Selection.Label { try $0.id() }))
        },
        deleteLabelError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.deleteLabel(id: labelID, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return Deferred {
      Future { promise in
        send(mutation, to: path, headers: headers) { result in
          switch result {
          case let .success(payload):
            if payload.errors != nil {
              promise(.failure(.message(messageText: "Error removing label")))
            }

            switch payload.data {
            case .success:
              promise(.success(true))
            case .error:
              promise(.failure(.message(messageText: "Error removing label")))
            }
          case .failure:
            promise(.failure(.message(messageText: "Error removing label")))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
