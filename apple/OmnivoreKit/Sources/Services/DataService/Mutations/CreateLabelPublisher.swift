import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func createLabelPublisher(
    name: String,
    color: String,
    description: String?
  ) -> AnyPublisher<FeedItemLabelDep, BasicError> {
    enum MutationResult {
      case saved(label: FeedItemLabelDep)
      case error(errorCode: Enums.CreateLabelErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateLabelResult> {
      try $0.on(
        createLabelSuccess: .init { .saved(label: try $0.label(selection: feedItemLabelSelection)) },
        createLabelError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createLabel(
        input: InputObjects.CreateLabelInput(
          name: name,
          color: color,
          description: OptionalArgument(description)
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
            case let .saved(label: label):
              promise(.success(label))
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
