import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func uploadPDFPublisher(
    pageScrapePayload: PageScrapePayload,
    requestId: String
  ) -> AnyPublisher<Void, SaveArticleError> {
    uploadFileRequestPublisher(pageScrapePayload: pageScrapePayload)
      .flatMap { self.uploadFilePublisher(fileUploadConfig: $0, fileURLString: pageScrapePayload.url) }
      .flatMap { self.saveFilePublisher(pageScrapePayload: pageScrapePayload, uploadFileId: $0, requestId: requestId) }
      .catch { _ in self.saveUrlPublisher(pageScrapePayload: pageScrapePayload, requestId: requestId) }
      .receive(on: DispatchQueue.main)
      .eraseToAnyPublisher()
  }
}

private struct UploadFileRequestPayload {
  let uploadID: String?
  let uploadFileID: String?
  let urlString: String?
}

private extension DataService {
  // swiftlint:disable:next line_length
  func uploadFileRequestPublisher(pageScrapePayload: PageScrapePayload) -> AnyPublisher<UploadFileRequestPayload, SaveArticleError> {
    enum MutationResult {
      case success(payload: UploadFileRequestPayload)
      case error(errorCode: Enums.UploadFileRequestErrorCode?)
    }

    let input = InputObjects.UploadFileRequestInput(
      contentType: "application/pdf",
      url: pageScrapePayload.url
    )

    let selection = Selection<MutationResult, Unions.UploadFileRequestResult> {
      try $0.on(
        uploadFileRequestError: .init { .error(errorCode: try? $0.errorCodes().first) },
        uploadFileRequestSuccess: .init {
          .success(
            payload: UploadFileRequestPayload(
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

    return Deferred {
      Future { promise in
        send(mutation, to: path, headers: headers) { result in
          switch result {
          case let .success(payload):
            if let graphqlError = payload.errors {
              promise(.failure(.unknown(description: graphqlError.first.debugDescription)))
            }

            switch payload.data {
            case let .success(payload):
              promise(.success(payload))
            case let .error(errorCode):
              switch errorCode {
              case .unauthorized:
                promise(.failure(.unauthorized))
              default:
                promise(.failure(.unknown(description: errorCode.debugDescription)))
              }
            }
          case .failure:
            promise(.failure(.badData))
          }
        }
      }
    }
    .eraseToAnyPublisher()
  }

  // swiftlint:disable:next line_length
  func uploadFilePublisher(fileUploadConfig: UploadFileRequestPayload, fileURLString: String) -> AnyPublisher<String, SaveArticleError> {
    let pdfData = URL(string: fileURLString).flatMap { try? Data(contentsOf: $0) }

    let url = fileUploadConfig.urlString.flatMap { URL(string: $0) }
    guard let url = url, let pdfData = pdfData else { return Future { $0(.failure(.badData)) }.eraseToAnyPublisher() }

    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.addValue("application/pdf", forHTTPHeaderField: "content-type")
    request.httpBody = pdfData

    return networker.urlSession.dataTaskPublisher(for: request)
      .tryMap { data, response -> String in
        let serverResponse = ServerResponse(data: data, response: response)
        if serverResponse.httpUrlResponse?.statusCode == 200, let fileUploadID = fileUploadConfig.uploadID {
          return fileUploadID
        }

        throw ServerError(serverResponse: serverResponse)
      }
      .mapError { error -> SaveArticleError in
        let serverResponse = ServerResponse(error: error)
        NetworkRequestLogger.log(request: request, serverResponse: serverResponse)
        let serverError = ServerError(serverResponse: serverResponse)
        switch serverError {
        case .noConnection, .timeout:
          return .network
        case .unauthenticated:
          return .unauthorized
        case .unknown:
          return .unknown(description: "upload to file server failed")
        }
      }
      .eraseToAnyPublisher()
  }

  // swiftlint:disable:next line_length
  func saveFilePublisher(pageScrapePayload: PageScrapePayload, uploadFileId: String, requestId: String) -> AnyPublisher<Void, SaveArticleError> {
    enum MutationResult {
      case saved(requestId: String, url: String)
      case error(errorCode: Enums.SaveErrorCode)
    }

    let input = InputObjects.SaveFileInput(
      clientRequestId: requestId,
      source: "ios-file",
      uploadFileId: uploadFileId,
      url: pageScrapePayload.url
    )

    let selection = Selection<MutationResult, Unions.SaveResult> {
      try $0.on(
        saveError: .init { .error(errorCode: (try? $0.errorCodes().first) ?? .unknown) },
        saveSuccess: .init { .saved(requestId: requestId, url: (try? $0.url()) ?? "") }
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
