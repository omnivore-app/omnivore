import Combine
import Foundation
import Models
import SwiftGraphQL

public enum SaveArticleStatus {
  case succeeeded
  case processing(jobId: String)
  case failed

  static func make(jobId: String, savingStatus: Enums.ArticleSavingRequestStatus) -> SaveArticleStatus {
    switch savingStatus {
    case .processing:
      return .processing(jobId: jobId)
    case .succeeded:
      return .succeeeded
    case .failed:
      return .failed
    }
  }
}

public extension Networker {
  func articleSaveStatus(jobId: String) -> AnyPublisher<SaveArticleStatus, SaveArticleError> {
    enum QueryResult {
      case saved(status: SaveArticleStatus)
      case error(errorCode: Enums.ArticleSavingRequestErrorCode)
    }

    let selection = Selection<QueryResult, Unions.ArticleSavingRequestResult> {
      try $0.on(
        articleSavingRequestSuccess: .init {
          .saved(
            status: try $0.articleSavingRequest(
              selection: .init {
                SaveArticleStatus.make(
                  jobId: try $0.id(),
                  savingStatus: try $0.status()
                )
              }
            )
          )
        },
        articleSavingRequestError: .init { .error(errorCode: (try? $0.errorCodes().first) ?? .notFound) }
      )
    }

    let query = Selection.Query {
      try $0.articleSavingRequest(id: jobId, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = defaultHeaders

    return Deferred {
      Future { promise in
        send(query, to: path, headers: headers) { result in
          switch result {
          case let .success(payload):
            if let graphqlError = payload.errors {
              promise(.failure(.unknown(description: graphqlError.first.debugDescription)))
            }

            switch payload.data {
            case let .saved(status):
              promise(.success(status))
            case let .error(errorCode: errorCode):
              switch errorCode {
              case .unauthorized:
                promise(.failure(.unauthorized))
              case .notFound:
                promise(.failure(.badData))
              }
            }
          case let .failure(error):
            promise(.failure(SaveArticleError.make(from: error)))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}

public extension DataService {
  // swiftlint:disable:next line_length
  func saveArticlePublisher(pageScrapePayload: PageScrapePayload, uploadFileId: String?) -> AnyPublisher<Void, SaveArticleError> {
    enum MutationResult {
      case saved(created: Bool)
      case error(errorCode: Enums.CreateArticleErrorCode)
    }

    let preparedDocument: InputObjects.PreparedDocumentInput? = {
      guard let html = pageScrapePayload.html, let title = pageScrapePayload.title else { return nil }
      return InputObjects.PreparedDocumentInput(
        document: html,
        pageInfo: InputObjects.PageInfoInput(title: OptionalArgument(title))
      )
    }()

    let input = InputObjects.CreateArticleInput(
      url: pageScrapePayload.url,
      preparedDocument: OptionalArgument(preparedDocument),
      uploadFileId: uploadFileId != nil ? .present(uploadFileId!) : .null()
    )

    let selection = Selection<MutationResult, Unions.CreateArticleResult> {
      try $0.on(
        createArticleSuccess: .init { .saved(created: try $0.created()) },
        createArticleError: .init { .error(errorCode: (try? $0.errorCodes().first) ?? .unableToParse) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createArticle(input: input, selection: selection)
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
            promise(.failure(SaveArticleError.make(from: error)))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }

  func saveArticlePublisher(articleURL: URL) -> AnyPublisher<SaveArticleStatus, SaveArticleError> {
    saveArticlePublisher(articleURLString: articleURL.absoluteString)
  }

  func saveArticlePublisher(articleURLString: String) -> AnyPublisher<SaveArticleStatus, SaveArticleError> {
    enum MutationResult {
      case saved(status: SaveArticleStatus)
      case error(errorCode: Enums.CreateArticleSavingRequestErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateArticleSavingRequestResult> {
      try $0.on(
        createArticleSavingRequestSuccess: .init {
          .saved(
            status: try $0.articleSavingRequest(
              selection: .init {
                SaveArticleStatus.make(
                  jobId: try $0.id(),
                  savingStatus: try $0.status()
                )
              }
            )
          )
        },
        createArticleSavingRequestError: .init { .error(errorCode: (try? $0.errorCodes().first) ?? .badData) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createArticleSavingRequest(
        input: InputObjects.CreateArticleSavingRequestInput(url: articleURLString),
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
              promise(.failure(.unknown(description: graphqlError.first.debugDescription)))
            }

            switch payload.data {
            case let .saved(status):
              promise(.success(status))
            case let .error(errorCode: errorCode):
              switch errorCode {
              case .unauthorized:
                promise(.failure(.unauthorized))
              case .badData:
                promise(.failure(.badData))
              }
            }
          case let .failure(error):
            promise(.failure(SaveArticleError.make(from: error)))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}

private extension SaveArticleError {
  static func make(from httpError: HttpError) -> SaveArticleError {
    switch httpError {
    case .network, .timeout:
      return .network
    case .badpayload, .badURL, .badstatus, .cancelled:
      return .unknown(description: httpError.localizedDescription)
    }
  }
}
