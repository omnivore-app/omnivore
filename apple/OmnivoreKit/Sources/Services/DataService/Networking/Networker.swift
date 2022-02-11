import Foundation
import Models

public final class Networker {
  let urlSession: URLSession
  let appEnvironment: AppEnvironment

  var defaultHeaders: [String: String] {
    var headers = URLRequest.defaultHeaders

    if let authToken = ValetKey.authToken.value() {
      headers["authorization"] = authToken
    }

    return headers
  }

  public init(appEnvironment: AppEnvironment, urlSession: URLSession = .shared) {
    self.appEnvironment = appEnvironment
    self.urlSession = urlSession
  }
}
