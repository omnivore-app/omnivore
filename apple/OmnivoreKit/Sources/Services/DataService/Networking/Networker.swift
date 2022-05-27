import Foundation
import Models

public final class Networker: NSObject, URLSessionTaskDelegate {
  let urlSession: URLSession
  let appEnvironment: AppEnvironment

  var defaultHeaders: [String: String] {
    var headers = URLRequest.defaultHeaders

    if let authToken = ValetKey.authToken.value() {
      headers["authorization"] = authToken
    }

    return headers
  }

  public init(appEnvironment: AppEnvironment) {
    self.appEnvironment = appEnvironment
    self.urlSession = .shared
  }

  lazy var backgroundSession: URLSession = {
    let sessionConfig = URLSessionConfiguration.background(withIdentifier: "app.omnivoreapp.BackgroundSessionConfig")
    sessionConfig.sharedContainerIdentifier = "group.app.omnivoreapp"
    return URLSession(configuration: sessionConfig, delegate: self, delegateQueue: nil)
  }()

  public func urlSession(_: URLSession, task: URLSessionTask, didCompleteWithError _: Error?) {
    print("finished upload of file:", task.taskIdentifier)
  }

  public func urlSession(_: URLSession,
                         task: URLSessionTask,
                         didSendBodyData _: Int64,
                         totalBytesSent: Int64,
                         totalBytesExpectedToSend _: Int64)
  {
    print("sent background data:", task.taskIdentifier, totalBytesSent)
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
