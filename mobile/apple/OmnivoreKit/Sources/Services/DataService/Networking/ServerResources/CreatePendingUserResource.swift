import Foundation
import Models

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
      return try await urlSession.performRequest(resource: resource)
    } catch {
      throw (error as? ServerError) ?? .unknown
    }
  }
}
