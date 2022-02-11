import Combine
import Foundation
import Models

extension Networker {
  func createPendingUser(params: Data) -> AnyPublisher<PendingUserAuthPayload, ServerError> {
    let urlRequest = URLRequest.create(
      baseURL: appEnvironment.serverBaseURL,
      urlPath: "/api/mobile-auth/sign-up",
      requestMethod: .post(params: params)
    )

    let resource = ServerResource<PendingUserAuthPayload>(
      urlRequest: urlRequest,
      decode: PendingUserAuthPayload.decode
    )

    return urlSession
      .performRequest(resource: resource)
      .receive(on: DispatchQueue.main)
      .eraseToAnyPublisher()
  }
}
