import Combine
import Foundation
import Models

extension Networker {
  func createPendingUserDep(params: Data) -> AnyPublisher<PendingUserAuthPayload, ServerError> {
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

extension Networker {
  func createPendingUser(params: Data) async throws -> PendingUserAuthPayload {
    let urlRequest = URLRequest.create(
      baseURL: appEnvironment.serverBaseURL,
      urlPath: "/api/mobile-auth/sign-up",
      requestMethod: .post(params: params)
    )

    let resource = ServerResource<PendingUserAuthPayload>(
      urlRequest: urlRequest,
      decode: PendingUserAuthPayload.decode
    )

    do {
      return try await urlSession.performReq(resource: resource)
    } catch {
      throw (error as? ServerError) ?? .unknown
    }
  }
}
