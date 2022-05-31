import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
//  func uploadPDFPublisher(
//    pageScrapePayload: PageScrapePayload,
//    data: Data,
//    requestId: String
//  ) -> AnyPublisher<Void, SaveArticleError> {
//    // uploadFileRequestPublisher(pageScrapePayload: pageScrapePayload, requestId: requestId)
//    // .flatMap { self.uploadFilePublisher(fileUploadConfig: $0, data: data) }
//    uploadFilePublisher(pageScrapePayload: pageScrapePayload, requestId: requestId, data: data)
//      .flatMap { self.saveFilePublisher(pageScrapePayload: pageScrapePayload, uploadFileId: $0, requestId: requestId) }
//      .catch { _ in self.saveUrlPublisher(pageScrapePayload: pageScrapePayload, requestId: requestId) }
//      .receive(on: DispatchQueue.main)
//      .eraseToAnyPublisher()
//  }
}

private struct UploadFileRequestPayload {
  let uploadID: String?
  let uploadFileID: String?
  let urlString: String?
}

private extension DataService {
  public func uploadFileRequest(item: LinkedItem) async throws -> URL {
    enum MutationResult {
      case success(payload: UploadFileRequestPayload)
      case error(errorCode: Enums.UploadFileRequestErrorCode?)
    }

    let input = InputObjects.UploadFileRequestInput(
      url: item.unwrappedPageURLString,
      contentType: "application/pdf",
      createPageEntry: OptionalArgument(true),
      clientRequestId: OptionalArgument(item.unwrappedID)
    )

    let selection = Selection<MutationResult, Unions.UploadFileRequestResult> {
      try $0.on(
        uploadFileRequestSuccess: .init {
          .success(
            payload: UploadFileRequestPayload(
              uploadID: try $0.id(),
              uploadFileID: try $0.uploadFileId(),
              urlString: try $0.uploadSignedUrl()
            )
          )
        },
        uploadFileRequestError: .init { .error(errorCode: try? $0.errorCodes().first) }
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
            if let urlString = payload.urlString, let url = URL(string: urlString) {
              continuation.resume(returning: url)
            } else {
              continuation.resume(throwing: SaveArticleError.unknown(description: "No upload URL"))
            }
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

  public func uploadFile(item: LinkedItem, url: URL) -> URLSessionTask? {
    if let localPdfURL = item.localPdfURL, let localUrl = URL(string: localPdfURL) {
      var request = URLRequest(url: url)
      request.httpMethod = "PUT"
      request.setValue("application/pdf", forHTTPHeaderField: "content-type")

      let task = networker.backgroundSession.uploadTask(with: request, fromFile: localUrl)
      task.resume()
      return task
    } else {
      return nil
    }
  }

  // swiftlint:disable:next line_length
  func saveFilePublisher(pageScrapePayload: PageScrapePayload, uploadFileId: String, requestId: String) -> AnyPublisher<Void, SaveArticleError> {
    enum MutationResult {
      case saved(requestId: String, url: String)
      case error(errorCode: Enums.SaveErrorCode)
    }

    let input = InputObjects.SaveFileInput(
      url: pageScrapePayload.url,
      source: "ios-file",
      clientRequestId: requestId,
      uploadFileId: uploadFileId
    )

    let selection = Selection<MutationResult, Unions.SaveResult> {
      try $0.on(
        saveSuccess: .init { .saved(requestId: requestId, url: (try? $0.url()) ?? "") },
        saveError: .init { .error(errorCode: (try? $0.errorCodes().first) ?? .unknown) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.saveFile(input: input, selection: selection)
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
