import Combine
import Foundation
import Models

extension Networker {
  func submitGoogleToken(idToken: String) -> AnyPublisher<AuthPayload, LoginError> {
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

    return urlSession
      .performRequest(resource: resource)
      .mapError { LoginError.make(serverError: $0) }
      .receive(on: DispatchQueue.main)
      .eraseToAnyPublisher()
  }
}
