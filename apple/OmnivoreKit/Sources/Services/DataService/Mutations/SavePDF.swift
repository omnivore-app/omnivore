import Foundation
import Models
import SwiftGraphQL

public struct UploadFileRequestPayload {
  public let pageId: String
  public let uploadID: String?
  public let uploadFileID: String?
  public let urlString: String?
}

public extension DataService {
  // swiftlint:disable:next function_body_length
  func uploadFileRequest(id: String, url: String) async throws -> UploadFileRequestPayload {
    enum MutationResult {
      case success(payload: UploadFileRequestPayload)
      case error(errorCode: Enums.UploadFileRequestErrorCode?)
    }

    let input = InputObjects.UploadFileRequestInput(
      clientRequestId: OptionalArgument(id),
      contentType: "application/pdf",
      createPageEntry: OptionalArgument(true),
      url: url
    )

    let selection = Selection<MutationResult, Unions.UploadFileRequestResult> {
      try $0.on(
        uploadFileRequestError: .init { .error(errorCode: try? $0.errorCodes().first) },
        uploadFileRequestSuccess: .init {
          .success(
            payload: UploadFileRequestPayload(
              pageId: (try $0.createdPageId()) ?? id,
              uploadID: try $0.id(),
              uploadFileID: try $0.uploadFileId(),
              urlString: try $0.uploadSignedUrl()
            )
          )
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.uploadFileRequest(input: input, selection: selection)
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
          case let .success(payload):
            continuation.resume(returning: payload)
          case let .error(errorCode: errorCode):
            switch errorCode {
            case .unauthorized:
              continuation.resume(throwing: SaveArticleError.unauthorized)
            default:
              continuation.resume(throwing: SaveArticleError.unknown(description: errorCode?.rawValue ?? "unknown"))
            }
          }
        case let .failure(error):
          continuation.resume(throwing: SaveArticleError.make(from: error))
        }
      }
    }
  }

  func uploadFile(id _: String, localPdfURL: URL, url: URL) async throws {
    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.addValue("application/pdf", forHTTPHeaderField: "content-type")

    return try await withCheckedThrowingContinuation { continuation in
      let task = networker.urlSession.uploadTask(with: request, fromFile: localPdfURL) { _, response, _ in
        if let httpResponse = response as? HTTPURLResponse, 200 ... 299 ~= httpResponse.statusCode {
          continuation.resume()
        } else {
          continuation.resume(throwing: SaveArticleError.unknown(description: "Invalid response"))
        }
      }
      task.resume()
    }
  }

  func saveFilePublisher(requestId: String, uploadFileId: String, url: String) async throws -> String? {
    enum MutationResult {
      case saved(requestId: String, url: String)
      case error(errorCode: Enums.SaveErrorCode)
    }

    let input = InputObjects.SaveFileInput(
      clientRequestId: requestId,
      source: "ios-file",
      uploadFileId: uploadFileId,
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
      try $0.saveFile(input: input, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { result in
        switch result {
        case let .success(payload):
          if let graphqlError = payload.errors {
            continuation.resume(throwing: SaveArticleError.unknown(description: graphqlError.first.debugDescription))
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
