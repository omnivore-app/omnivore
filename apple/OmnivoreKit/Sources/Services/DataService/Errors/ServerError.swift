import Foundation
import Models

public enum ServerError: String, Error {
  case noConnection
  case unauthenticated
  case timeout
  case unknown
}

extension ServerError {
  init(serverResponse: ServerResponse) {
    switch serverResponse.httpUrlResponse?.statusCode {
    case 401?, 403?:
      self = .unauthenticated
      return
    default:
      break
    }

    switch serverResponse.urlError?.code {
    case .some(.timedOut):
      self = .timeout
      return
    case .some(.notConnectedToInternet):
      self = .noConnection
      return
    default:
      break
    }

    self = .unknown
  }
}
