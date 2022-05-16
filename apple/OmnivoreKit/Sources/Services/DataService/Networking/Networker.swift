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

extension Networker {
  /// Test if the user has a network connection and a valid auth token
  /// - Returns: A `Bool` value
  func hasConnectionAndValidToken() async -> Bool {
    let urlRequest = URLRequest.create(
      baseURL: appEnvironment.serverBaseURL,
      urlPath: "/api/auth/verify",
      requestMethod: .get,
      includeAuthToken: true
    )

    let resource = ServerResource<AuthVerification>(
      urlRequest: urlRequest,
      decode: AuthVerification.decode
    )

    do {
      let authVerification = try await urlSession.performReq(resource: resource)
      return authVerification.authStatus.isAuthenticated
    } catch {
      return false
    }
  }
}
