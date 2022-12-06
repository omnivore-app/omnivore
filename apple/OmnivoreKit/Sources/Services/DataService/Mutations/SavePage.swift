import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func savePage(id: String, url: String, title: String, originalHtml: String) async throws -> String? {
    enum MutationResult {
      case saved(requestId: String, url: String)
      case error(errorCode: Enums.SaveErrorCode)
    }

    let input = InputObjects.SavePageInput(
      clientRequestId: id,
      originalContent: originalHtml,
      source: "ios-page",
      title: OptionalArgument(title),
      url: url
    )

    let selection = Selection<MutationResult, Unions.SaveResult> {
      try $0.on(
        saveError: .init { .error(errorCode: (try? $0.errorCodes().first) ?? .unknown) },
        saveSuccess: .init {
          if let requestId = try? $0.clientRequestId(), let url = try? $0.url() {
            return .saved(requestId: requestId, url: url)
          } else {
            return .error(errorCode: .unknown)
          }
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.savePage(input: input, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { result in
        switch result {
        case let .success(payload):
          if let graphqlError = payload.errors {
            continuation.resume(
              throwing: SaveArticleError.unknown(description: graphqlError.first.debugDescription)
            )
            return
          }
          switch payload.data {
          case let .saved(requestId: requestId, url: _):
            continuation.resume(returning: requestId)
          case let .error(errorCode: errorCode):
            switch errorCode {
            case .unauthorized:
              continuation.resume(throwing: SaveArticleError.unauthorized)
            default:
              continuation.resume(throwing: SaveArticleError.unknown(description: errorCode.rawValue))
            }
          }
        case let .failure(error):
          continuation.resume(throwing: SaveArticleError.make(from: error))
        }
      }
    }
  }
}

extension SaveArticleError {
  static func make(from httpError: HttpError) -> SaveArticleError {
    switch httpError {
    case .network, .timeout:
      return .network
    case .badpayload, .badURL, .badstatus, .cancelled:
      print("HTTP ERROR", httpError)
      return .unknown(description: httpError.localizedDescription)
    }
  }
}
