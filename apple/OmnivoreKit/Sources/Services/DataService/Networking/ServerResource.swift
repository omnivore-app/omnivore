import Combine
import Foundation
import Utils

struct ServerResource<ResponseModel> {
  let urlRequest: URLRequest
  let decode: (ServerResponse) -> ResponseModel?
}

struct ServerResponse {
  let data: Data?
  let httpUrlResponse: HTTPURLResponse?
  let urlError: URLError?

  init(data: Data?, response: URLResponse?) {
    self.data = data
    self.httpUrlResponse = response as? HTTPURLResponse
    self.urlError = nil
  }

  init(error: Error) {
    self.data = nil
    self.httpUrlResponse = nil
    self.urlError = error as? URLError
  }
}

extension ServerResponse {
  // extract custom error message here
  var errorMessage: String? {
    nil
  }
}

extension URLSession {
  // swiftlint:disable:next line_length
  func performRequest<ResponseModel>(resource: ServerResource<ResponseModel>) -> AnyPublisher<ResponseModel, ServerError> {
    let request = resource.urlRequest

    return dataTaskPublisher(for: resource.urlRequest)
      .tryMap { data, response -> ResponseModel in
        let serverResponse = ServerResponse(data: data, response: response)
        NetworkRequestLogger.log(request: request, serverResponse: serverResponse)

        if let decodedValue = resource.decode(serverResponse) {
          return decodedValue
        }

        throw ServerError(serverResponse: serverResponse)
      }
      .mapError { error -> ServerError in
        let serverResponse = ServerResponse(error: error)
        NetworkRequestLogger.log(request: request, serverResponse: serverResponse)
        return ServerError(serverResponse: serverResponse)
      }
      .eraseToAnyPublisher()
  }
}

extension URLRequest {
  static var defaultHeaders: [String: String] {
    var headers = [
      "content-type": "application/json",
      "user-agent": userAgent,
      "app-language": Locale.preferredLanguages[0]
    ]

    if let deviceLanguage = NSLocale.current.languageCode {
      headers["device-language"] = deviceLanguage
    }

    return headers
  }

  public static func webRequest(
    baseURL: URL,
    urlPath: String,
    queryParams: [String: String]?
  ) -> URLRequest {
    create(
      baseURL: baseURL,
      urlPath: urlPath,
      requestMethod: .get,
      includeAuthToken: true,
      additionalHeaders: [:],
      queryParams: queryParams
    )
  }

  static func create(
    baseURL: URL,
    urlPath: String,
    requestMethod: HTTPMethod,
    includeAuthToken: Bool = false,
    additionalHeaders: [String: String] = [:],
    queryParams: [String: String]? = nil
  ) -> URLRequest {
    let url: URL = {
      var urlComponents = URLComponents()
      urlComponents.path = urlPath
      urlComponents.queryItems = queryParams?.map {
        URLQueryItem(
          name: $0.key,
          value: $0.value.addingPercentEncoding(withAllowedCharacters: .urlHostAllowed)
        )
      }
      return urlComponents.url(relativeTo: baseURL)!
    }()

    var request = URLRequest(url: url)
    request.httpMethod = requestMethod.stringValue

    for (headerField, value) in defaultHeaders {
      request.addValue(value, forHTTPHeaderField: headerField)
    }

    if includeAuthToken, let authToken = ValetKey.authToken.value() {
      request.addValue(authToken, forHTTPHeaderField: "authorization")
    }

    for (headerField, value) in additionalHeaders {
      request.addValue(value, forHTTPHeaderField: headerField)
    }

    switch requestMethod {
    case let .put(params), let .patch(params), let .post(params):
      request.httpBody = params
    case .get, .delete:
      break
    }

    return request
  }
}

enum HTTPMethod {
  case get
  case put(params: Data)
  case patch(params: Data)
  case post(params: Data)
  case delete

  var stringValue: String {
    switch self {
    case .get:
      return "GET"
    case .put:
      return "PUT"
    case .patch:
      return "PATCH"
    case .post:
      return "POST"
    case .delete:
      return "DELETE"
    }
  }
}
