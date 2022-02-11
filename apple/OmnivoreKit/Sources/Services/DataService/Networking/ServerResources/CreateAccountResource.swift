import Combine
import Foundation

extension Networker {
  func createAccount(params: Data) -> AnyPublisher<AuthPayload, ServerError> {
    let urlRequest = URLRequest.create(
      baseURL: appEnvironment.serverBaseURL,
      urlPath: "/api/mobile-auth/create-account",
      requestMethod: .post(params: params)
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
