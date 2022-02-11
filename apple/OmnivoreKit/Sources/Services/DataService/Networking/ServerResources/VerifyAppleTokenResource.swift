import Combine
import Foundation
import Models

extension Networker {
  func submitAppleToken(token: String) -> AnyPublisher<AuthPayload, ServerError> {
    let params = SignInParams(token: token, provider: .apple)
    let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()

    let urlRequest = URLRequest.create(
      baseURL: appEnvironment.serverBaseURL,
      urlPath: "/api/mobile-auth/sign-in",
      requestMethod: .post(params: encodedParams)
    )

    let resource = ServerResource<AuthPayload>(
      urlRequest: urlRequest,
      decode: AuthPayload.decode
    )

    return urlSession
      .performRequest(resource: resource)
      .receive(on: DispatchQueue.main)
      .eraseToAnyPublisher()
  }
}
