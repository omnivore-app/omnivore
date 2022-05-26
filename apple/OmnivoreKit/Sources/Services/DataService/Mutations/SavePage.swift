import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  // swiftlint:disable:next line_length
  func savePagePublisher(pageScrapePayload: PageScrapePayload, html: String, title: String?, requestId: String) -> AnyPublisher<Void, SaveArticleError> {
    enum MutationResult {
      case saved(requestId: String, url: String)
      case error(errorCode: Enums.SaveErrorCode)
    }

    let input = InputObjects.SavePageInput(
      clientRequestId: requestId,
      originalContent: html,
      source: "ios-page",
      title: OptionalArgument(title),
      url: pageScrapePayload.url
    )

    let selection = Selection<MutationResult, Unions.SaveResult> {
      try $0.on(
        saveError: .init { .error(errorCode: (try? $0.errorCodes().first) ?? .unknown) },
        saveSuccess: .init { .saved(requestId: requestId, url: (try? $0.url()) ?? "") }
      )
    }

    let mutation = Selection.Mutation {
      try $0.savePage(input: input, selection: selection)
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
            case .saved:
              promise(.success(()))
            case let .error(errorCode: errorCode):
              switch errorCode {
              case .unauthorized:
                promise(.failure(.unauthorized))
              default:
                promise(.failure(.unknown(description: errorCode.rawValue)))
              }
            }
          case let .failure(error):
            promise(.failure(SaveError.make(from: error)))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}

private extension SaveError {
  static func make(from httpError: HttpError) -> SaveArticleError {
    switch httpError {
    case .network, .timeout:
      return .network
    case .badpayload, .badURL, .badstatus, .cancelled:
      return .unknown(description: httpError.localizedDescription)
    }
  }
}
