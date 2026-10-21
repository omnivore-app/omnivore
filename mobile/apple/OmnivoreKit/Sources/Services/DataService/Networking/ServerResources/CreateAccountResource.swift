import Foundation

extension Networker {
  func createAccount(params: Data) async throws -> AuthPayload {
    let urlRequest = URLRequest.create(
      baseURL: appEnvironment.serverBaseURL,
      urlPath: "/api/mobile-auth/create-account",
      requestMethod: .post(params: params)
    )

    let resource = ServerResource<AuthPayload>(
      urlRequest: urlRequest,
      decode: AuthPayload.decode
    )

    do {
      return try await urlSession.performRequest(resource: resource)
    } catch {
      throw (error as? ServerError) ?? .unknown
    }
  }
}
