import Foundation

struct NetworkRequestLogger {
  static func log(request: URLRequest, serverResponse: ServerResponse) {
    log(request: request)
    log(serverResponse: serverResponse)
  }

  private static func log(request: URLRequest) {
    let urlString = request.url?.absoluteString ?? ""
    let components = URLComponents(string: urlString)

    let method = request.httpMethod != nil ? "\(request.httpMethod!)" : ""
    let path = "\(components?.path ?? "")"
    let query = "\(components?.query ?? "")"
    let host = "\(components?.host ?? "")"

    var requestLog = "\n\n\n------ OUTGOING NETWORK REQUEST ---------->\n\n"

    requestLog += "\(urlString)"
    requestLog += "\n\n"
    requestLog += "\(method) \(path)?\(query) HTTP/1.1\n"
    requestLog += "Host: \(host)\n"

    for (key, value) in request.allHTTPHeaderFields ?? [:] {
      requestLog += "\(key): \(value)\n"
    }

    if let body = request.httpBody {
      requestLog += "\n\(body.prettyPrintedJSONString ?? "")\n"
    }

    requestLog += "\n------------------------->\n"
    print(requestLog)
  }

  private static func log(serverResponse: ServerResponse, includeJSON: Bool = true) {
    let urlString = serverResponse.httpUrlResponse?.url?.absoluteString
    let components = URLComponents(string: urlString ?? "")

    let path = "\(components?.path ?? "")"
    let query = "?\(components?.query ?? "")"

    var responseLog = "\n\n\n<---------- INCOMING NETWORK RESPONSE ----------\n\n"

    if let urlString = urlString {
      responseLog += "\(urlString)"
      responseLog += "\n\n"
    }

    if let statusCode = serverResponse.httpUrlResponse?.statusCode {
      responseLog += "HTTP \(statusCode) \(path)\(query)\n"
    }

    if let host = components?.host {
      responseLog += "Host: \(host)\n"
    }

    for (key, value) in serverResponse.httpUrlResponse?.allHeaderFields ?? [:] {
      responseLog += "\(key): \(value)\n"
    }

    if let body = serverResponse.data, includeJSON {
      responseLog += "\n\(body.prettyPrintedJSONString ?? "")\n"
    }

    if let error = serverResponse.urlError {
      responseLog += "\nError: \(error.localizedDescription)\n"
    }

    responseLog += "<---------------------------------\n"
    print(responseLog)
  }
}

private extension Data {
  var prettyPrintedJSONString: String? {
    guard
      let object = try? JSONSerialization.jsonObject(with: self, options: []),
      let data = try? JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted]),
      let prettyPrintedString = String(data: data, encoding: String.Encoding(rawValue: String.Encoding.utf8.rawValue))
    else {
      return nil
    }

    return prettyPrintedString
  }
}
