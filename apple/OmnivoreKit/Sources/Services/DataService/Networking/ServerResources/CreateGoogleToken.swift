import Foundation
import Models

extension Networker {
  func submitGoogleToken(idToken: String) async throws -> AuthPayload {
    let params = SignInParams(token: idToken, provider: .google)
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

    do {
      return try await urlSession.performReq(resource: resource)
    } catch {
      if let error = error as? ServerError {
        throw LoginError.make(serverError: error)
      } else {
        throw LoginError.unknown
      }
    }
  }
}
