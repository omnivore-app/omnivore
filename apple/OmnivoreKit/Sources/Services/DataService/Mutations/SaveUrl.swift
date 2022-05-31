import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func saveURL(item: LinkedItem) async throws {
    enum MutationResult {
      case saved(requestId: String, url: String)
      case error(errorCode: Enums.SaveErrorCode)
    }

    let input = InputObjects.SaveUrlInput(
      url: item.unwrappedPageURLString,
      source: "ios-url",
      clientRequestId: item.unwrappedID
    )

    print("UPLOADING ITEM:", item.unwrappedID, item)
    let requestId = item.unwrappedID
    let selection = Selection<MutationResult, Unions.SaveResult> {
      try $0.on(
        saveSuccess: .init { .saved(requestId: requestId, url: (try? $0.url()) ?? "") },
        saveError: .init { .error(errorCode: (try? $0.errorCodes().first) ?? .unknown) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.saveUrl(input: input, selection: selection)
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
          case .saved:
            continuation.resume()
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
