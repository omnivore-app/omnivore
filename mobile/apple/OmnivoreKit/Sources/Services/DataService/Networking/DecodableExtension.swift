import Foundation

private let standardJSONDecoder: JSONDecoder = {
  let decoder = JSONDecoder()
  decoder.keyDecodingStrategy = .convertFromSnakeCase
  return decoder
}()

extension Decodable {
  static func decodeJSON(fromData data: Data) -> Self? {
    do {
      return try standardJSONDecoder.decode(Self.self, from: data)
    } catch {
      let jsonReadingOptions = JSONSerialization.ReadingOptions(rawValue: 0)
      let json = (try? JSONSerialization.jsonObject(with: data, options: jsonReadingOptions))
      print("Decoding Error: \(error)\nRaw JSON: \(String(describing: json))")
      return nil
    }
  }

  static func decode<ResponseModel: Decodable>(serverResponse: ServerResponse) -> ResponseModel? {
    guard let httpResponse = serverResponse.httpUrlResponse else { return nil }
    guard 200 ... 299 ~= httpResponse.statusCode else { return nil }
    guard let data = serverResponse.data else { return nil }
    return decodeJSON(fromData: data) as? ResponseModel
  }
}

extension UnkeyedDecodingContainer {
  func decodeAll<T: Decodable>() throws -> [T] {
    var container = self
    var decoded = [T]()

    while !container.isAtEnd {
      let decodedElement = try container.decode(T.self)
      decoded.append(decodedElement)
    }

    return decoded
  }
}
