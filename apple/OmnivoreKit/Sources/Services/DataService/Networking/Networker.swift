import Foundation
import Models

public final class Networker: NSObject, URLSessionTaskDelegate {
  let urlSession: URLSession
  let appEnvironment: AppEnvironment
  var uploadQueue: [String: URLSessionUploadTask] = [:]

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

  public func createBackgroundSession() -> URLSession {
    let sessionConfig = URLSessionConfiguration.background(withIdentifier: "app.omnivoreapp.BackgroundSessionConfig-")
    sessionConfig.sharedContainerIdentifier = "group.app.omnivoreapp"
    return URLSession(configuration: sessionConfig, delegate: self, delegateQueue: nil)
  }

  public func urlSession(_: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    print("finished upload on original request", task.originalRequest, "error", error)
    if let httpResponse = task.response as? HTTPURLResponse {
      if 200 ... 299 ~= httpResponse.statusCode {
        // success
        if let requestId = task.originalRequest?.value(forHTTPHeaderField: "clientRequestId") {
          print("COMPLETED UPLOADED REQUEST ID", requestId)
          DispatchQueue.main.async {
            NotificationCenter.default.post(name: NSNotification.LocallyCreatedItemSynced, object: nil, userInfo: ["objectID": requestId])
          }
        }
      }
      print("DONE")
    }
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
