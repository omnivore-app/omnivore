// swiftlint:disable all
// This file was auto-generated using maticzav/swift-graphql. DO NOT EDIT MANUALLY!
import SwiftGraphQL

// MARK: - Operations

enum Operations {}
extension Objects.Query: GraphQLHttpOperation {
  static var operation: String { "query" }
}

extension Objects.Mutation: GraphQLHttpOperation {
  static var operation: String { "mutation" }
}

extension Objects.Subscription: GraphQLWebSocketOperation {
  static var operation: String { "subscription" }
}

// MARK: - Objects

enum Objects {}
extension Objects {
  struct AddPopularReadError {
    let __typename: TypeName = .addPopularReadError
    let errorCodes: [String: [Enums.AddPopularReadErrorCode]]

    enum TypeName: String, Codable {
      case addPopularReadError = "AddPopularReadError"
    }
  }
}

extension Objects.AddPopularReadError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.AddPopularReadErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.AddPopularReadError {
  func errorCodes() throws -> [Enums.AddPopularReadErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias AddPopularReadError<T> = Selection<T, Objects.AddPopularReadError>
}

extension Objects {
  struct AddPopularReadSuccess {
    let __typename: TypeName = .addPopularReadSuccess
    let pageId: [String: String]

    enum TypeName: String, Codable {
      case addPopularReadSuccess = "AddPopularReadSuccess"
    }
  }
}

extension Objects.AddPopularReadSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "pageId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    pageId = map["pageId"]
  }
}

extension Fields where TypeLock == Objects.AddPopularReadSuccess {
  func pageId() throws -> String {
    let field = GraphQLField.leaf(
      name: "pageId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.pageId[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias AddPopularReadSuccess<T> = Selection<T, Objects.AddPopularReadSuccess>
}

extension Objects {
  struct ApiKey {
    let __typename: TypeName = .apiKey
    let createdAt: [String: DateTime]
    let expiresAt: [String: DateTime]
    let id: [String: String]
    let key: [String: String]
    let name: [String: String]
    let scopes: [String: [String]]
    let usedAt: [String: DateTime]

    enum TypeName: String, Codable {
      case apiKey = "ApiKey"
    }
  }
}

extension Objects.ApiKey: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "expiresAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "key":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "name":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "scopes":
        if let value = try container.decode([String]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "usedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    createdAt = map["createdAt"]
    expiresAt = map["expiresAt"]
    id = map["id"]
    key = map["key"]
    name = map["name"]
    scopes = map["scopes"]
    usedAt = map["usedAt"]
  }
}

extension Fields where TypeLock == Objects.ApiKey {
  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func expiresAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "expiresAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.expiresAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func key() throws -> String? {
    let field = GraphQLField.leaf(
      name: "key",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.key[field.alias!]
    case .mocking:
      return nil
    }
  }

  func name() throws -> String {
    let field = GraphQLField.leaf(
      name: "name",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.name[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func scopes() throws -> [String]? {
    let field = GraphQLField.leaf(
      name: "scopes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.scopes[field.alias!]
    case .mocking:
      return nil
    }
  }

  func usedAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "usedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.usedAt[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ApiKey<T> = Selection<T, Objects.ApiKey>
}

extension Objects {
  struct ApiKeysError {
    let __typename: TypeName = .apiKeysError
    let errorCodes: [String: [Enums.ApiKeysErrorCode]]

    enum TypeName: String, Codable {
      case apiKeysError = "ApiKeysError"
    }
  }
}

extension Objects.ApiKeysError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.ApiKeysErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.ApiKeysError {
  func errorCodes() throws -> [Enums.ApiKeysErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ApiKeysError<T> = Selection<T, Objects.ApiKeysError>
}

extension Objects {
  struct ApiKeysSuccess {
    let __typename: TypeName = .apiKeysSuccess
    let apiKeys: [String: [Objects.ApiKey]]

    enum TypeName: String, Codable {
      case apiKeysSuccess = "ApiKeysSuccess"
    }
  }
}

extension Objects.ApiKeysSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "apiKeys":
        if let value = try container.decode([Objects.ApiKey]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    apiKeys = map["apiKeys"]
  }
}

extension Fields where TypeLock == Objects.ApiKeysSuccess {
  func apiKeys<Type>(selection: Selection<Type, [Objects.ApiKey]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "apiKeys",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.apiKeys[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ApiKeysSuccess<T> = Selection<T, Objects.ApiKeysSuccess>
}

extension Objects {
  struct ArchiveLinkError {
    let __typename: TypeName = .archiveLinkError
    let errorCodes: [String: [Enums.ArchiveLinkErrorCode]]
    let message: [String: String]

    enum TypeName: String, Codable {
      case archiveLinkError = "ArchiveLinkError"
    }
  }
}

extension Objects.ArchiveLinkError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.ArchiveLinkErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
    message = map["message"]
  }
}

extension Fields where TypeLock == Objects.ArchiveLinkError {
  func errorCodes() throws -> [Enums.ArchiveLinkErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }

  func message() throws -> String {
    let field = GraphQLField.leaf(
      name: "message",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.message[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArchiveLinkError<T> = Selection<T, Objects.ArchiveLinkError>
}

extension Objects {
  struct ArchiveLinkSuccess {
    let __typename: TypeName = .archiveLinkSuccess
    let linkId: [String: String]
    let message: [String: String]

    enum TypeName: String, Codable {
      case archiveLinkSuccess = "ArchiveLinkSuccess"
    }
  }
}

extension Objects.ArchiveLinkSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "linkId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    linkId = map["linkId"]
    message = map["message"]
  }
}

extension Fields where TypeLock == Objects.ArchiveLinkSuccess {
  func linkId() throws -> String {
    let field = GraphQLField.leaf(
      name: "linkId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.linkId[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func message() throws -> String {
    let field = GraphQLField.leaf(
      name: "message",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.message[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArchiveLinkSuccess<T> = Selection<T, Objects.ArchiveLinkSuccess>
}

extension Objects {
  struct Article {
    let __typename: TypeName = .article
    let author: [String: String]
    let content: [String: String]
    let contentReader: [String: Enums.ContentReader]
    let createdAt: [String: DateTime]
    let description: [String: String]
    let hasContent: [String: Bool]
    let hash: [String: String]
    let highlights: [String: [Objects.Highlight]]
    let id: [String: String]
    let image: [String: String]
    let isArchived: [String: Bool]
    let labels: [String: [Objects.Label]]
    let language: [String: String]
    let linkId: [String: String]
    let originalArticleUrl: [String: String]
    let originalHtml: [String: String]
    let pageType: [String: Enums.PageType]
    let postedByViewer: [String: Bool]
    let publishedAt: [String: DateTime]
    let readAt: [String: DateTime]
    let readingProgressAnchorIndex: [String: Int]
    let readingProgressPercent: [String: Double]
    let savedAt: [String: DateTime]
    let savedByViewer: [String: Bool]
    let shareInfo: [String: Objects.LinkShareInfo]
    let sharedComment: [String: String]
    let siteIcon: [String: String]
    let siteName: [String: String]
    let slug: [String: String]
    let state: [String: Enums.ArticleSavingRequestStatus]
    let subscription: [String: String]
    let title: [String: String]
    let unsubHttpUrl: [String: String]
    let unsubMailTo: [String: String]
    let updatedAt: [String: DateTime]
    let uploadFileId: [String: String]
    let url: [String: String]

    enum TypeName: String, Codable {
      case article = "Article"
    }
  }
}

extension Objects.Article: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "author":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "content":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "contentReader":
        if let value = try container.decode(Enums.ContentReader?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "description":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "hasContent":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "hash":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlights":
        if let value = try container.decode([Objects.Highlight]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "image":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "isArchived":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "labels":
        if let value = try container.decode([Objects.Label]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "language":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "linkId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "originalArticleUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "originalHtml":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageType":
        if let value = try container.decode(Enums.PageType?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "postedByViewer":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "publishedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readingProgressAnchorIndex":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readingProgressPercent":
        if let value = try container.decode(Double?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "savedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "savedByViewer":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "shareInfo":
        if let value = try container.decode(Objects.LinkShareInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedComment":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "siteIcon":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "siteName":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "slug":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "state":
        if let value = try container.decode(Enums.ArticleSavingRequestStatus?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "subscription":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "title":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "unsubHttpUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "unsubMailTo":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "uploadFileId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "url":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    author = map["author"]
    content = map["content"]
    contentReader = map["contentReader"]
    createdAt = map["createdAt"]
    description = map["description"]
    hasContent = map["hasContent"]
    hash = map["hash"]
    highlights = map["highlights"]
    id = map["id"]
    image = map["image"]
    isArchived = map["isArchived"]
    labels = map["labels"]
    language = map["language"]
    linkId = map["linkId"]
    originalArticleUrl = map["originalArticleUrl"]
    originalHtml = map["originalHtml"]
    pageType = map["pageType"]
    postedByViewer = map["postedByViewer"]
    publishedAt = map["publishedAt"]
    readAt = map["readAt"]
    readingProgressAnchorIndex = map["readingProgressAnchorIndex"]
    readingProgressPercent = map["readingProgressPercent"]
    savedAt = map["savedAt"]
    savedByViewer = map["savedByViewer"]
    shareInfo = map["shareInfo"]
    sharedComment = map["sharedComment"]
    siteIcon = map["siteIcon"]
    siteName = map["siteName"]
    slug = map["slug"]
    state = map["state"]
    subscription = map["subscription"]
    title = map["title"]
    unsubHttpUrl = map["unsubHttpUrl"]
    unsubMailTo = map["unsubMailTo"]
    updatedAt = map["updatedAt"]
    uploadFileId = map["uploadFileId"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.Article {
  func author() throws -> String? {
    let field = GraphQLField.leaf(
      name: "author",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.author[field.alias!]
    case .mocking:
      return nil
    }
  }

  func content() throws -> String {
    let field = GraphQLField.leaf(
      name: "content",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.content[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func contentReader() throws -> Enums.ContentReader {
    let field = GraphQLField.leaf(
      name: "contentReader",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.contentReader[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Enums.ContentReader.allCases.first!
    }
  }

  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func description() throws -> String? {
    let field = GraphQLField.leaf(
      name: "description",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.description[field.alias!]
    case .mocking:
      return nil
    }
  }

  func hasContent() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "hasContent",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.hasContent[field.alias!]
    case .mocking:
      return nil
    }
  }

  func hash() throws -> String {
    let field = GraphQLField.leaf(
      name: "hash",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.hash[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func highlights<Type>(input: OptionalArgument<InputObjects.ArticleHighlightsInput> = .absent(), selection: Selection<Type, [Objects.Highlight]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlights",
      arguments: [Argument(name: "input", type: "ArticleHighlightsInput", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlights[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func image() throws -> String? {
    let field = GraphQLField.leaf(
      name: "image",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.image[field.alias!]
    case .mocking:
      return nil
    }
  }

  func isArchived() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "isArchived",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.isArchived[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func labels<Type>(selection: Selection<Type, [Objects.Label]?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "labels",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.labels[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func language() throws -> String? {
    let field = GraphQLField.leaf(
      name: "language",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.language[field.alias!]
    case .mocking:
      return nil
    }
  }

  func linkId() throws -> String? {
    let field = GraphQLField.leaf(
      name: "linkId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.linkId[field.alias!]
    case .mocking:
      return nil
    }
  }

  func originalArticleUrl() throws -> String? {
    let field = GraphQLField.leaf(
      name: "originalArticleUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.originalArticleUrl[field.alias!]
    case .mocking:
      return nil
    }
  }

  func originalHtml() throws -> String? {
    let field = GraphQLField.leaf(
      name: "originalHtml",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.originalHtml[field.alias!]
    case .mocking:
      return nil
    }
  }

  func pageType() throws -> Enums.PageType? {
    let field = GraphQLField.leaf(
      name: "pageType",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.pageType[field.alias!]
    case .mocking:
      return nil
    }
  }

  func postedByViewer() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "postedByViewer",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.postedByViewer[field.alias!]
    case .mocking:
      return nil
    }
  }

  func publishedAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "publishedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.publishedAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func readAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "readAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.readAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func readingProgressAnchorIndex() throws -> Int {
    let field = GraphQLField.leaf(
      name: "readingProgressAnchorIndex",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.readingProgressAnchorIndex[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Int.mockValue
    }
  }

  func readingProgressPercent() throws -> Double {
    let field = GraphQLField.leaf(
      name: "readingProgressPercent",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.readingProgressPercent[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Double.mockValue
    }
  }

  func savedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "savedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.savedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func savedByViewer() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "savedByViewer",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.savedByViewer[field.alias!]
    case .mocking:
      return nil
    }
  }

  func shareInfo<Type>(selection: Selection<Type, Objects.LinkShareInfo?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "shareInfo",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.shareInfo[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func sharedComment() throws -> String? {
    let field = GraphQLField.leaf(
      name: "sharedComment",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.sharedComment[field.alias!]
    case .mocking:
      return nil
    }
  }

  func siteIcon() throws -> String? {
    let field = GraphQLField.leaf(
      name: "siteIcon",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.siteIcon[field.alias!]
    case .mocking:
      return nil
    }
  }

  func siteName() throws -> String? {
    let field = GraphQLField.leaf(
      name: "siteName",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.siteName[field.alias!]
    case .mocking:
      return nil
    }
  }

  func slug() throws -> String {
    let field = GraphQLField.leaf(
      name: "slug",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.slug[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func state() throws -> Enums.ArticleSavingRequestStatus? {
    let field = GraphQLField.leaf(
      name: "state",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.state[field.alias!]
    case .mocking:
      return nil
    }
  }

  func subscription() throws -> String? {
    let field = GraphQLField.leaf(
      name: "subscription",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.subscription[field.alias!]
    case .mocking:
      return nil
    }
  }

  func title() throws -> String {
    let field = GraphQLField.leaf(
      name: "title",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.title[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func unsubHttpUrl() throws -> String? {
    let field = GraphQLField.leaf(
      name: "unsubHttpUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.unsubHttpUrl[field.alias!]
    case .mocking:
      return nil
    }
  }

  func unsubMailTo() throws -> String? {
    let field = GraphQLField.leaf(
      name: "unsubMailTo",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.unsubMailTo[field.alias!]
    case .mocking:
      return nil
    }
  }

  func updatedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func uploadFileId() throws -> String? {
    let field = GraphQLField.leaf(
      name: "uploadFileId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.uploadFileId[field.alias!]
    case .mocking:
      return nil
    }
  }

  func url() throws -> String {
    let field = GraphQLField.leaf(
      name: "url",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.url[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Article<T> = Selection<T, Objects.Article>
}

extension Objects {
  struct ArticleEdge {
    let __typename: TypeName = .articleEdge
    let cursor: [String: String]
    let node: [String: Objects.Article]

    enum TypeName: String, Codable {
      case articleEdge = "ArticleEdge"
    }
  }
}

extension Objects.ArticleEdge: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "cursor":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "node":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    cursor = map["cursor"]
    node = map["node"]
  }
}

extension Fields where TypeLock == Objects.ArticleEdge {
  func cursor() throws -> String {
    let field = GraphQLField.leaf(
      name: "cursor",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.cursor[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func node<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "node",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.node[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleEdge<T> = Selection<T, Objects.ArticleEdge>
}

extension Objects {
  struct ArticleError {
    let __typename: TypeName = .articleError
    let errorCodes: [String: [Enums.ArticleErrorCode]]

    enum TypeName: String, Codable {
      case articleError = "ArticleError"
    }
  }
}

extension Objects.ArticleError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.ArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.ArticleError {
  func errorCodes() throws -> [Enums.ArticleErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleError<T> = Selection<T, Objects.ArticleError>
}

extension Objects {
  struct ArticleSavingRequest {
    let __typename: TypeName = .articleSavingRequest
    let article: [String: Objects.Article]
    let createdAt: [String: DateTime]
    let errorCode: [String: Enums.CreateArticleErrorCode]
    let id: [String: String]
    let slug: [String: String]
    let status: [String: Enums.ArticleSavingRequestStatus]
    let updatedAt: [String: DateTime]
    let user: [String: Objects.User]
    let userId: [String: String]

    enum TypeName: String, Codable {
      case articleSavingRequest = "ArticleSavingRequest"
    }
  }
}

extension Objects.ArticleSavingRequest: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "article":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCode":
        if let value = try container.decode(Enums.CreateArticleErrorCode?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "slug":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "status":
        if let value = try container.decode(Enums.ArticleSavingRequestStatus?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "userId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    article = map["article"]
    createdAt = map["createdAt"]
    errorCode = map["errorCode"]
    id = map["id"]
    slug = map["slug"]
    status = map["status"]
    updatedAt = map["updatedAt"]
    user = map["user"]
    userId = map["userId"]
  }
}

extension Fields where TypeLock == Objects.ArticleSavingRequest {
  @available(*, deprecated, message: "article has been replaced with slug")
  func article<Type>(selection: Selection<Type, Objects.Article?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "article",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.article[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func errorCode() throws -> Enums.CreateArticleErrorCode? {
    let field = GraphQLField.leaf(
      name: "errorCode",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.errorCode[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func slug() throws -> String {
    let field = GraphQLField.leaf(
      name: "slug",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.slug[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func status() throws -> Enums.ArticleSavingRequestStatus {
    let field = GraphQLField.leaf(
      name: "status",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.status[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Enums.ArticleSavingRequestStatus.allCases.first!
    }
  }

  func updatedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func user<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  @available(*, deprecated, message: "userId has been replaced with user")
  func userId() throws -> String {
    let field = GraphQLField.leaf(
      name: "userId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.userId[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleSavingRequest<T> = Selection<T, Objects.ArticleSavingRequest>
}

extension Objects {
  struct ArticleSavingRequestError {
    let __typename: TypeName = .articleSavingRequestError
    let errorCodes: [String: [Enums.ArticleSavingRequestErrorCode]]

    enum TypeName: String, Codable {
      case articleSavingRequestError = "ArticleSavingRequestError"
    }
  }
}

extension Objects.ArticleSavingRequestError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.ArticleSavingRequestErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.ArticleSavingRequestError {
  func errorCodes() throws -> [Enums.ArticleSavingRequestErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleSavingRequestError<T> = Selection<T, Objects.ArticleSavingRequestError>
}

extension Objects {
  struct ArticleSavingRequestSuccess {
    let __typename: TypeName = .articleSavingRequestSuccess
    let articleSavingRequest: [String: Objects.ArticleSavingRequest]

    enum TypeName: String, Codable {
      case articleSavingRequestSuccess = "ArticleSavingRequestSuccess"
    }
  }
}

extension Objects.ArticleSavingRequestSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "articleSavingRequest":
        if let value = try container.decode(Objects.ArticleSavingRequest?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    articleSavingRequest = map["articleSavingRequest"]
  }
}

extension Fields where TypeLock == Objects.ArticleSavingRequestSuccess {
  func articleSavingRequest<Type>(selection: Selection<Type, Objects.ArticleSavingRequest>) throws -> Type {
    let field = GraphQLField.composite(
      name: "articleSavingRequest",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.articleSavingRequest[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleSavingRequestSuccess<T> = Selection<T, Objects.ArticleSavingRequestSuccess>
}

extension Objects {
  struct ArticleSuccess {
    let __typename: TypeName = .articleSuccess
    let article: [String: Objects.Article]

    enum TypeName: String, Codable {
      case articleSuccess = "ArticleSuccess"
    }
  }
}

extension Objects.ArticleSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "article":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    article = map["article"]
  }
}

extension Fields where TypeLock == Objects.ArticleSuccess {
  func article<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "article",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.article[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleSuccess<T> = Selection<T, Objects.ArticleSuccess>
}

extension Objects {
  struct ArticlesError {
    let __typename: TypeName = .articlesError
    let errorCodes: [String: [Enums.ArticlesErrorCode]]

    enum TypeName: String, Codable {
      case articlesError = "ArticlesError"
    }
  }
}

extension Objects.ArticlesError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.ArticlesErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.ArticlesError {
  func errorCodes() throws -> [Enums.ArticlesErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticlesError<T> = Selection<T, Objects.ArticlesError>
}

extension Objects {
  struct ArticlesSuccess {
    let __typename: TypeName = .articlesSuccess
    let edges: [String: [Objects.ArticleEdge]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case articlesSuccess = "ArticlesSuccess"
    }
  }
}

extension Objects.ArticlesSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "edges":
        if let value = try container.decode([Objects.ArticleEdge]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageInfo":
        if let value = try container.decode(Objects.PageInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    edges = map["edges"]
    pageInfo = map["pageInfo"]
  }
}

extension Fields where TypeLock == Objects.ArticlesSuccess {
  func edges<Type>(selection: Selection<Type, [Objects.ArticleEdge]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "edges",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.edges[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func pageInfo<Type>(selection: Selection<Type, Objects.PageInfo>) throws -> Type {
    let field = GraphQLField.composite(
      name: "pageInfo",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.pageInfo[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticlesSuccess<T> = Selection<T, Objects.ArticlesSuccess>
}

extension Objects {
  struct CreateArticleError {
    let __typename: TypeName = .createArticleError
    let errorCodes: [String: [Enums.CreateArticleErrorCode]]

    enum TypeName: String, Codable {
      case createArticleError = "CreateArticleError"
    }
  }
}

extension Objects.CreateArticleError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.CreateArticleError {
  func errorCodes() throws -> [Enums.CreateArticleErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleError<T> = Selection<T, Objects.CreateArticleError>
}

extension Objects {
  struct CreateArticleSavingRequestError {
    let __typename: TypeName = .createArticleSavingRequestError
    let errorCodes: [String: [Enums.CreateArticleSavingRequestErrorCode]]

    enum TypeName: String, Codable {
      case createArticleSavingRequestError = "CreateArticleSavingRequestError"
    }
  }
}

extension Objects.CreateArticleSavingRequestError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateArticleSavingRequestErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.CreateArticleSavingRequestError {
  func errorCodes() throws -> [Enums.CreateArticleSavingRequestErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleSavingRequestError<T> = Selection<T, Objects.CreateArticleSavingRequestError>
}

extension Objects {
  struct CreateArticleSavingRequestSuccess {
    let __typename: TypeName = .createArticleSavingRequestSuccess
    let articleSavingRequest: [String: Objects.ArticleSavingRequest]

    enum TypeName: String, Codable {
      case createArticleSavingRequestSuccess = "CreateArticleSavingRequestSuccess"
    }
  }
}

extension Objects.CreateArticleSavingRequestSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "articleSavingRequest":
        if let value = try container.decode(Objects.ArticleSavingRequest?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    articleSavingRequest = map["articleSavingRequest"]
  }
}

extension Fields where TypeLock == Objects.CreateArticleSavingRequestSuccess {
  func articleSavingRequest<Type>(selection: Selection<Type, Objects.ArticleSavingRequest>) throws -> Type {
    let field = GraphQLField.composite(
      name: "articleSavingRequest",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.articleSavingRequest[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleSavingRequestSuccess<T> = Selection<T, Objects.CreateArticleSavingRequestSuccess>
}

extension Objects {
  struct CreateArticleSuccess {
    let __typename: TypeName = .createArticleSuccess
    let created: [String: Bool]
    let createdArticle: [String: Objects.Article]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case createArticleSuccess = "CreateArticleSuccess"
    }
  }
}

extension Objects.CreateArticleSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "created":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdArticle":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    created = map["created"]
    createdArticle = map["createdArticle"]
    user = map["user"]
  }
}

extension Fields where TypeLock == Objects.CreateArticleSuccess {
  func created() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "created",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.created[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func createdArticle<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createdArticle",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdArticle[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func user<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleSuccess<T> = Selection<T, Objects.CreateArticleSuccess>
}

extension Objects {
  struct CreateHighlightError {
    let __typename: TypeName = .createHighlightError
    let errorCodes: [String: [Enums.CreateHighlightErrorCode]]

    enum TypeName: String, Codable {
      case createHighlightError = "CreateHighlightError"
    }
  }
}

extension Objects.CreateHighlightError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.CreateHighlightError {
  func errorCodes() throws -> [Enums.CreateHighlightErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateHighlightError<T> = Selection<T, Objects.CreateHighlightError>
}

extension Objects {
  struct CreateHighlightReplyError {
    let __typename: TypeName = .createHighlightReplyError
    let errorCodes: [String: [Enums.CreateHighlightReplyErrorCode]]

    enum TypeName: String, Codable {
      case createHighlightReplyError = "CreateHighlightReplyError"
    }
  }
}

extension Objects.CreateHighlightReplyError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateHighlightReplyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.CreateHighlightReplyError {
  func errorCodes() throws -> [Enums.CreateHighlightReplyErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateHighlightReplyError<T> = Selection<T, Objects.CreateHighlightReplyError>
}

extension Objects {
  struct CreateHighlightReplySuccess {
    let __typename: TypeName = .createHighlightReplySuccess
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case createHighlightReplySuccess = "CreateHighlightReplySuccess"
    }
  }
}

extension Objects.CreateHighlightReplySuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlightReply":
        if let value = try container.decode(Objects.HighlightReply?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlightReply = map["highlightReply"]
  }
}

extension Fields where TypeLock == Objects.CreateHighlightReplySuccess {
  func highlightReply<Type>(selection: Selection<Type, Objects.HighlightReply>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlightReply",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlightReply[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateHighlightReplySuccess<T> = Selection<T, Objects.CreateHighlightReplySuccess>
}

extension Objects {
  struct CreateHighlightSuccess {
    let __typename: TypeName = .createHighlightSuccess
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case createHighlightSuccess = "CreateHighlightSuccess"
    }
  }
}

extension Objects.CreateHighlightSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlight = map["highlight"]
  }
}

extension Fields where TypeLock == Objects.CreateHighlightSuccess {
  func highlight<Type>(selection: Selection<Type, Objects.Highlight>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlight",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateHighlightSuccess<T> = Selection<T, Objects.CreateHighlightSuccess>
}

extension Objects {
  struct CreateLabelError {
    let __typename: TypeName = .createLabelError
    let errorCodes: [String: [Enums.CreateLabelErrorCode]]

    enum TypeName: String, Codable {
      case createLabelError = "CreateLabelError"
    }
  }
}

extension Objects.CreateLabelError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateLabelErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.CreateLabelError {
  func errorCodes() throws -> [Enums.CreateLabelErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateLabelError<T> = Selection<T, Objects.CreateLabelError>
}

extension Objects {
  struct CreateLabelSuccess {
    let __typename: TypeName = .createLabelSuccess
    let label: [String: Objects.Label]

    enum TypeName: String, Codable {
      case createLabelSuccess = "CreateLabelSuccess"
    }
  }
}

extension Objects.CreateLabelSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "label":
        if let value = try container.decode(Objects.Label?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    label = map["label"]
  }
}

extension Fields where TypeLock == Objects.CreateLabelSuccess {
  func label<Type>(selection: Selection<Type, Objects.Label>) throws -> Type {
    let field = GraphQLField.composite(
      name: "label",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.label[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateLabelSuccess<T> = Selection<T, Objects.CreateLabelSuccess>
}

extension Objects {
  struct CreateNewsletterEmailError {
    let __typename: TypeName = .createNewsletterEmailError
    let errorCodes: [String: [Enums.CreateNewsletterEmailErrorCode]]

    enum TypeName: String, Codable {
      case createNewsletterEmailError = "CreateNewsletterEmailError"
    }
  }
}

extension Objects.CreateNewsletterEmailError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateNewsletterEmailErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.CreateNewsletterEmailError {
  func errorCodes() throws -> [Enums.CreateNewsletterEmailErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateNewsletterEmailError<T> = Selection<T, Objects.CreateNewsletterEmailError>
}

extension Objects {
  struct CreateNewsletterEmailSuccess {
    let __typename: TypeName = .createNewsletterEmailSuccess
    let newsletterEmail: [String: Objects.NewsletterEmail]

    enum TypeName: String, Codable {
      case createNewsletterEmailSuccess = "CreateNewsletterEmailSuccess"
    }
  }
}

extension Objects.CreateNewsletterEmailSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "newsletterEmail":
        if let value = try container.decode(Objects.NewsletterEmail?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    newsletterEmail = map["newsletterEmail"]
  }
}

extension Fields where TypeLock == Objects.CreateNewsletterEmailSuccess {
  func newsletterEmail<Type>(selection: Selection<Type, Objects.NewsletterEmail>) throws -> Type {
    let field = GraphQLField.composite(
      name: "newsletterEmail",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.newsletterEmail[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateNewsletterEmailSuccess<T> = Selection<T, Objects.CreateNewsletterEmailSuccess>
}

extension Objects {
  struct CreateReactionError {
    let __typename: TypeName = .createReactionError
    let errorCodes: [String: [Enums.CreateReactionErrorCode]]

    enum TypeName: String, Codable {
      case createReactionError = "CreateReactionError"
    }
  }
}

extension Objects.CreateReactionError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateReactionErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.CreateReactionError {
  func errorCodes() throws -> [Enums.CreateReactionErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateReactionError<T> = Selection<T, Objects.CreateReactionError>
}

extension Objects {
  struct CreateReactionSuccess {
    let __typename: TypeName = .createReactionSuccess
    let reaction: [String: Objects.Reaction]

    enum TypeName: String, Codable {
      case createReactionSuccess = "CreateReactionSuccess"
    }
  }
}

extension Objects.CreateReactionSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "reaction":
        if let value = try container.decode(Objects.Reaction?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    reaction = map["reaction"]
  }
}

extension Fields where TypeLock == Objects.CreateReactionSuccess {
  func reaction<Type>(selection: Selection<Type, Objects.Reaction>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reaction",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reaction[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateReactionSuccess<T> = Selection<T, Objects.CreateReactionSuccess>
}

extension Objects {
  struct CreateReminderError {
    let __typename: TypeName = .createReminderError
    let errorCodes: [String: [Enums.CreateReminderErrorCode]]

    enum TypeName: String, Codable {
      case createReminderError = "CreateReminderError"
    }
  }
}

extension Objects.CreateReminderError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateReminderErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.CreateReminderError {
  func errorCodes() throws -> [Enums.CreateReminderErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateReminderError<T> = Selection<T, Objects.CreateReminderError>
}

extension Objects {
  struct CreateReminderSuccess {
    let __typename: TypeName = .createReminderSuccess
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case createReminderSuccess = "CreateReminderSuccess"
    }
  }
}

extension Objects.CreateReminderSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "reminder":
        if let value = try container.decode(Objects.Reminder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    reminder = map["reminder"]
  }
}

extension Fields where TypeLock == Objects.CreateReminderSuccess {
  func reminder<Type>(selection: Selection<Type, Objects.Reminder>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reminder",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reminder[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateReminderSuccess<T> = Selection<T, Objects.CreateReminderSuccess>
}

extension Objects {
  struct DeleteAccountError {
    let __typename: TypeName = .deleteAccountError
    let errorCodes: [String: [Enums.DeleteAccountErrorCode]]

    enum TypeName: String, Codable {
      case deleteAccountError = "DeleteAccountError"
    }
  }
}

extension Objects.DeleteAccountError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteAccountErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.DeleteAccountError {
  func errorCodes() throws -> [Enums.DeleteAccountErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteAccountError<T> = Selection<T, Objects.DeleteAccountError>
}

extension Objects {
  struct DeleteAccountSuccess {
    let __typename: TypeName = .deleteAccountSuccess
    let userId: [String: String]

    enum TypeName: String, Codable {
      case deleteAccountSuccess = "DeleteAccountSuccess"
    }
  }
}

extension Objects.DeleteAccountSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "userId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    userId = map["userId"]
  }
}

extension Fields where TypeLock == Objects.DeleteAccountSuccess {
  func userId() throws -> String {
    let field = GraphQLField.leaf(
      name: "userID",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.userId[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteAccountSuccess<T> = Selection<T, Objects.DeleteAccountSuccess>
}

extension Objects {
  struct DeleteHighlightError {
    let __typename: TypeName = .deleteHighlightError
    let errorCodes: [String: [Enums.DeleteHighlightErrorCode]]

    enum TypeName: String, Codable {
      case deleteHighlightError = "DeleteHighlightError"
    }
  }
}

extension Objects.DeleteHighlightError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.DeleteHighlightError {
  func errorCodes() throws -> [Enums.DeleteHighlightErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteHighlightError<T> = Selection<T, Objects.DeleteHighlightError>
}

extension Objects {
  struct DeleteHighlightReplyError {
    let __typename: TypeName = .deleteHighlightReplyError
    let errorCodes: [String: [Enums.DeleteHighlightReplyErrorCode]]

    enum TypeName: String, Codable {
      case deleteHighlightReplyError = "DeleteHighlightReplyError"
    }
  }
}

extension Objects.DeleteHighlightReplyError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteHighlightReplyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.DeleteHighlightReplyError {
  func errorCodes() throws -> [Enums.DeleteHighlightReplyErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteHighlightReplyError<T> = Selection<T, Objects.DeleteHighlightReplyError>
}

extension Objects {
  struct DeleteHighlightReplySuccess {
    let __typename: TypeName = .deleteHighlightReplySuccess
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case deleteHighlightReplySuccess = "DeleteHighlightReplySuccess"
    }
  }
}

extension Objects.DeleteHighlightReplySuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlightReply":
        if let value = try container.decode(Objects.HighlightReply?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlightReply = map["highlightReply"]
  }
}

extension Fields where TypeLock == Objects.DeleteHighlightReplySuccess {
  func highlightReply<Type>(selection: Selection<Type, Objects.HighlightReply>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlightReply",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlightReply[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteHighlightReplySuccess<T> = Selection<T, Objects.DeleteHighlightReplySuccess>
}

extension Objects {
  struct DeleteHighlightSuccess {
    let __typename: TypeName = .deleteHighlightSuccess
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case deleteHighlightSuccess = "DeleteHighlightSuccess"
    }
  }
}

extension Objects.DeleteHighlightSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlight = map["highlight"]
  }
}

extension Fields where TypeLock == Objects.DeleteHighlightSuccess {
  func highlight<Type>(selection: Selection<Type, Objects.Highlight>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlight",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteHighlightSuccess<T> = Selection<T, Objects.DeleteHighlightSuccess>
}

extension Objects {
  struct DeleteLabelError {
    let __typename: TypeName = .deleteLabelError
    let errorCodes: [String: [Enums.DeleteLabelErrorCode]]

    enum TypeName: String, Codable {
      case deleteLabelError = "DeleteLabelError"
    }
  }
}

extension Objects.DeleteLabelError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteLabelErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.DeleteLabelError {
  func errorCodes() throws -> [Enums.DeleteLabelErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteLabelError<T> = Selection<T, Objects.DeleteLabelError>
}

extension Objects {
  struct DeleteLabelSuccess {
    let __typename: TypeName = .deleteLabelSuccess
    let label: [String: Objects.Label]

    enum TypeName: String, Codable {
      case deleteLabelSuccess = "DeleteLabelSuccess"
    }
  }
}

extension Objects.DeleteLabelSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "label":
        if let value = try container.decode(Objects.Label?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    label = map["label"]
  }
}

extension Fields where TypeLock == Objects.DeleteLabelSuccess {
  func label<Type>(selection: Selection<Type, Objects.Label>) throws -> Type {
    let field = GraphQLField.composite(
      name: "label",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.label[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteLabelSuccess<T> = Selection<T, Objects.DeleteLabelSuccess>
}

extension Objects {
  struct DeleteNewsletterEmailError {
    let __typename: TypeName = .deleteNewsletterEmailError
    let errorCodes: [String: [Enums.DeleteNewsletterEmailErrorCode]]

    enum TypeName: String, Codable {
      case deleteNewsletterEmailError = "DeleteNewsletterEmailError"
    }
  }
}

extension Objects.DeleteNewsletterEmailError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteNewsletterEmailErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.DeleteNewsletterEmailError {
  func errorCodes() throws -> [Enums.DeleteNewsletterEmailErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteNewsletterEmailError<T> = Selection<T, Objects.DeleteNewsletterEmailError>
}

extension Objects {
  struct DeleteNewsletterEmailSuccess {
    let __typename: TypeName = .deleteNewsletterEmailSuccess
    let newsletterEmail: [String: Objects.NewsletterEmail]

    enum TypeName: String, Codable {
      case deleteNewsletterEmailSuccess = "DeleteNewsletterEmailSuccess"
    }
  }
}

extension Objects.DeleteNewsletterEmailSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "newsletterEmail":
        if let value = try container.decode(Objects.NewsletterEmail?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    newsletterEmail = map["newsletterEmail"]
  }
}

extension Fields where TypeLock == Objects.DeleteNewsletterEmailSuccess {
  func newsletterEmail<Type>(selection: Selection<Type, Objects.NewsletterEmail>) throws -> Type {
    let field = GraphQLField.composite(
      name: "newsletterEmail",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.newsletterEmail[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteNewsletterEmailSuccess<T> = Selection<T, Objects.DeleteNewsletterEmailSuccess>
}

extension Objects {
  struct DeleteReactionError {
    let __typename: TypeName = .deleteReactionError
    let errorCodes: [String: [Enums.DeleteReactionErrorCode]]

    enum TypeName: String, Codable {
      case deleteReactionError = "DeleteReactionError"
    }
  }
}

extension Objects.DeleteReactionError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteReactionErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.DeleteReactionError {
  func errorCodes() throws -> [Enums.DeleteReactionErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteReactionError<T> = Selection<T, Objects.DeleteReactionError>
}

extension Objects {
  struct DeleteReactionSuccess {
    let __typename: TypeName = .deleteReactionSuccess
    let reaction: [String: Objects.Reaction]

    enum TypeName: String, Codable {
      case deleteReactionSuccess = "DeleteReactionSuccess"
    }
  }
}

extension Objects.DeleteReactionSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "reaction":
        if let value = try container.decode(Objects.Reaction?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    reaction = map["reaction"]
  }
}

extension Fields where TypeLock == Objects.DeleteReactionSuccess {
  func reaction<Type>(selection: Selection<Type, Objects.Reaction>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reaction",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reaction[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteReactionSuccess<T> = Selection<T, Objects.DeleteReactionSuccess>
}

extension Objects {
  struct DeleteReminderError {
    let __typename: TypeName = .deleteReminderError
    let errorCodes: [String: [Enums.DeleteReminderErrorCode]]

    enum TypeName: String, Codable {
      case deleteReminderError = "DeleteReminderError"
    }
  }
}

extension Objects.DeleteReminderError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteReminderErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.DeleteReminderError {
  func errorCodes() throws -> [Enums.DeleteReminderErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteReminderError<T> = Selection<T, Objects.DeleteReminderError>
}

extension Objects {
  struct DeleteReminderSuccess {
    let __typename: TypeName = .deleteReminderSuccess
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case deleteReminderSuccess = "DeleteReminderSuccess"
    }
  }
}

extension Objects.DeleteReminderSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "reminder":
        if let value = try container.decode(Objects.Reminder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    reminder = map["reminder"]
  }
}

extension Fields where TypeLock == Objects.DeleteReminderSuccess {
  func reminder<Type>(selection: Selection<Type, Objects.Reminder>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reminder",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reminder[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteReminderSuccess<T> = Selection<T, Objects.DeleteReminderSuccess>
}

extension Objects {
  struct DeleteWebhookError {
    let __typename: TypeName = .deleteWebhookError
    let errorCodes: [String: [Enums.DeleteWebhookErrorCode]]

    enum TypeName: String, Codable {
      case deleteWebhookError = "DeleteWebhookError"
    }
  }
}

extension Objects.DeleteWebhookError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteWebhookErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.DeleteWebhookError {
  func errorCodes() throws -> [Enums.DeleteWebhookErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteWebhookError<T> = Selection<T, Objects.DeleteWebhookError>
}

extension Objects {
  struct DeleteWebhookSuccess {
    let __typename: TypeName = .deleteWebhookSuccess
    let webhook: [String: Objects.Webhook]

    enum TypeName: String, Codable {
      case deleteWebhookSuccess = "DeleteWebhookSuccess"
    }
  }
}

extension Objects.DeleteWebhookSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "webhook":
        if let value = try container.decode(Objects.Webhook?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    webhook = map["webhook"]
  }
}

extension Fields where TypeLock == Objects.DeleteWebhookSuccess {
  func webhook<Type>(selection: Selection<Type, Objects.Webhook>) throws -> Type {
    let field = GraphQLField.composite(
      name: "webhook",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.webhook[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteWebhookSuccess<T> = Selection<T, Objects.DeleteWebhookSuccess>
}

extension Objects {
  struct DeviceToken {
    let __typename: TypeName = .deviceToken
    let createdAt: [String: DateTime]
    let id: [String: String]
    let token: [String: String]

    enum TypeName: String, Codable {
      case deviceToken = "DeviceToken"
    }
  }
}

extension Objects.DeviceToken: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "token":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    createdAt = map["createdAt"]
    id = map["id"]
    token = map["token"]
  }
}

extension Fields where TypeLock == Objects.DeviceToken {
  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func token() throws -> String {
    let field = GraphQLField.leaf(
      name: "token",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.token[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeviceToken<T> = Selection<T, Objects.DeviceToken>
}

extension Objects {
  struct FeedArticle {
    let __typename: TypeName = .feedArticle
    let annotationsCount: [String: Int]
    let article: [String: Objects.Article]
    let highlight: [String: Objects.Highlight]
    let highlightsCount: [String: Int]
    let id: [String: String]
    let reactions: [String: [Objects.Reaction]]
    let sharedAt: [String: DateTime]
    let sharedBy: [String: Objects.User]
    let sharedComment: [String: String]
    let sharedWithHighlights: [String: Bool]

    enum TypeName: String, Codable {
      case feedArticle = "FeedArticle"
    }
  }
}

extension Objects.FeedArticle: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "annotationsCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "article":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlightsCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reactions":
        if let value = try container.decode([Objects.Reaction]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedBy":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedComment":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedWithHighlights":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    annotationsCount = map["annotationsCount"]
    article = map["article"]
    highlight = map["highlight"]
    highlightsCount = map["highlightsCount"]
    id = map["id"]
    reactions = map["reactions"]
    sharedAt = map["sharedAt"]
    sharedBy = map["sharedBy"]
    sharedComment = map["sharedComment"]
    sharedWithHighlights = map["sharedWithHighlights"]
  }
}

extension Fields where TypeLock == Objects.FeedArticle {
  func annotationsCount() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "annotationsCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.annotationsCount[field.alias!]
    case .mocking:
      return nil
    }
  }

  func article<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "article",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.article[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func highlight<Type>(selection: Selection<Type, Objects.Highlight?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlight",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.highlight[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func highlightsCount() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "highlightsCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.highlightsCount[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func reactions<Type>(selection: Selection<Type, [Objects.Reaction]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reactions",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reactions[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func sharedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "sharedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.sharedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func sharedBy<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "sharedBy",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.sharedBy[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func sharedComment() throws -> String? {
    let field = GraphQLField.leaf(
      name: "sharedComment",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.sharedComment[field.alias!]
    case .mocking:
      return nil
    }
  }

  func sharedWithHighlights() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "sharedWithHighlights",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.sharedWithHighlights[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias FeedArticle<T> = Selection<T, Objects.FeedArticle>
}

extension Objects {
  struct FeedArticleEdge {
    let __typename: TypeName = .feedArticleEdge
    let cursor: [String: String]
    let node: [String: Objects.FeedArticle]

    enum TypeName: String, Codable {
      case feedArticleEdge = "FeedArticleEdge"
    }
  }
}

extension Objects.FeedArticleEdge: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "cursor":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "node":
        if let value = try container.decode(Objects.FeedArticle?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    cursor = map["cursor"]
    node = map["node"]
  }
}

extension Fields where TypeLock == Objects.FeedArticleEdge {
  func cursor() throws -> String {
    let field = GraphQLField.leaf(
      name: "cursor",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.cursor[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func node<Type>(selection: Selection<Type, Objects.FeedArticle>) throws -> Type {
    let field = GraphQLField.composite(
      name: "node",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.node[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias FeedArticleEdge<T> = Selection<T, Objects.FeedArticleEdge>
}

extension Objects {
  struct FeedArticlesError {
    let __typename: TypeName = .feedArticlesError
    let errorCodes: [String: [Enums.FeedArticlesErrorCode]]

    enum TypeName: String, Codable {
      case feedArticlesError = "FeedArticlesError"
    }
  }
}

extension Objects.FeedArticlesError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.FeedArticlesErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.FeedArticlesError {
  func errorCodes() throws -> [Enums.FeedArticlesErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias FeedArticlesError<T> = Selection<T, Objects.FeedArticlesError>
}

extension Objects {
  struct FeedArticlesSuccess {
    let __typename: TypeName = .feedArticlesSuccess
    let edges: [String: [Objects.FeedArticleEdge]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case feedArticlesSuccess = "FeedArticlesSuccess"
    }
  }
}

extension Objects.FeedArticlesSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "edges":
        if let value = try container.decode([Objects.FeedArticleEdge]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageInfo":
        if let value = try container.decode(Objects.PageInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    edges = map["edges"]
    pageInfo = map["pageInfo"]
  }
}

extension Fields where TypeLock == Objects.FeedArticlesSuccess {
  func edges<Type>(selection: Selection<Type, [Objects.FeedArticleEdge]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "edges",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.edges[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func pageInfo<Type>(selection: Selection<Type, Objects.PageInfo>) throws -> Type {
    let field = GraphQLField.composite(
      name: "pageInfo",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.pageInfo[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias FeedArticlesSuccess<T> = Selection<T, Objects.FeedArticlesSuccess>
}

extension Objects {
  struct GenerateApiKeyError {
    let __typename: TypeName = .generateApiKeyError
    let errorCodes: [String: [Enums.GenerateApiKeyErrorCode]]

    enum TypeName: String, Codable {
      case generateApiKeyError = "GenerateApiKeyError"
    }
  }
}

extension Objects.GenerateApiKeyError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.GenerateApiKeyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.GenerateApiKeyError {
  func errorCodes() throws -> [Enums.GenerateApiKeyErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GenerateApiKeyError<T> = Selection<T, Objects.GenerateApiKeyError>
}

extension Objects {
  struct GenerateApiKeySuccess {
    let __typename: TypeName = .generateApiKeySuccess
    let apiKey: [String: Objects.ApiKey]

    enum TypeName: String, Codable {
      case generateApiKeySuccess = "GenerateApiKeySuccess"
    }
  }
}

extension Objects.GenerateApiKeySuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "apiKey":
        if let value = try container.decode(Objects.ApiKey?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    apiKey = map["apiKey"]
  }
}

extension Fields where TypeLock == Objects.GenerateApiKeySuccess {
  func apiKey<Type>(selection: Selection<Type, Objects.ApiKey>) throws -> Type {
    let field = GraphQLField.composite(
      name: "apiKey",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.apiKey[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GenerateApiKeySuccess<T> = Selection<T, Objects.GenerateApiKeySuccess>
}

extension Objects {
  struct GetFollowersError {
    let __typename: TypeName = .getFollowersError
    let errorCodes: [String: [Enums.GetFollowersErrorCode]]

    enum TypeName: String, Codable {
      case getFollowersError = "GetFollowersError"
    }
  }
}

extension Objects.GetFollowersError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.GetFollowersErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.GetFollowersError {
  func errorCodes() throws -> [Enums.GetFollowersErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetFollowersError<T> = Selection<T, Objects.GetFollowersError>
}

extension Objects {
  struct GetFollowersSuccess {
    let __typename: TypeName = .getFollowersSuccess
    let followers: [String: [Objects.User]]

    enum TypeName: String, Codable {
      case getFollowersSuccess = "GetFollowersSuccess"
    }
  }
}

extension Objects.GetFollowersSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "followers":
        if let value = try container.decode([Objects.User]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    followers = map["followers"]
  }
}

extension Fields where TypeLock == Objects.GetFollowersSuccess {
  func followers<Type>(selection: Selection<Type, [Objects.User]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "followers",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.followers[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetFollowersSuccess<T> = Selection<T, Objects.GetFollowersSuccess>
}

extension Objects {
  struct GetFollowingError {
    let __typename: TypeName = .getFollowingError
    let errorCodes: [String: [Enums.GetFollowingErrorCode]]

    enum TypeName: String, Codable {
      case getFollowingError = "GetFollowingError"
    }
  }
}

extension Objects.GetFollowingError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.GetFollowingErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.GetFollowingError {
  func errorCodes() throws -> [Enums.GetFollowingErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetFollowingError<T> = Selection<T, Objects.GetFollowingError>
}

extension Objects {
  struct GetFollowingSuccess {
    let __typename: TypeName = .getFollowingSuccess
    let following: [String: [Objects.User]]

    enum TypeName: String, Codable {
      case getFollowingSuccess = "GetFollowingSuccess"
    }
  }
}

extension Objects.GetFollowingSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "following":
        if let value = try container.decode([Objects.User]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    following = map["following"]
  }
}

extension Fields where TypeLock == Objects.GetFollowingSuccess {
  func following<Type>(selection: Selection<Type, [Objects.User]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "following",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.following[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetFollowingSuccess<T> = Selection<T, Objects.GetFollowingSuccess>
}

extension Objects {
  struct GetUserPersonalizationError {
    let __typename: TypeName = .getUserPersonalizationError
    let errorCodes: [String: [Enums.GetUserPersonalizationErrorCode]]

    enum TypeName: String, Codable {
      case getUserPersonalizationError = "GetUserPersonalizationError"
    }
  }
}

extension Objects.GetUserPersonalizationError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.GetUserPersonalizationErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.GetUserPersonalizationError {
  func errorCodes() throws -> [Enums.GetUserPersonalizationErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetUserPersonalizationError<T> = Selection<T, Objects.GetUserPersonalizationError>
}

extension Objects {
  struct GetUserPersonalizationSuccess {
    let __typename: TypeName = .getUserPersonalizationSuccess
    let userPersonalization: [String: Objects.UserPersonalization]

    enum TypeName: String, Codable {
      case getUserPersonalizationSuccess = "GetUserPersonalizationSuccess"
    }
  }
}

extension Objects.GetUserPersonalizationSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "userPersonalization":
        if let value = try container.decode(Objects.UserPersonalization?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    userPersonalization = map["userPersonalization"]
  }
}

extension Fields where TypeLock == Objects.GetUserPersonalizationSuccess {
  func userPersonalization<Type>(selection: Selection<Type, Objects.UserPersonalization?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "userPersonalization",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.userPersonalization[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetUserPersonalizationSuccess<T> = Selection<T, Objects.GetUserPersonalizationSuccess>
}

extension Objects {
  struct GoogleSignupError {
    let __typename: TypeName = .googleSignupError
    let errorCodes: [String: [Enums.SignupErrorCode?]]

    enum TypeName: String, Codable {
      case googleSignupError = "GoogleSignupError"
    }
  }
}

extension Objects.GoogleSignupError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SignupErrorCode?]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.GoogleSignupError {
  func errorCodes() throws -> [Enums.SignupErrorCode?] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GoogleSignupError<T> = Selection<T, Objects.GoogleSignupError>
}

extension Objects {
  struct GoogleSignupSuccess {
    let __typename: TypeName = .googleSignupSuccess
    let me: [String: Objects.User]

    enum TypeName: String, Codable {
      case googleSignupSuccess = "GoogleSignupSuccess"
    }
  }
}

extension Objects.GoogleSignupSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "me":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    me = map["me"]
  }
}

extension Fields where TypeLock == Objects.GoogleSignupSuccess {
  func me<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "me",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.me[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GoogleSignupSuccess<T> = Selection<T, Objects.GoogleSignupSuccess>
}

extension Objects {
  struct Highlight {
    let __typename: TypeName = .highlight
    let annotation: [String: String]
    let createdAt: [String: DateTime]
    let createdByMe: [String: Bool]
    let id: [String: String]
    let patch: [String: String]
    let prefix: [String: String]
    let quote: [String: String]
    let reactions: [String: [Objects.Reaction]]
    let replies: [String: [Objects.HighlightReply]]
    let sharedAt: [String: DateTime]
    let shortId: [String: String]
    let suffix: [String: String]
    let updatedAt: [String: DateTime]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case highlight = "Highlight"
    }
  }
}

extension Objects.Highlight: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "annotation":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdByMe":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "patch":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "prefix":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "quote":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reactions":
        if let value = try container.decode([Objects.Reaction]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "replies":
        if let value = try container.decode([Objects.HighlightReply]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "shortId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "suffix":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    annotation = map["annotation"]
    createdAt = map["createdAt"]
    createdByMe = map["createdByMe"]
    id = map["id"]
    patch = map["patch"]
    prefix = map["prefix"]
    quote = map["quote"]
    reactions = map["reactions"]
    replies = map["replies"]
    sharedAt = map["sharedAt"]
    shortId = map["shortId"]
    suffix = map["suffix"]
    updatedAt = map["updatedAt"]
    user = map["user"]
  }
}

extension Fields where TypeLock == Objects.Highlight {
  func annotation() throws -> String? {
    let field = GraphQLField.leaf(
      name: "annotation",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.annotation[field.alias!]
    case .mocking:
      return nil
    }
  }

  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func createdByMe() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "createdByMe",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdByMe[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func patch() throws -> String {
    let field = GraphQLField.leaf(
      name: "patch",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.patch[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func prefix() throws -> String? {
    let field = GraphQLField.leaf(
      name: "prefix",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.prefix[field.alias!]
    case .mocking:
      return nil
    }
  }

  func quote() throws -> String {
    let field = GraphQLField.leaf(
      name: "quote",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.quote[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func reactions<Type>(selection: Selection<Type, [Objects.Reaction]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reactions",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reactions[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func replies<Type>(selection: Selection<Type, [Objects.HighlightReply]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "replies",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.replies[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func sharedAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "sharedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.sharedAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func shortId() throws -> String {
    let field = GraphQLField.leaf(
      name: "shortId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.shortId[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func suffix() throws -> String? {
    let field = GraphQLField.leaf(
      name: "suffix",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.suffix[field.alias!]
    case .mocking:
      return nil
    }
  }

  func updatedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func user<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Highlight<T> = Selection<T, Objects.Highlight>
}

extension Objects {
  struct HighlightReply {
    let __typename: TypeName = .highlightReply
    let createdAt: [String: DateTime]
    let highlight: [String: Objects.Highlight]
    let id: [String: String]
    let text: [String: String]
    let updatedAt: [String: DateTime]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case highlightReply = "HighlightReply"
    }
  }
}

extension Objects.HighlightReply: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "text":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    createdAt = map["createdAt"]
    highlight = map["highlight"]
    id = map["id"]
    text = map["text"]
    updatedAt = map["updatedAt"]
    user = map["user"]
  }
}

extension Fields where TypeLock == Objects.HighlightReply {
  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func highlight<Type>(selection: Selection<Type, Objects.Highlight>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlight",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func text() throws -> String {
    let field = GraphQLField.leaf(
      name: "text",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.text[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func updatedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func user<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias HighlightReply<T> = Selection<T, Objects.HighlightReply>
}

extension Objects {
  struct HighlightStats {
    let __typename: TypeName = .highlightStats
    let highlightCount: [String: Int]

    enum TypeName: String, Codable {
      case highlightStats = "HighlightStats"
    }
  }
}

extension Objects.HighlightStats: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlightCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlightCount = map["highlightCount"]
  }
}

extension Fields where TypeLock == Objects.HighlightStats {
  func highlightCount() throws -> Int {
    let field = GraphQLField.leaf(
      name: "highlightCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlightCount[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Int.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias HighlightStats<T> = Selection<T, Objects.HighlightStats>
}

extension Objects {
  struct Label {
    let __typename: TypeName = .label
    let color: [String: String]
    let createdAt: [String: DateTime]
    let description: [String: String]
    let id: [String: String]
    let name: [String: String]

    enum TypeName: String, Codable {
      case label = "Label"
    }
  }
}

extension Objects.Label: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "color":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "description":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "name":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    color = map["color"]
    createdAt = map["createdAt"]
    description = map["description"]
    id = map["id"]
    name = map["name"]
  }
}

extension Fields where TypeLock == Objects.Label {
  func color() throws -> String {
    let field = GraphQLField.leaf(
      name: "color",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.color[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func createdAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.createdAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func description() throws -> String? {
    let field = GraphQLField.leaf(
      name: "description",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.description[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func name() throws -> String {
    let field = GraphQLField.leaf(
      name: "name",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.name[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Label<T> = Selection<T, Objects.Label>
}

extension Objects {
  struct LabelsError {
    let __typename: TypeName = .labelsError
    let errorCodes: [String: [Enums.LabelsErrorCode]]

    enum TypeName: String, Codable {
      case labelsError = "LabelsError"
    }
  }
}

extension Objects.LabelsError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.LabelsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.LabelsError {
  func errorCodes() throws -> [Enums.LabelsErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LabelsError<T> = Selection<T, Objects.LabelsError>
}

extension Objects {
  struct LabelsSuccess {
    let __typename: TypeName = .labelsSuccess
    let labels: [String: [Objects.Label]]

    enum TypeName: String, Codable {
      case labelsSuccess = "LabelsSuccess"
    }
  }
}

extension Objects.LabelsSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "labels":
        if let value = try container.decode([Objects.Label]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    labels = map["labels"]
  }
}

extension Fields where TypeLock == Objects.LabelsSuccess {
  func labels<Type>(selection: Selection<Type, [Objects.Label]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "labels",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.labels[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LabelsSuccess<T> = Selection<T, Objects.LabelsSuccess>
}

extension Objects {
  struct Link {
    let __typename: TypeName = .link
    let highlightStats: [String: Objects.HighlightStats]
    let id: [String: String]
    let page: [String: Objects.Page]
    let postedByViewer: [String: Bool]
    let readState: [String: Objects.ReadState]
    let savedAt: [String: DateTime]
    let savedBy: [String: Objects.User]
    let savedByViewer: [String: Bool]
    let shareInfo: [String: Objects.LinkShareInfo]
    let shareStats: [String: Objects.ShareStats]
    let slug: [String: String]
    let updatedAt: [String: DateTime]
    let url: [String: String]

    enum TypeName: String, Codable {
      case link = "Link"
    }
  }
}

extension Objects.Link: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlightStats":
        if let value = try container.decode(Objects.HighlightStats?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "page":
        if let value = try container.decode(Objects.Page?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "postedByViewer":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readState":
        if let value = try container.decode(Objects.ReadState?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "savedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "savedBy":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "savedByViewer":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "shareInfo":
        if let value = try container.decode(Objects.LinkShareInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "shareStats":
        if let value = try container.decode(Objects.ShareStats?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "slug":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "url":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlightStats = map["highlightStats"]
    id = map["id"]
    page = map["page"]
    postedByViewer = map["postedByViewer"]
    readState = map["readState"]
    savedAt = map["savedAt"]
    savedBy = map["savedBy"]
    savedByViewer = map["savedByViewer"]
    shareInfo = map["shareInfo"]
    shareStats = map["shareStats"]
    slug = map["slug"]
    updatedAt = map["updatedAt"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.Link {
  func highlightStats<Type>(selection: Selection<Type, Objects.HighlightStats>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlightStats",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlightStats[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func page<Type>(selection: Selection<Type, Objects.Page>) throws -> Type {
    let field = GraphQLField.composite(
      name: "page",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.page[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func postedByViewer() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "postedByViewer",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.postedByViewer[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func readState<Type>(selection: Selection<Type, Objects.ReadState>) throws -> Type {
    let field = GraphQLField.composite(
      name: "readState",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.readState[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func savedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "savedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.savedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func savedBy<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "savedBy",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.savedBy[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func savedByViewer() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "savedByViewer",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.savedByViewer[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func shareInfo<Type>(selection: Selection<Type, Objects.LinkShareInfo>) throws -> Type {
    let field = GraphQLField.composite(
      name: "shareInfo",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.shareInfo[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func shareStats<Type>(selection: Selection<Type, Objects.ShareStats>) throws -> Type {
    let field = GraphQLField.composite(
      name: "shareStats",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.shareStats[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func slug() throws -> String {
    let field = GraphQLField.leaf(
      name: "slug",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.slug[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func updatedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func url() throws -> String {
    let field = GraphQLField.leaf(
      name: "url",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.url[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Link<T> = Selection<T, Objects.Link>
}

extension Objects {
  struct LinkShareInfo {
    let __typename: TypeName = .linkShareInfo
    let description: [String: String]
    let imageUrl: [String: String]
    let title: [String: String]

    enum TypeName: String, Codable {
      case linkShareInfo = "LinkShareInfo"
    }
  }
}

extension Objects.LinkShareInfo: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "description":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "imageUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "title":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    description = map["description"]
    imageUrl = map["imageUrl"]
    title = map["title"]
  }
}

extension Fields where TypeLock == Objects.LinkShareInfo {
  func description() throws -> String {
    let field = GraphQLField.leaf(
      name: "description",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.description[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func imageUrl() throws -> String {
    let field = GraphQLField.leaf(
      name: "imageUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.imageUrl[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func title() throws -> String {
    let field = GraphQLField.leaf(
      name: "title",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.title[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LinkShareInfo<T> = Selection<T, Objects.LinkShareInfo>
}

extension Objects {
  struct LogOutError {
    let __typename: TypeName = .logOutError
    let errorCodes: [String: [Enums.LogOutErrorCode]]

    enum TypeName: String, Codable {
      case logOutError = "LogOutError"
    }
  }
}

extension Objects.LogOutError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.LogOutErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.LogOutError {
  func errorCodes() throws -> [Enums.LogOutErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LogOutError<T> = Selection<T, Objects.LogOutError>
}

extension Objects {
  struct LogOutSuccess {
    let __typename: TypeName = .logOutSuccess
    let message: [String: String]

    enum TypeName: String, Codable {
      case logOutSuccess = "LogOutSuccess"
    }
  }
}

extension Objects.LogOutSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    message = map["message"]
  }
}

extension Fields where TypeLock == Objects.LogOutSuccess {
  func message() throws -> String? {
    let field = GraphQLField.leaf(
      name: "message",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.message[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LogOutSuccess<T> = Selection<T, Objects.LogOutSuccess>
}

extension Objects {
  struct LoginError {
    let __typename: TypeName = .loginError
    let errorCodes: [String: [Enums.LoginErrorCode]]

    enum TypeName: String, Codable {
      case loginError = "LoginError"
    }
  }
}

extension Objects.LoginError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.LoginErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.LoginError {
  func errorCodes() throws -> [Enums.LoginErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LoginError<T> = Selection<T, Objects.LoginError>
}

extension Objects {
  struct LoginSuccess {
    let __typename: TypeName = .loginSuccess
    let me: [String: Objects.User]

    enum TypeName: String, Codable {
      case loginSuccess = "LoginSuccess"
    }
  }
}

extension Objects.LoginSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "me":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    me = map["me"]
  }
}

extension Fields where TypeLock == Objects.LoginSuccess {
  func me<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "me",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.me[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LoginSuccess<T> = Selection<T, Objects.LoginSuccess>
}

extension Objects {
  struct MergeHighlightError {
    let __typename: TypeName = .mergeHighlightError
    let errorCodes: [String: [Enums.MergeHighlightErrorCode]]

    enum TypeName: String, Codable {
      case mergeHighlightError = "MergeHighlightError"
    }
  }
}

extension Objects.MergeHighlightError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.MergeHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.MergeHighlightError {
  func errorCodes() throws -> [Enums.MergeHighlightErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias MergeHighlightError<T> = Selection<T, Objects.MergeHighlightError>
}

extension Objects {
  struct MergeHighlightSuccess {
    let __typename: TypeName = .mergeHighlightSuccess
    let highlight: [String: Objects.Highlight]
    let overlapHighlightIdList: [String: [String]]

    enum TypeName: String, Codable {
      case mergeHighlightSuccess = "MergeHighlightSuccess"
    }
  }
}

extension Objects.MergeHighlightSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "overlapHighlightIdList":
        if let value = try container.decode([String]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlight = map["highlight"]
    overlapHighlightIdList = map["overlapHighlightIdList"]
  }
}

extension Fields where TypeLock == Objects.MergeHighlightSuccess {
  func highlight<Type>(selection: Selection<Type, Objects.Highlight>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlight",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func overlapHighlightIdList() throws -> [String] {
    let field = GraphQLField.leaf(
      name: "overlapHighlightIdList",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.overlapHighlightIdList[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias MergeHighlightSuccess<T> = Selection<T, Objects.MergeHighlightSuccess>
}

extension Objects {
  struct Mutation {
    let __typename: TypeName = .mutation
    let addPopularRead: [String: Unions.AddPopularReadResult]
    let createArticle: [String: Unions.CreateArticleResult]
    let createArticleSavingRequest: [String: Unions.CreateArticleSavingRequestResult]
    let createHighlight: [String: Unions.CreateHighlightResult]
    let createHighlightReply: [String: Unions.CreateHighlightReplyResult]
    let createLabel: [String: Unions.CreateLabelResult]
    let createNewsletterEmail: [String: Unions.CreateNewsletterEmailResult]
    let createReaction: [String: Unions.CreateReactionResult]
    let createReminder: [String: Unions.CreateReminderResult]
    let deleteAccount: [String: Unions.DeleteAccountResult]
    let deleteHighlight: [String: Unions.DeleteHighlightResult]
    let deleteHighlightReply: [String: Unions.DeleteHighlightReplyResult]
    let deleteLabel: [String: Unions.DeleteLabelResult]
    let deleteNewsletterEmail: [String: Unions.DeleteNewsletterEmailResult]
    let deleteReaction: [String: Unions.DeleteReactionResult]
    let deleteReminder: [String: Unions.DeleteReminderResult]
    let deleteWebhook: [String: Unions.DeleteWebhookResult]
    let generateApiKey: [String: Unions.GenerateApiKeyResult]
    let googleLogin: [String: Unions.LoginResult]
    let googleSignup: [String: Unions.GoogleSignupResult]
    let logOut: [String: Unions.LogOutResult]
    let mergeHighlight: [String: Unions.MergeHighlightResult]
    let reportItem: [String: Objects.ReportItemResult]
    let revokeApiKey: [String: Unions.RevokeApiKeyResult]
    let saveArticleReadingProgress: [String: Unions.SaveArticleReadingProgressResult]
    let saveFile: [String: Unions.SaveResult]
    let savePage: [String: Unions.SaveResult]
    let saveUrl: [String: Unions.SaveResult]
    let setBookmarkArticle: [String: Unions.SetBookmarkArticleResult]
    let setDeviceToken: [String: Unions.SetDeviceTokenResult]
    let setFollow: [String: Unions.SetFollowResult]
    let setLabels: [String: Unions.SetLabelsResult]
    let setLabelsForHighlight: [String: Unions.SetLabelsResult]
    let setLinkArchived: [String: Unions.ArchiveLinkResult]
    let setShareArticle: [String: Unions.SetShareArticleResult]
    let setShareHighlight: [String: Unions.SetShareHighlightResult]
    let setUserPersonalization: [String: Unions.SetUserPersonalizationResult]
    let setWebhook: [String: Unions.SetWebhookResult]
    let subscribe: [String: Unions.SubscribeResult]
    let unsubscribe: [String: Unions.UnsubscribeResult]
    let updateHighlight: [String: Unions.UpdateHighlightResult]
    let updateHighlightReply: [String: Unions.UpdateHighlightReplyResult]
    let updateLabel: [String: Unions.UpdateLabelResult]
    let updateLinkShareInfo: [String: Unions.UpdateLinkShareInfoResult]
    let updatePage: [String: Unions.UpdatePageResult]
    let updateReminder: [String: Unions.UpdateReminderResult]
    let updateSharedComment: [String: Unions.UpdateSharedCommentResult]
    let updateUser: [String: Unions.UpdateUserResult]
    let updateUserProfile: [String: Unions.UpdateUserProfileResult]
    let uploadFileRequest: [String: Unions.UploadFileRequestResult]

    enum TypeName: String, Codable {
      case mutation = "Mutation"
    }
  }
}

extension Objects.Mutation: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "addPopularRead":
        if let value = try container.decode(Unions.AddPopularReadResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createArticle":
        if let value = try container.decode(Unions.CreateArticleResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createArticleSavingRequest":
        if let value = try container.decode(Unions.CreateArticleSavingRequestResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createHighlight":
        if let value = try container.decode(Unions.CreateHighlightResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createHighlightReply":
        if let value = try container.decode(Unions.CreateHighlightReplyResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createLabel":
        if let value = try container.decode(Unions.CreateLabelResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createNewsletterEmail":
        if let value = try container.decode(Unions.CreateNewsletterEmailResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createReaction":
        if let value = try container.decode(Unions.CreateReactionResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createReminder":
        if let value = try container.decode(Unions.CreateReminderResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "deleteAccount":
        if let value = try container.decode(Unions.DeleteAccountResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "deleteHighlight":
        if let value = try container.decode(Unions.DeleteHighlightResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "deleteHighlightReply":
        if let value = try container.decode(Unions.DeleteHighlightReplyResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "deleteLabel":
        if let value = try container.decode(Unions.DeleteLabelResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "deleteNewsletterEmail":
        if let value = try container.decode(Unions.DeleteNewsletterEmailResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "deleteReaction":
        if let value = try container.decode(Unions.DeleteReactionResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "deleteReminder":
        if let value = try container.decode(Unions.DeleteReminderResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "deleteWebhook":
        if let value = try container.decode(Unions.DeleteWebhookResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "generateApiKey":
        if let value = try container.decode(Unions.GenerateApiKeyResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "googleLogin":
        if let value = try container.decode(Unions.LoginResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "googleSignup":
        if let value = try container.decode(Unions.GoogleSignupResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "logOut":
        if let value = try container.decode(Unions.LogOutResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "mergeHighlight":
        if let value = try container.decode(Unions.MergeHighlightResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reportItem":
        if let value = try container.decode(Objects.ReportItemResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "revokeApiKey":
        if let value = try container.decode(Unions.RevokeApiKeyResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "saveArticleReadingProgress":
        if let value = try container.decode(Unions.SaveArticleReadingProgressResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "saveFile":
        if let value = try container.decode(Unions.SaveResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "savePage":
        if let value = try container.decode(Unions.SaveResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "saveUrl":
        if let value = try container.decode(Unions.SaveResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setBookmarkArticle":
        if let value = try container.decode(Unions.SetBookmarkArticleResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setDeviceToken":
        if let value = try container.decode(Unions.SetDeviceTokenResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setFollow":
        if let value = try container.decode(Unions.SetFollowResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setLabels":
        if let value = try container.decode(Unions.SetLabelsResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setLabelsForHighlight":
        if let value = try container.decode(Unions.SetLabelsResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setLinkArchived":
        if let value = try container.decode(Unions.ArchiveLinkResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setShareArticle":
        if let value = try container.decode(Unions.SetShareArticleResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setShareHighlight":
        if let value = try container.decode(Unions.SetShareHighlightResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setUserPersonalization":
        if let value = try container.decode(Unions.SetUserPersonalizationResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "setWebhook":
        if let value = try container.decode(Unions.SetWebhookResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "subscribe":
        if let value = try container.decode(Unions.SubscribeResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "unsubscribe":
        if let value = try container.decode(Unions.UnsubscribeResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateHighlight":
        if let value = try container.decode(Unions.UpdateHighlightResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateHighlightReply":
        if let value = try container.decode(Unions.UpdateHighlightReplyResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateLabel":
        if let value = try container.decode(Unions.UpdateLabelResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateLinkShareInfo":
        if let value = try container.decode(Unions.UpdateLinkShareInfoResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatePage":
        if let value = try container.decode(Unions.UpdatePageResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateReminder":
        if let value = try container.decode(Unions.UpdateReminderResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateSharedComment":
        if let value = try container.decode(Unions.UpdateSharedCommentResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateUser":
        if let value = try container.decode(Unions.UpdateUserResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateUserProfile":
        if let value = try container.decode(Unions.UpdateUserProfileResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "uploadFileRequest":
        if let value = try container.decode(Unions.UploadFileRequestResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    addPopularRead = map["addPopularRead"]
    createArticle = map["createArticle"]
    createArticleSavingRequest = map["createArticleSavingRequest"]
    createHighlight = map["createHighlight"]
    createHighlightReply = map["createHighlightReply"]
    createLabel = map["createLabel"]
    createNewsletterEmail = map["createNewsletterEmail"]
    createReaction = map["createReaction"]
    createReminder = map["createReminder"]
    deleteAccount = map["deleteAccount"]
    deleteHighlight = map["deleteHighlight"]
    deleteHighlightReply = map["deleteHighlightReply"]
    deleteLabel = map["deleteLabel"]
    deleteNewsletterEmail = map["deleteNewsletterEmail"]
    deleteReaction = map["deleteReaction"]
    deleteReminder = map["deleteReminder"]
    deleteWebhook = map["deleteWebhook"]
    generateApiKey = map["generateApiKey"]
    googleLogin = map["googleLogin"]
    googleSignup = map["googleSignup"]
    logOut = map["logOut"]
    mergeHighlight = map["mergeHighlight"]
    reportItem = map["reportItem"]
    revokeApiKey = map["revokeApiKey"]
    saveArticleReadingProgress = map["saveArticleReadingProgress"]
    saveFile = map["saveFile"]
    savePage = map["savePage"]
    saveUrl = map["saveUrl"]
    setBookmarkArticle = map["setBookmarkArticle"]
    setDeviceToken = map["setDeviceToken"]
    setFollow = map["setFollow"]
    setLabels = map["setLabels"]
    setLabelsForHighlight = map["setLabelsForHighlight"]
    setLinkArchived = map["setLinkArchived"]
    setShareArticle = map["setShareArticle"]
    setShareHighlight = map["setShareHighlight"]
    setUserPersonalization = map["setUserPersonalization"]
    setWebhook = map["setWebhook"]
    subscribe = map["subscribe"]
    unsubscribe = map["unsubscribe"]
    updateHighlight = map["updateHighlight"]
    updateHighlightReply = map["updateHighlightReply"]
    updateLabel = map["updateLabel"]
    updateLinkShareInfo = map["updateLinkShareInfo"]
    updatePage = map["updatePage"]
    updateReminder = map["updateReminder"]
    updateSharedComment = map["updateSharedComment"]
    updateUser = map["updateUser"]
    updateUserProfile = map["updateUserProfile"]
    uploadFileRequest = map["uploadFileRequest"]
  }
}

extension Fields where TypeLock == Objects.Mutation {
  func addPopularRead<Type>(name: String, selection: Selection<Type, Unions.AddPopularReadResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "addPopularRead",
      arguments: [Argument(name: "name", type: "String!", value: name)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.addPopularRead[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func createArticle<Type>(input: InputObjects.CreateArticleInput, selection: Selection<Type, Unions.CreateArticleResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createArticle",
      arguments: [Argument(name: "input", type: "CreateArticleInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createArticle[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func createArticleSavingRequest<Type>(input: InputObjects.CreateArticleSavingRequestInput, selection: Selection<Type, Unions.CreateArticleSavingRequestResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createArticleSavingRequest",
      arguments: [Argument(name: "input", type: "CreateArticleSavingRequestInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createArticleSavingRequest[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func createHighlight<Type>(input: InputObjects.CreateHighlightInput, selection: Selection<Type, Unions.CreateHighlightResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createHighlight",
      arguments: [Argument(name: "input", type: "CreateHighlightInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createHighlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func createHighlightReply<Type>(input: InputObjects.CreateHighlightReplyInput, selection: Selection<Type, Unions.CreateHighlightReplyResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createHighlightReply",
      arguments: [Argument(name: "input", type: "CreateHighlightReplyInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createHighlightReply[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func createLabel<Type>(input: InputObjects.CreateLabelInput, selection: Selection<Type, Unions.CreateLabelResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createLabel",
      arguments: [Argument(name: "input", type: "CreateLabelInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createLabel[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func createNewsletterEmail<Type>(selection: Selection<Type, Unions.CreateNewsletterEmailResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createNewsletterEmail",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createNewsletterEmail[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func createReaction<Type>(input: InputObjects.CreateReactionInput, selection: Selection<Type, Unions.CreateReactionResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createReaction",
      arguments: [Argument(name: "input", type: "CreateReactionInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createReaction[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func createReminder<Type>(input: InputObjects.CreateReminderInput, selection: Selection<Type, Unions.CreateReminderResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "createReminder",
      arguments: [Argument(name: "input", type: "CreateReminderInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createReminder[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func deleteAccount<Type>(userId: String, selection: Selection<Type, Unions.DeleteAccountResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deleteAccount",
      arguments: [Argument(name: "userID", type: "ID!", value: userId)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deleteAccount[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func deleteHighlight<Type>(highlightId: String, selection: Selection<Type, Unions.DeleteHighlightResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deleteHighlight",
      arguments: [Argument(name: "highlightId", type: "ID!", value: highlightId)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deleteHighlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func deleteHighlightReply<Type>(highlightReplyId: String, selection: Selection<Type, Unions.DeleteHighlightReplyResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deleteHighlightReply",
      arguments: [Argument(name: "highlightReplyId", type: "ID!", value: highlightReplyId)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deleteHighlightReply[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func deleteLabel<Type>(id: String, selection: Selection<Type, Unions.DeleteLabelResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deleteLabel",
      arguments: [Argument(name: "id", type: "ID!", value: id)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deleteLabel[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func deleteNewsletterEmail<Type>(newsletterEmailId: String, selection: Selection<Type, Unions.DeleteNewsletterEmailResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deleteNewsletterEmail",
      arguments: [Argument(name: "newsletterEmailId", type: "ID!", value: newsletterEmailId)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deleteNewsletterEmail[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func deleteReaction<Type>(id: String, selection: Selection<Type, Unions.DeleteReactionResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deleteReaction",
      arguments: [Argument(name: "id", type: "ID!", value: id)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deleteReaction[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func deleteReminder<Type>(id: String, selection: Selection<Type, Unions.DeleteReminderResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deleteReminder",
      arguments: [Argument(name: "id", type: "ID!", value: id)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deleteReminder[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func deleteWebhook<Type>(id: String, selection: Selection<Type, Unions.DeleteWebhookResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deleteWebhook",
      arguments: [Argument(name: "id", type: "ID!", value: id)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deleteWebhook[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func generateApiKey<Type>(input: InputObjects.GenerateApiKeyInput, selection: Selection<Type, Unions.GenerateApiKeyResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "generateApiKey",
      arguments: [Argument(name: "input", type: "GenerateApiKeyInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.generateApiKey[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func googleLogin<Type>(input: InputObjects.GoogleLoginInput, selection: Selection<Type, Unions.LoginResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "googleLogin",
      arguments: [Argument(name: "input", type: "GoogleLoginInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.googleLogin[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func googleSignup<Type>(input: InputObjects.GoogleSignupInput, selection: Selection<Type, Unions.GoogleSignupResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "googleSignup",
      arguments: [Argument(name: "input", type: "GoogleSignupInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.googleSignup[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func logOut<Type>(selection: Selection<Type, Unions.LogOutResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "logOut",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.logOut[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func mergeHighlight<Type>(input: InputObjects.MergeHighlightInput, selection: Selection<Type, Unions.MergeHighlightResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "mergeHighlight",
      arguments: [Argument(name: "input", type: "MergeHighlightInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.mergeHighlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func reportItem<Type>(input: InputObjects.ReportItemInput, selection: Selection<Type, Objects.ReportItemResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reportItem",
      arguments: [Argument(name: "input", type: "ReportItemInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reportItem[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func revokeApiKey<Type>(id: String, selection: Selection<Type, Unions.RevokeApiKeyResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "revokeApiKey",
      arguments: [Argument(name: "id", type: "ID!", value: id)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.revokeApiKey[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func saveArticleReadingProgress<Type>(input: InputObjects.SaveArticleReadingProgressInput, selection: Selection<Type, Unions.SaveArticleReadingProgressResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "saveArticleReadingProgress",
      arguments: [Argument(name: "input", type: "SaveArticleReadingProgressInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.saveArticleReadingProgress[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func saveFile<Type>(input: InputObjects.SaveFileInput, selection: Selection<Type, Unions.SaveResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "saveFile",
      arguments: [Argument(name: "input", type: "SaveFileInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.saveFile[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func savePage<Type>(input: InputObjects.SavePageInput, selection: Selection<Type, Unions.SaveResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "savePage",
      arguments: [Argument(name: "input", type: "SavePageInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.savePage[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func saveUrl<Type>(input: InputObjects.SaveUrlInput, selection: Selection<Type, Unions.SaveResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "saveUrl",
      arguments: [Argument(name: "input", type: "SaveUrlInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.saveUrl[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setBookmarkArticle<Type>(input: InputObjects.SetBookmarkArticleInput, selection: Selection<Type, Unions.SetBookmarkArticleResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setBookmarkArticle",
      arguments: [Argument(name: "input", type: "SetBookmarkArticleInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setBookmarkArticle[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setDeviceToken<Type>(input: InputObjects.SetDeviceTokenInput, selection: Selection<Type, Unions.SetDeviceTokenResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setDeviceToken",
      arguments: [Argument(name: "input", type: "SetDeviceTokenInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setDeviceToken[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setFollow<Type>(input: InputObjects.SetFollowInput, selection: Selection<Type, Unions.SetFollowResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setFollow",
      arguments: [Argument(name: "input", type: "SetFollowInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setFollow[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setLabels<Type>(input: InputObjects.SetLabelsInput, selection: Selection<Type, Unions.SetLabelsResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setLabels",
      arguments: [Argument(name: "input", type: "SetLabelsInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setLabels[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setLabelsForHighlight<Type>(input: InputObjects.SetLabelsForHighlightInput, selection: Selection<Type, Unions.SetLabelsResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setLabelsForHighlight",
      arguments: [Argument(name: "input", type: "SetLabelsForHighlightInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setLabelsForHighlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setLinkArchived<Type>(input: InputObjects.ArchiveLinkInput, selection: Selection<Type, Unions.ArchiveLinkResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setLinkArchived",
      arguments: [Argument(name: "input", type: "ArchiveLinkInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setLinkArchived[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setShareArticle<Type>(input: InputObjects.SetShareArticleInput, selection: Selection<Type, Unions.SetShareArticleResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setShareArticle",
      arguments: [Argument(name: "input", type: "SetShareArticleInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setShareArticle[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setShareHighlight<Type>(input: InputObjects.SetShareHighlightInput, selection: Selection<Type, Unions.SetShareHighlightResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setShareHighlight",
      arguments: [Argument(name: "input", type: "SetShareHighlightInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setShareHighlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setUserPersonalization<Type>(input: InputObjects.SetUserPersonalizationInput, selection: Selection<Type, Unions.SetUserPersonalizationResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setUserPersonalization",
      arguments: [Argument(name: "input", type: "SetUserPersonalizationInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setUserPersonalization[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func setWebhook<Type>(input: InputObjects.SetWebhookInput, selection: Selection<Type, Unions.SetWebhookResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "setWebhook",
      arguments: [Argument(name: "input", type: "SetWebhookInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.setWebhook[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func subscribe<Type>(name: String, selection: Selection<Type, Unions.SubscribeResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "subscribe",
      arguments: [Argument(name: "name", type: "String!", value: name)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.subscribe[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func unsubscribe<Type>(name: String, selection: Selection<Type, Unions.UnsubscribeResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "unsubscribe",
      arguments: [Argument(name: "name", type: "String!", value: name)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.unsubscribe[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updateHighlight<Type>(input: InputObjects.UpdateHighlightInput, selection: Selection<Type, Unions.UpdateHighlightResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updateHighlight",
      arguments: [Argument(name: "input", type: "UpdateHighlightInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateHighlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updateHighlightReply<Type>(input: InputObjects.UpdateHighlightReplyInput, selection: Selection<Type, Unions.UpdateHighlightReplyResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updateHighlightReply",
      arguments: [Argument(name: "input", type: "UpdateHighlightReplyInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateHighlightReply[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updateLabel<Type>(input: InputObjects.UpdateLabelInput, selection: Selection<Type, Unions.UpdateLabelResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updateLabel",
      arguments: [Argument(name: "input", type: "UpdateLabelInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateLabel[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updateLinkShareInfo<Type>(input: InputObjects.UpdateLinkShareInfoInput, selection: Selection<Type, Unions.UpdateLinkShareInfoResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updateLinkShareInfo",
      arguments: [Argument(name: "input", type: "UpdateLinkShareInfoInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateLinkShareInfo[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updatePage<Type>(input: InputObjects.UpdatePageInput, selection: Selection<Type, Unions.UpdatePageResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updatePage",
      arguments: [Argument(name: "input", type: "UpdatePageInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatePage[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updateReminder<Type>(input: InputObjects.UpdateReminderInput, selection: Selection<Type, Unions.UpdateReminderResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updateReminder",
      arguments: [Argument(name: "input", type: "UpdateReminderInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateReminder[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updateSharedComment<Type>(input: InputObjects.UpdateSharedCommentInput, selection: Selection<Type, Unions.UpdateSharedCommentResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updateSharedComment",
      arguments: [Argument(name: "input", type: "UpdateSharedCommentInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateSharedComment[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updateUser<Type>(input: InputObjects.UpdateUserInput, selection: Selection<Type, Unions.UpdateUserResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updateUser",
      arguments: [Argument(name: "input", type: "UpdateUserInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateUser[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updateUserProfile<Type>(input: InputObjects.UpdateUserProfileInput, selection: Selection<Type, Unions.UpdateUserProfileResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updateUserProfile",
      arguments: [Argument(name: "input", type: "UpdateUserProfileInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateUserProfile[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func uploadFileRequest<Type>(input: InputObjects.UploadFileRequestInput, selection: Selection<Type, Unions.UploadFileRequestResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "uploadFileRequest",
      arguments: [Argument(name: "input", type: "UploadFileRequestInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.uploadFileRequest[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Mutation<T> = Selection<T, Objects.Mutation>
}

extension Objects {
  struct NewsletterEmail {
    let __typename: TypeName = .newsletterEmail
    let address: [String: String]
    let confirmationCode: [String: String]
    let id: [String: String]

    enum TypeName: String, Codable {
      case newsletterEmail = "NewsletterEmail"
    }
  }
}

extension Objects.NewsletterEmail: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "address":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "confirmationCode":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    address = map["address"]
    confirmationCode = map["confirmationCode"]
    id = map["id"]
  }
}

extension Fields where TypeLock == Objects.NewsletterEmail {
  func address() throws -> String {
    let field = GraphQLField.leaf(
      name: "address",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.address[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func confirmationCode() throws -> String? {
    let field = GraphQLField.leaf(
      name: "confirmationCode",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.confirmationCode[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias NewsletterEmail<T> = Selection<T, Objects.NewsletterEmail>
}

extension Objects {
  struct NewsletterEmailsError {
    let __typename: TypeName = .newsletterEmailsError
    let errorCodes: [String: [Enums.NewsletterEmailsErrorCode]]

    enum TypeName: String, Codable {
      case newsletterEmailsError = "NewsletterEmailsError"
    }
  }
}

extension Objects.NewsletterEmailsError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.NewsletterEmailsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.NewsletterEmailsError {
  func errorCodes() throws -> [Enums.NewsletterEmailsErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias NewsletterEmailsError<T> = Selection<T, Objects.NewsletterEmailsError>
}

extension Objects {
  struct NewsletterEmailsSuccess {
    let __typename: TypeName = .newsletterEmailsSuccess
    let newsletterEmails: [String: [Objects.NewsletterEmail]]

    enum TypeName: String, Codable {
      case newsletterEmailsSuccess = "NewsletterEmailsSuccess"
    }
  }
}

extension Objects.NewsletterEmailsSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "newsletterEmails":
        if let value = try container.decode([Objects.NewsletterEmail]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    newsletterEmails = map["newsletterEmails"]
  }
}

extension Fields where TypeLock == Objects.NewsletterEmailsSuccess {
  func newsletterEmails<Type>(selection: Selection<Type, [Objects.NewsletterEmail]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "newsletterEmails",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.newsletterEmails[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias NewsletterEmailsSuccess<T> = Selection<T, Objects.NewsletterEmailsSuccess>
}

extension Objects {
  struct Page {
    let __typename: TypeName = .page
    let author: [String: String]
    let createdAt: [String: DateTime]
    let description: [String: String]
    let hash: [String: String]
    let id: [String: String]
    let image: [String: String]
    let originalHtml: [String: String]
    let originalUrl: [String: String]
    let publishedAt: [String: DateTime]
    let readableHtml: [String: String]
    let title: [String: String]
    let type: [String: Enums.PageType]
    let updatedAt: [String: DateTime]
    let url: [String: String]

    enum TypeName: String, Codable {
      case page = "Page"
    }
  }
}

extension Objects.Page: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "author":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "description":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "hash":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "image":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "originalHtml":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "originalUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "publishedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readableHtml":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "title":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "type":
        if let value = try container.decode(Enums.PageType?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "url":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    author = map["author"]
    createdAt = map["createdAt"]
    description = map["description"]
    hash = map["hash"]
    id = map["id"]
    image = map["image"]
    originalHtml = map["originalHtml"]
    originalUrl = map["originalUrl"]
    publishedAt = map["publishedAt"]
    readableHtml = map["readableHtml"]
    title = map["title"]
    type = map["type"]
    updatedAt = map["updatedAt"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.Page {
  func author() throws -> String? {
    let field = GraphQLField.leaf(
      name: "author",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.author[field.alias!]
    case .mocking:
      return nil
    }
  }

  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func description() throws -> String? {
    let field = GraphQLField.leaf(
      name: "description",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.description[field.alias!]
    case .mocking:
      return nil
    }
  }

  func hash() throws -> String {
    let field = GraphQLField.leaf(
      name: "hash",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.hash[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func image() throws -> String {
    let field = GraphQLField.leaf(
      name: "image",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.image[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func originalHtml() throws -> String {
    let field = GraphQLField.leaf(
      name: "originalHtml",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.originalHtml[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func originalUrl() throws -> String {
    let field = GraphQLField.leaf(
      name: "originalUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.originalUrl[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func publishedAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "publishedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.publishedAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func readableHtml() throws -> String {
    let field = GraphQLField.leaf(
      name: "readableHtml",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.readableHtml[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func title() throws -> String {
    let field = GraphQLField.leaf(
      name: "title",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.title[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func type() throws -> Enums.PageType {
    let field = GraphQLField.leaf(
      name: "type",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.type[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Enums.PageType.allCases.first!
    }
  }

  func updatedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func url() throws -> String {
    let field = GraphQLField.leaf(
      name: "url",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.url[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Page<T> = Selection<T, Objects.Page>
}

extension Objects {
  struct PageInfo {
    let __typename: TypeName = .pageInfo
    let endCursor: [String: String]
    let hasNextPage: [String: Bool]
    let hasPreviousPage: [String: Bool]
    let startCursor: [String: String]
    let totalCount: [String: Int]

    enum TypeName: String, Codable {
      case pageInfo = "PageInfo"
    }
  }
}

extension Objects.PageInfo: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "endCursor":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "hasNextPage":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "hasPreviousPage":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "startCursor":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "totalCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    endCursor = map["endCursor"]
    hasNextPage = map["hasNextPage"]
    hasPreviousPage = map["hasPreviousPage"]
    startCursor = map["startCursor"]
    totalCount = map["totalCount"]
  }
}

extension Fields where TypeLock == Objects.PageInfo {
  func endCursor() throws -> String? {
    let field = GraphQLField.leaf(
      name: "endCursor",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.endCursor[field.alias!]
    case .mocking:
      return nil
    }
  }

  func hasNextPage() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "hasNextPage",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.hasNextPage[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func hasPreviousPage() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "hasPreviousPage",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.hasPreviousPage[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func startCursor() throws -> String? {
    let field = GraphQLField.leaf(
      name: "startCursor",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.startCursor[field.alias!]
    case .mocking:
      return nil
    }
  }

  func totalCount() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "totalCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.totalCount[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias PageInfo<T> = Selection<T, Objects.PageInfo>
}

extension Objects {
  struct Profile {
    let __typename: TypeName = .profile
    let bio: [String: String]
    let id: [String: String]
    let pictureUrl: [String: String]
    let `private`: [String: Bool]
    let username: [String: String]

    enum TypeName: String, Codable {
      case profile = "Profile"
    }
  }
}

extension Objects.Profile: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "bio":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pictureUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "private":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "username":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    bio = map["bio"]
    id = map["id"]
    pictureUrl = map["pictureUrl"]
    self.private = map["private"]
    username = map["username"]
  }
}

extension Fields where TypeLock == Objects.Profile {
  func bio() throws -> String? {
    let field = GraphQLField.leaf(
      name: "bio",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.bio[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func pictureUrl() throws -> String? {
    let field = GraphQLField.leaf(
      name: "pictureUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.pictureUrl[field.alias!]
    case .mocking:
      return nil
    }
  }

  func `private`() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "private",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.private[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func username() throws -> String {
    let field = GraphQLField.leaf(
      name: "username",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.username[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Profile<T> = Selection<T, Objects.Profile>
}

extension Objects {
  struct Query {
    let __typename: TypeName = .query
    let apiKeys: [String: Unions.ApiKeysResult]
    let article: [String: Unions.ArticleResult]
    let articleSavingRequest: [String: Unions.ArticleSavingRequestResult]
    let articles: [String: Unions.ArticlesResult]
    let feedArticles: [String: Unions.FeedArticlesResult]
    let getFollowers: [String: Unions.GetFollowersResult]
    let getFollowing: [String: Unions.GetFollowingResult]
    let getUserPersonalization: [String: Unions.GetUserPersonalizationResult]
    let hello: [String: String]
    let labels: [String: Unions.LabelsResult]
    let me: [String: Objects.User]
    let newsletterEmails: [String: Unions.NewsletterEmailsResult]
    let reminder: [String: Unions.ReminderResult]
    let search: [String: Unions.SearchResult]
    let sendInstallInstructions: [String: Unions.SendInstallInstructionsResult]
    let sharedArticle: [String: Unions.SharedArticleResult]
    let subscriptions: [String: Unions.SubscriptionsResult]
    let typeaheadSearch: [String: Unions.TypeaheadSearchResult]
    let updatesSince: [String: Unions.UpdatesSinceResult]
    let user: [String: Unions.UserResult]
    let users: [String: Unions.UsersResult]
    let validateUsername: [String: Bool]
    let webhook: [String: Unions.WebhookResult]
    let webhooks: [String: Unions.WebhooksResult]

    enum TypeName: String, Codable {
      case query = "Query"
    }
  }
}

extension Objects.Query: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "apiKeys":
        if let value = try container.decode(Unions.ApiKeysResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "article":
        if let value = try container.decode(Unions.ArticleResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "articleSavingRequest":
        if let value = try container.decode(Unions.ArticleSavingRequestResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "articles":
        if let value = try container.decode(Unions.ArticlesResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "feedArticles":
        if let value = try container.decode(Unions.FeedArticlesResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "getFollowers":
        if let value = try container.decode(Unions.GetFollowersResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "getFollowing":
        if let value = try container.decode(Unions.GetFollowingResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "getUserPersonalization":
        if let value = try container.decode(Unions.GetUserPersonalizationResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "hello":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "labels":
        if let value = try container.decode(Unions.LabelsResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "me":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "newsletterEmails":
        if let value = try container.decode(Unions.NewsletterEmailsResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reminder":
        if let value = try container.decode(Unions.ReminderResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "search":
        if let value = try container.decode(Unions.SearchResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sendInstallInstructions":
        if let value = try container.decode(Unions.SendInstallInstructionsResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedArticle":
        if let value = try container.decode(Unions.SharedArticleResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "subscriptions":
        if let value = try container.decode(Unions.SubscriptionsResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "typeaheadSearch":
        if let value = try container.decode(Unions.TypeaheadSearchResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatesSince":
        if let value = try container.decode(Unions.UpdatesSinceResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Unions.UserResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "users":
        if let value = try container.decode(Unions.UsersResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "validateUsername":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "webhook":
        if let value = try container.decode(Unions.WebhookResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "webhooks":
        if let value = try container.decode(Unions.WebhooksResult?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    apiKeys = map["apiKeys"]
    article = map["article"]
    articleSavingRequest = map["articleSavingRequest"]
    articles = map["articles"]
    feedArticles = map["feedArticles"]
    getFollowers = map["getFollowers"]
    getFollowing = map["getFollowing"]
    getUserPersonalization = map["getUserPersonalization"]
    hello = map["hello"]
    labels = map["labels"]
    me = map["me"]
    newsletterEmails = map["newsletterEmails"]
    reminder = map["reminder"]
    search = map["search"]
    sendInstallInstructions = map["sendInstallInstructions"]
    sharedArticle = map["sharedArticle"]
    subscriptions = map["subscriptions"]
    typeaheadSearch = map["typeaheadSearch"]
    updatesSince = map["updatesSince"]
    user = map["user"]
    users = map["users"]
    validateUsername = map["validateUsername"]
    webhook = map["webhook"]
    webhooks = map["webhooks"]
  }
}

extension Fields where TypeLock == Objects.Query {
  func apiKeys<Type>(selection: Selection<Type, Unions.ApiKeysResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "apiKeys",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.apiKeys[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func article<Type>(slug: String, username: String, selection: Selection<Type, Unions.ArticleResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "article",
      arguments: [Argument(name: "slug", type: "String!", value: slug), Argument(name: "username", type: "String!", value: username)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.article[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func articleSavingRequest<Type>(id: String, selection: Selection<Type, Unions.ArticleSavingRequestResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "articleSavingRequest",
      arguments: [Argument(name: "id", type: "ID!", value: id)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.articleSavingRequest[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func articles<Type>(after: OptionalArgument<String> = .absent(), first: OptionalArgument<Int> = .absent(), includePending: OptionalArgument<Bool> = .absent(), query: OptionalArgument<String> = .absent(), sharedOnly: OptionalArgument<Bool> = .absent(), sort: OptionalArgument<InputObjects.SortParams> = .absent(), selection: Selection<Type, Unions.ArticlesResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "articles",
      arguments: [Argument(name: "after", type: "String", value: after), Argument(name: "first", type: "Int", value: first), Argument(name: "includePending", type: "Boolean", value: includePending), Argument(name: "query", type: "String", value: query), Argument(name: "sharedOnly", type: "Boolean", value: sharedOnly), Argument(name: "sort", type: "SortParams", value: sort)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.articles[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func feedArticles<Type>(after: OptionalArgument<String> = .absent(), first: OptionalArgument<Int> = .absent(), sharedByUser: OptionalArgument<String> = .absent(), sort: OptionalArgument<InputObjects.SortParams> = .absent(), selection: Selection<Type, Unions.FeedArticlesResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "feedArticles",
      arguments: [Argument(name: "after", type: "String", value: after), Argument(name: "first", type: "Int", value: first), Argument(name: "sharedByUser", type: "ID", value: sharedByUser), Argument(name: "sort", type: "SortParams", value: sort)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.feedArticles[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func getFollowers<Type>(userId: OptionalArgument<String> = .absent(), selection: Selection<Type, Unions.GetFollowersResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "getFollowers",
      arguments: [Argument(name: "userId", type: "ID", value: userId)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.getFollowers[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func getFollowing<Type>(userId: OptionalArgument<String> = .absent(), selection: Selection<Type, Unions.GetFollowingResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "getFollowing",
      arguments: [Argument(name: "userId", type: "ID", value: userId)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.getFollowing[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func getUserPersonalization<Type>(selection: Selection<Type, Unions.GetUserPersonalizationResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "getUserPersonalization",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.getUserPersonalization[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func hello() throws -> String? {
    let field = GraphQLField.leaf(
      name: "hello",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.hello[field.alias!]
    case .mocking:
      return nil
    }
  }

  func labels<Type>(selection: Selection<Type, Unions.LabelsResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "labels",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.labels[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func me<Type>(selection: Selection<Type, Objects.User?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "me",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.me[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func newsletterEmails<Type>(selection: Selection<Type, Unions.NewsletterEmailsResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "newsletterEmails",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.newsletterEmails[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func reminder<Type>(linkId: String, selection: Selection<Type, Unions.ReminderResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reminder",
      arguments: [Argument(name: "linkId", type: "ID!", value: linkId)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reminder[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func search<Type>(after: OptionalArgument<String> = .absent(), first: OptionalArgument<Int> = .absent(), query: OptionalArgument<String> = .absent(), selection: Selection<Type, Unions.SearchResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "search",
      arguments: [Argument(name: "after", type: "String", value: after), Argument(name: "first", type: "Int", value: first), Argument(name: "query", type: "String", value: query)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.search[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func sendInstallInstructions<Type>(selection: Selection<Type, Unions.SendInstallInstructionsResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "sendInstallInstructions",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.sendInstallInstructions[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func sharedArticle<Type>(selectedHighlightId: OptionalArgument<String> = .absent(), slug: String, username: String, selection: Selection<Type, Unions.SharedArticleResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "sharedArticle",
      arguments: [Argument(name: "selectedHighlightId", type: "String", value: selectedHighlightId), Argument(name: "slug", type: "String!", value: slug), Argument(name: "username", type: "String!", value: username)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.sharedArticle[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func subscriptions<Type>(sort: OptionalArgument<InputObjects.SortParams> = .absent(), selection: Selection<Type, Unions.SubscriptionsResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "subscriptions",
      arguments: [Argument(name: "sort", type: "SortParams", value: sort)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.subscriptions[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func typeaheadSearch<Type>(first: OptionalArgument<Int> = .absent(), query: String, selection: Selection<Type, Unions.TypeaheadSearchResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "typeaheadSearch",
      arguments: [Argument(name: "first", type: "Int", value: first), Argument(name: "query", type: "String!", value: query)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.typeaheadSearch[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updatesSince<Type>(after: OptionalArgument<String> = .absent(), first: OptionalArgument<Int> = .absent(), since: DateTime, selection: Selection<Type, Unions.UpdatesSinceResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updatesSince",
      arguments: [Argument(name: "after", type: "String", value: after), Argument(name: "first", type: "Int", value: first), Argument(name: "since", type: "Date!", value: since)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatesSince[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func user<Type>(userId: OptionalArgument<String> = .absent(), username: OptionalArgument<String> = .absent(), selection: Selection<Type, Unions.UserResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [Argument(name: "userId", type: "ID", value: userId), Argument(name: "username", type: "String", value: username)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func users<Type>(selection: Selection<Type, Unions.UsersResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "users",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.users[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func validateUsername(username: String) throws -> Bool {
    let field = GraphQLField.leaf(
      name: "validateUsername",
      arguments: [Argument(name: "username", type: "String!", value: username)]
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.validateUsername[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func webhook<Type>(id: String, selection: Selection<Type, Unions.WebhookResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "webhook",
      arguments: [Argument(name: "id", type: "ID!", value: id)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.webhook[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func webhooks<Type>(selection: Selection<Type, Unions.WebhooksResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "webhooks",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.webhooks[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Query<T> = Selection<T, Objects.Query>
}

extension Objects {
  struct Reaction {
    let __typename: TypeName = .reaction
    let code: [String: Enums.ReactionType]
    let createdAt: [String: DateTime]
    let id: [String: String]
    let updatedAt: [String: DateTime]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case reaction = "Reaction"
    }
  }
}

extension Objects.Reaction: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "code":
        if let value = try container.decode(Enums.ReactionType?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    code = map["code"]
    createdAt = map["createdAt"]
    id = map["id"]
    updatedAt = map["updatedAt"]
    user = map["user"]
  }
}

extension Fields where TypeLock == Objects.Reaction {
  func code() throws -> Enums.ReactionType {
    let field = GraphQLField.leaf(
      name: "code",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.code[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Enums.ReactionType.allCases.first!
    }
  }

  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func updatedAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.updatedAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func user<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Reaction<T> = Selection<T, Objects.Reaction>
}

extension Objects {
  struct ReadState {
    let __typename: TypeName = .readState
    let progressAnchorIndex: [String: Int]
    let progressPercent: [String: Double]
    let reading: [String: Bool]
    let readingTime: [String: Int]

    enum TypeName: String, Codable {
      case readState = "ReadState"
    }
  }
}

extension Objects.ReadState: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "progressAnchorIndex":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "progressPercent":
        if let value = try container.decode(Double?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reading":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readingTime":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    progressAnchorIndex = map["progressAnchorIndex"]
    progressPercent = map["progressPercent"]
    reading = map["reading"]
    readingTime = map["readingTime"]
  }
}

extension Fields where TypeLock == Objects.ReadState {
  func progressAnchorIndex() throws -> Int {
    let field = GraphQLField.leaf(
      name: "progressAnchorIndex",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.progressAnchorIndex[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Int.mockValue
    }
  }

  func progressPercent() throws -> Double {
    let field = GraphQLField.leaf(
      name: "progressPercent",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.progressPercent[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Double.mockValue
    }
  }

  func reading() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "reading",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.reading[field.alias!]
    case .mocking:
      return nil
    }
  }

  func readingTime() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "readingTime",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.readingTime[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ReadState<T> = Selection<T, Objects.ReadState>
}

extension Objects {
  struct Reminder {
    let __typename: TypeName = .reminder
    let archiveUntil: [String: Bool]
    let id: [String: String]
    let remindAt: [String: DateTime]
    let sendNotification: [String: Bool]

    enum TypeName: String, Codable {
      case reminder = "Reminder"
    }
  }
}

extension Objects.Reminder: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "archiveUntil":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "remindAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sendNotification":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    archiveUntil = map["archiveUntil"]
    id = map["id"]
    remindAt = map["remindAt"]
    sendNotification = map["sendNotification"]
  }
}

extension Fields where TypeLock == Objects.Reminder {
  func archiveUntil() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "archiveUntil",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.archiveUntil[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func remindAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "remindAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.remindAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func sendNotification() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "sendNotification",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.sendNotification[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Reminder<T> = Selection<T, Objects.Reminder>
}

extension Objects {
  struct ReminderError {
    let __typename: TypeName = .reminderError
    let errorCodes: [String: [Enums.ReminderErrorCode]]

    enum TypeName: String, Codable {
      case reminderError = "ReminderError"
    }
  }
}

extension Objects.ReminderError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.ReminderErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.ReminderError {
  func errorCodes() throws -> [Enums.ReminderErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ReminderError<T> = Selection<T, Objects.ReminderError>
}

extension Objects {
  struct ReminderSuccess {
    let __typename: TypeName = .reminderSuccess
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case reminderSuccess = "ReminderSuccess"
    }
  }
}

extension Objects.ReminderSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "reminder":
        if let value = try container.decode(Objects.Reminder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    reminder = map["reminder"]
  }
}

extension Fields where TypeLock == Objects.ReminderSuccess {
  func reminder<Type>(selection: Selection<Type, Objects.Reminder>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reminder",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reminder[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ReminderSuccess<T> = Selection<T, Objects.ReminderSuccess>
}

extension Objects {
  struct ReportItemResult {
    let __typename: TypeName = .reportItemResult
    let message: [String: String]

    enum TypeName: String, Codable {
      case reportItemResult = "ReportItemResult"
    }
  }
}

extension Objects.ReportItemResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    message = map["message"]
  }
}

extension Fields where TypeLock == Objects.ReportItemResult {
  func message() throws -> String {
    let field = GraphQLField.leaf(
      name: "message",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.message[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ReportItemResult<T> = Selection<T, Objects.ReportItemResult>
}

extension Objects {
  struct RevokeApiKeyError {
    let __typename: TypeName = .revokeApiKeyError
    let errorCodes: [String: [Enums.RevokeApiKeyErrorCode]]

    enum TypeName: String, Codable {
      case revokeApiKeyError = "RevokeApiKeyError"
    }
  }
}

extension Objects.RevokeApiKeyError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.RevokeApiKeyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.RevokeApiKeyError {
  func errorCodes() throws -> [Enums.RevokeApiKeyErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias RevokeApiKeyError<T> = Selection<T, Objects.RevokeApiKeyError>
}

extension Objects {
  struct RevokeApiKeySuccess {
    let __typename: TypeName = .revokeApiKeySuccess
    let apiKey: [String: Objects.ApiKey]

    enum TypeName: String, Codable {
      case revokeApiKeySuccess = "RevokeApiKeySuccess"
    }
  }
}

extension Objects.RevokeApiKeySuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "apiKey":
        if let value = try container.decode(Objects.ApiKey?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    apiKey = map["apiKey"]
  }
}

extension Fields where TypeLock == Objects.RevokeApiKeySuccess {
  func apiKey<Type>(selection: Selection<Type, Objects.ApiKey>) throws -> Type {
    let field = GraphQLField.composite(
      name: "apiKey",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.apiKey[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias RevokeApiKeySuccess<T> = Selection<T, Objects.RevokeApiKeySuccess>
}

extension Objects {
  struct SaveArticleReadingProgressError {
    let __typename: TypeName = .saveArticleReadingProgressError
    let errorCodes: [String: [Enums.SaveArticleReadingProgressErrorCode]]

    enum TypeName: String, Codable {
      case saveArticleReadingProgressError = "SaveArticleReadingProgressError"
    }
  }
}

extension Objects.SaveArticleReadingProgressError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SaveArticleReadingProgressErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SaveArticleReadingProgressError {
  func errorCodes() throws -> [Enums.SaveArticleReadingProgressErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveArticleReadingProgressError<T> = Selection<T, Objects.SaveArticleReadingProgressError>
}

extension Objects {
  struct SaveArticleReadingProgressSuccess {
    let __typename: TypeName = .saveArticleReadingProgressSuccess
    let updatedArticle: [String: Objects.Article]

    enum TypeName: String, Codable {
      case saveArticleReadingProgressSuccess = "SaveArticleReadingProgressSuccess"
    }
  }
}

extension Objects.SaveArticleReadingProgressSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "updatedArticle":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    updatedArticle = map["updatedArticle"]
  }
}

extension Fields where TypeLock == Objects.SaveArticleReadingProgressSuccess {
  func updatedArticle<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updatedArticle",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedArticle[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveArticleReadingProgressSuccess<T> = Selection<T, Objects.SaveArticleReadingProgressSuccess>
}

extension Objects {
  struct SaveError {
    let __typename: TypeName = .saveError
    let errorCodes: [String: [Enums.SaveErrorCode]]
    let message: [String: String]

    enum TypeName: String, Codable {
      case saveError = "SaveError"
    }
  }
}

extension Objects.SaveError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SaveErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
    message = map["message"]
  }
}

extension Fields where TypeLock == Objects.SaveError {
  func errorCodes() throws -> [Enums.SaveErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }

  func message() throws -> String? {
    let field = GraphQLField.leaf(
      name: "message",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.message[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveError<T> = Selection<T, Objects.SaveError>
}

extension Objects {
  struct SaveSuccess {
    let __typename: TypeName = .saveSuccess
    let clientRequestId: [String: String]
    let url: [String: String]

    enum TypeName: String, Codable {
      case saveSuccess = "SaveSuccess"
    }
  }
}

extension Objects.SaveSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "clientRequestId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "url":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    clientRequestId = map["clientRequestId"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.SaveSuccess {
  func clientRequestId() throws -> String {
    let field = GraphQLField.leaf(
      name: "clientRequestId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.clientRequestId[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func url() throws -> String {
    let field = GraphQLField.leaf(
      name: "url",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.url[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveSuccess<T> = Selection<T, Objects.SaveSuccess>
}

extension Objects {
  struct SearchError {
    let __typename: TypeName = .searchError
    let errorCodes: [String: [Enums.SearchErrorCode]]

    enum TypeName: String, Codable {
      case searchError = "SearchError"
    }
  }
}

extension Objects.SearchError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SearchErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SearchError {
  func errorCodes() throws -> [Enums.SearchErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SearchError<T> = Selection<T, Objects.SearchError>
}

extension Objects {
  struct SearchItem {
    let __typename: TypeName = .searchItem
    let annotation: [String: String]
    let author: [String: String]
    let contentReader: [String: Enums.ContentReader]
    let createdAt: [String: DateTime]
    let description: [String: String]
    let highlights: [String: [Objects.Highlight]]
    let id: [String: String]
    let image: [String: String]
    let isArchived: [String: Bool]
    let labels: [String: [Objects.Label]]
    let language: [String: String]
    let originalArticleUrl: [String: String]
    let ownedByViewer: [String: Bool]
    let pageId: [String: String]
    let pageType: [String: Enums.PageType]
    let publishedAt: [String: DateTime]
    let quote: [String: String]
    let readAt: [String: DateTime]
    let readingProgressAnchorIndex: [String: Int]
    let readingProgressPercent: [String: Double]
    let savedAt: [String: DateTime]
    let shortId: [String: String]
    let siteName: [String: String]
    let slug: [String: String]
    let state: [String: Enums.ArticleSavingRequestStatus]
    let subscription: [String: String]
    let title: [String: String]
    let unsubHttpUrl: [String: String]
    let unsubMailTo: [String: String]
    let updatedAt: [String: DateTime]
    let uploadFileId: [String: String]
    let url: [String: String]

    enum TypeName: String, Codable {
      case searchItem = "SearchItem"
    }
  }
}

extension Objects.SearchItem: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "annotation":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "author":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "contentReader":
        if let value = try container.decode(Enums.ContentReader?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "description":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlights":
        if let value = try container.decode([Objects.Highlight]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "image":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "isArchived":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "labels":
        if let value = try container.decode([Objects.Label]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "language":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "originalArticleUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "ownedByViewer":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageType":
        if let value = try container.decode(Enums.PageType?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "publishedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "quote":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readingProgressAnchorIndex":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "readingProgressPercent":
        if let value = try container.decode(Double?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "savedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "shortId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "siteName":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "slug":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "state":
        if let value = try container.decode(Enums.ArticleSavingRequestStatus?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "subscription":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "title":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "unsubHttpUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "unsubMailTo":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "uploadFileId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "url":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    annotation = map["annotation"]
    author = map["author"]
    contentReader = map["contentReader"]
    createdAt = map["createdAt"]
    description = map["description"]
    highlights = map["highlights"]
    id = map["id"]
    image = map["image"]
    isArchived = map["isArchived"]
    labels = map["labels"]
    language = map["language"]
    originalArticleUrl = map["originalArticleUrl"]
    ownedByViewer = map["ownedByViewer"]
    pageId = map["pageId"]
    pageType = map["pageType"]
    publishedAt = map["publishedAt"]
    quote = map["quote"]
    readAt = map["readAt"]
    readingProgressAnchorIndex = map["readingProgressAnchorIndex"]
    readingProgressPercent = map["readingProgressPercent"]
    savedAt = map["savedAt"]
    shortId = map["shortId"]
    siteName = map["siteName"]
    slug = map["slug"]
    state = map["state"]
    subscription = map["subscription"]
    title = map["title"]
    unsubHttpUrl = map["unsubHttpUrl"]
    unsubMailTo = map["unsubMailTo"]
    updatedAt = map["updatedAt"]
    uploadFileId = map["uploadFileId"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.SearchItem {
  func annotation() throws -> String? {
    let field = GraphQLField.leaf(
      name: "annotation",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.annotation[field.alias!]
    case .mocking:
      return nil
    }
  }

  func author() throws -> String? {
    let field = GraphQLField.leaf(
      name: "author",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.author[field.alias!]
    case .mocking:
      return nil
    }
  }

  func contentReader() throws -> Enums.ContentReader {
    let field = GraphQLField.leaf(
      name: "contentReader",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.contentReader[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Enums.ContentReader.allCases.first!
    }
  }

  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func description() throws -> String? {
    let field = GraphQLField.leaf(
      name: "description",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.description[field.alias!]
    case .mocking:
      return nil
    }
  }

  func highlights<Type>(selection: Selection<Type, [Objects.Highlight]?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlights",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.highlights[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func image() throws -> String? {
    let field = GraphQLField.leaf(
      name: "image",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.image[field.alias!]
    case .mocking:
      return nil
    }
  }

  func isArchived() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "isArchived",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.isArchived[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func labels<Type>(selection: Selection<Type, [Objects.Label]?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "labels",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.labels[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func language() throws -> String? {
    let field = GraphQLField.leaf(
      name: "language",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.language[field.alias!]
    case .mocking:
      return nil
    }
  }

  func originalArticleUrl() throws -> String? {
    let field = GraphQLField.leaf(
      name: "originalArticleUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.originalArticleUrl[field.alias!]
    case .mocking:
      return nil
    }
  }

  func ownedByViewer() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "ownedByViewer",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.ownedByViewer[field.alias!]
    case .mocking:
      return nil
    }
  }

  func pageId() throws -> String? {
    let field = GraphQLField.leaf(
      name: "pageId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.pageId[field.alias!]
    case .mocking:
      return nil
    }
  }

  func pageType() throws -> Enums.PageType {
    let field = GraphQLField.leaf(
      name: "pageType",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.pageType[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Enums.PageType.allCases.first!
    }
  }

  func publishedAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "publishedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.publishedAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func quote() throws -> String? {
    let field = GraphQLField.leaf(
      name: "quote",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.quote[field.alias!]
    case .mocking:
      return nil
    }
  }

  func readAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "readAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.readAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func readingProgressAnchorIndex() throws -> Int {
    let field = GraphQLField.leaf(
      name: "readingProgressAnchorIndex",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.readingProgressAnchorIndex[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Int.mockValue
    }
  }

  func readingProgressPercent() throws -> Double {
    let field = GraphQLField.leaf(
      name: "readingProgressPercent",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.readingProgressPercent[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Double.mockValue
    }
  }

  func savedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "savedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.savedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func shortId() throws -> String? {
    let field = GraphQLField.leaf(
      name: "shortId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.shortId[field.alias!]
    case .mocking:
      return nil
    }
  }

  func siteName() throws -> String? {
    let field = GraphQLField.leaf(
      name: "siteName",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.siteName[field.alias!]
    case .mocking:
      return nil
    }
  }

  func slug() throws -> String {
    let field = GraphQLField.leaf(
      name: "slug",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.slug[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func state() throws -> Enums.ArticleSavingRequestStatus? {
    let field = GraphQLField.leaf(
      name: "state",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.state[field.alias!]
    case .mocking:
      return nil
    }
  }

  func subscription() throws -> String? {
    let field = GraphQLField.leaf(
      name: "subscription",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.subscription[field.alias!]
    case .mocking:
      return nil
    }
  }

  func title() throws -> String {
    let field = GraphQLField.leaf(
      name: "title",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.title[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func unsubHttpUrl() throws -> String? {
    let field = GraphQLField.leaf(
      name: "unsubHttpUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.unsubHttpUrl[field.alias!]
    case .mocking:
      return nil
    }
  }

  func unsubMailTo() throws -> String? {
    let field = GraphQLField.leaf(
      name: "unsubMailTo",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.unsubMailTo[field.alias!]
    case .mocking:
      return nil
    }
  }

  func updatedAt() throws -> DateTime? {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.updatedAt[field.alias!]
    case .mocking:
      return nil
    }
  }

  func uploadFileId() throws -> String? {
    let field = GraphQLField.leaf(
      name: "uploadFileId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.uploadFileId[field.alias!]
    case .mocking:
      return nil
    }
  }

  func url() throws -> String {
    let field = GraphQLField.leaf(
      name: "url",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.url[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SearchItem<T> = Selection<T, Objects.SearchItem>
}

extension Objects {
  struct SearchItemEdge {
    let __typename: TypeName = .searchItemEdge
    let cursor: [String: String]
    let node: [String: Objects.SearchItem]

    enum TypeName: String, Codable {
      case searchItemEdge = "SearchItemEdge"
    }
  }
}

extension Objects.SearchItemEdge: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "cursor":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "node":
        if let value = try container.decode(Objects.SearchItem?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    cursor = map["cursor"]
    node = map["node"]
  }
}

extension Fields where TypeLock == Objects.SearchItemEdge {
  func cursor() throws -> String {
    let field = GraphQLField.leaf(
      name: "cursor",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.cursor[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func node<Type>(selection: Selection<Type, Objects.SearchItem>) throws -> Type {
    let field = GraphQLField.composite(
      name: "node",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.node[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SearchItemEdge<T> = Selection<T, Objects.SearchItemEdge>
}

extension Objects {
  struct SearchSuccess {
    let __typename: TypeName = .searchSuccess
    let edges: [String: [Objects.SearchItemEdge]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case searchSuccess = "SearchSuccess"
    }
  }
}

extension Objects.SearchSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "edges":
        if let value = try container.decode([Objects.SearchItemEdge]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageInfo":
        if let value = try container.decode(Objects.PageInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    edges = map["edges"]
    pageInfo = map["pageInfo"]
  }
}

extension Fields where TypeLock == Objects.SearchSuccess {
  func edges<Type>(selection: Selection<Type, [Objects.SearchItemEdge]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "edges",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.edges[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func pageInfo<Type>(selection: Selection<Type, Objects.PageInfo>) throws -> Type {
    let field = GraphQLField.composite(
      name: "pageInfo",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.pageInfo[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SearchSuccess<T> = Selection<T, Objects.SearchSuccess>
}

extension Objects {
  struct SendInstallInstructionsError {
    let __typename: TypeName = .sendInstallInstructionsError
    let errorCodes: [String: [Enums.SendInstallInstructionsErrorCode]]

    enum TypeName: String, Codable {
      case sendInstallInstructionsError = "SendInstallInstructionsError"
    }
  }
}

extension Objects.SendInstallInstructionsError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SendInstallInstructionsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SendInstallInstructionsError {
  func errorCodes() throws -> [Enums.SendInstallInstructionsErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SendInstallInstructionsError<T> = Selection<T, Objects.SendInstallInstructionsError>
}

extension Objects {
  struct SendInstallInstructionsSuccess {
    let __typename: TypeName = .sendInstallInstructionsSuccess
    let sent: [String: Bool]

    enum TypeName: String, Codable {
      case sendInstallInstructionsSuccess = "SendInstallInstructionsSuccess"
    }
  }
}

extension Objects.SendInstallInstructionsSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "sent":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    sent = map["sent"]
  }
}

extension Fields where TypeLock == Objects.SendInstallInstructionsSuccess {
  func sent() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "sent",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.sent[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SendInstallInstructionsSuccess<T> = Selection<T, Objects.SendInstallInstructionsSuccess>
}

extension Objects {
  struct SetBookmarkArticleError {
    let __typename: TypeName = .setBookmarkArticleError
    let errorCodes: [String: [Enums.SetBookmarkArticleErrorCode]]

    enum TypeName: String, Codable {
      case setBookmarkArticleError = "SetBookmarkArticleError"
    }
  }
}

extension Objects.SetBookmarkArticleError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetBookmarkArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SetBookmarkArticleError {
  func errorCodes() throws -> [Enums.SetBookmarkArticleErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetBookmarkArticleError<T> = Selection<T, Objects.SetBookmarkArticleError>
}

extension Objects {
  struct SetBookmarkArticleSuccess {
    let __typename: TypeName = .setBookmarkArticleSuccess
    let bookmarkedArticle: [String: Objects.Article]

    enum TypeName: String, Codable {
      case setBookmarkArticleSuccess = "SetBookmarkArticleSuccess"
    }
  }
}

extension Objects.SetBookmarkArticleSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "bookmarkedArticle":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    bookmarkedArticle = map["bookmarkedArticle"]
  }
}

extension Fields where TypeLock == Objects.SetBookmarkArticleSuccess {
  func bookmarkedArticle<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "bookmarkedArticle",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.bookmarkedArticle[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetBookmarkArticleSuccess<T> = Selection<T, Objects.SetBookmarkArticleSuccess>
}

extension Objects {
  struct SetDeviceTokenError {
    let __typename: TypeName = .setDeviceTokenError
    let errorCodes: [String: [Enums.SetDeviceTokenErrorCode]]

    enum TypeName: String, Codable {
      case setDeviceTokenError = "SetDeviceTokenError"
    }
  }
}

extension Objects.SetDeviceTokenError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetDeviceTokenErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SetDeviceTokenError {
  func errorCodes() throws -> [Enums.SetDeviceTokenErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetDeviceTokenError<T> = Selection<T, Objects.SetDeviceTokenError>
}

extension Objects {
  struct SetDeviceTokenSuccess {
    let __typename: TypeName = .setDeviceTokenSuccess
    let deviceToken: [String: Objects.DeviceToken]

    enum TypeName: String, Codable {
      case setDeviceTokenSuccess = "SetDeviceTokenSuccess"
    }
  }
}

extension Objects.SetDeviceTokenSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "deviceToken":
        if let value = try container.decode(Objects.DeviceToken?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    deviceToken = map["deviceToken"]
  }
}

extension Fields where TypeLock == Objects.SetDeviceTokenSuccess {
  func deviceToken<Type>(selection: Selection<Type, Objects.DeviceToken>) throws -> Type {
    let field = GraphQLField.composite(
      name: "deviceToken",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.deviceToken[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetDeviceTokenSuccess<T> = Selection<T, Objects.SetDeviceTokenSuccess>
}

extension Objects {
  struct SetFollowError {
    let __typename: TypeName = .setFollowError
    let errorCodes: [String: [Enums.SetFollowErrorCode]]

    enum TypeName: String, Codable {
      case setFollowError = "SetFollowError"
    }
  }
}

extension Objects.SetFollowError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetFollowErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SetFollowError {
  func errorCodes() throws -> [Enums.SetFollowErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetFollowError<T> = Selection<T, Objects.SetFollowError>
}

extension Objects {
  struct SetFollowSuccess {
    let __typename: TypeName = .setFollowSuccess
    let updatedUser: [String: Objects.User]

    enum TypeName: String, Codable {
      case setFollowSuccess = "SetFollowSuccess"
    }
  }
}

extension Objects.SetFollowSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "updatedUser":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    updatedUser = map["updatedUser"]
  }
}

extension Fields where TypeLock == Objects.SetFollowSuccess {
  func updatedUser<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updatedUser",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedUser[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetFollowSuccess<T> = Selection<T, Objects.SetFollowSuccess>
}

extension Objects {
  struct SetLabelsError {
    let __typename: TypeName = .setLabelsError
    let errorCodes: [String: [Enums.SetLabelsErrorCode]]

    enum TypeName: String, Codable {
      case setLabelsError = "SetLabelsError"
    }
  }
}

extension Objects.SetLabelsError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetLabelsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SetLabelsError {
  func errorCodes() throws -> [Enums.SetLabelsErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetLabelsError<T> = Selection<T, Objects.SetLabelsError>
}

extension Objects {
  struct SetLabelsSuccess {
    let __typename: TypeName = .setLabelsSuccess
    let labels: [String: [Objects.Label]]

    enum TypeName: String, Codable {
      case setLabelsSuccess = "SetLabelsSuccess"
    }
  }
}

extension Objects.SetLabelsSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "labels":
        if let value = try container.decode([Objects.Label]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    labels = map["labels"]
  }
}

extension Fields where TypeLock == Objects.SetLabelsSuccess {
  func labels<Type>(selection: Selection<Type, [Objects.Label]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "labels",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.labels[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetLabelsSuccess<T> = Selection<T, Objects.SetLabelsSuccess>
}

extension Objects {
  struct SetShareArticleError {
    let __typename: TypeName = .setShareArticleError
    let errorCodes: [String: [Enums.SetShareArticleErrorCode]]

    enum TypeName: String, Codable {
      case setShareArticleError = "SetShareArticleError"
    }
  }
}

extension Objects.SetShareArticleError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetShareArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SetShareArticleError {
  func errorCodes() throws -> [Enums.SetShareArticleErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetShareArticleError<T> = Selection<T, Objects.SetShareArticleError>
}

extension Objects {
  struct SetShareArticleSuccess {
    let __typename: TypeName = .setShareArticleSuccess
    let updatedArticle: [String: Objects.Article]
    let updatedFeedArticle: [String: Objects.FeedArticle]
    let updatedFeedArticleId: [String: String]

    enum TypeName: String, Codable {
      case setShareArticleSuccess = "SetShareArticleSuccess"
    }
  }
}

extension Objects.SetShareArticleSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "updatedArticle":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedFeedArticle":
        if let value = try container.decode(Objects.FeedArticle?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedFeedArticleId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    updatedArticle = map["updatedArticle"]
    updatedFeedArticle = map["updatedFeedArticle"]
    updatedFeedArticleId = map["updatedFeedArticleId"]
  }
}

extension Fields where TypeLock == Objects.SetShareArticleSuccess {
  func updatedArticle<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updatedArticle",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedArticle[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func updatedFeedArticle<Type>(selection: Selection<Type, Objects.FeedArticle?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updatedFeedArticle",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.updatedFeedArticle[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func updatedFeedArticleId() throws -> String? {
    let field = GraphQLField.leaf(
      name: "updatedFeedArticleId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.updatedFeedArticleId[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetShareArticleSuccess<T> = Selection<T, Objects.SetShareArticleSuccess>
}

extension Objects {
  struct SetShareHighlightError {
    let __typename: TypeName = .setShareHighlightError
    let errorCodes: [String: [Enums.SetShareHighlightErrorCode]]

    enum TypeName: String, Codable {
      case setShareHighlightError = "SetShareHighlightError"
    }
  }
}

extension Objects.SetShareHighlightError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetShareHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SetShareHighlightError {
  func errorCodes() throws -> [Enums.SetShareHighlightErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetShareHighlightError<T> = Selection<T, Objects.SetShareHighlightError>
}

extension Objects {
  struct SetShareHighlightSuccess {
    let __typename: TypeName = .setShareHighlightSuccess
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case setShareHighlightSuccess = "SetShareHighlightSuccess"
    }
  }
}

extension Objects.SetShareHighlightSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlight = map["highlight"]
  }
}

extension Fields where TypeLock == Objects.SetShareHighlightSuccess {
  func highlight<Type>(selection: Selection<Type, Objects.Highlight>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlight",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetShareHighlightSuccess<T> = Selection<T, Objects.SetShareHighlightSuccess>
}

extension Objects {
  struct SetUserPersonalizationError {
    let __typename: TypeName = .setUserPersonalizationError
    let errorCodes: [String: [Enums.SetUserPersonalizationErrorCode]]

    enum TypeName: String, Codable {
      case setUserPersonalizationError = "SetUserPersonalizationError"
    }
  }
}

extension Objects.SetUserPersonalizationError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetUserPersonalizationErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SetUserPersonalizationError {
  func errorCodes() throws -> [Enums.SetUserPersonalizationErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetUserPersonalizationError<T> = Selection<T, Objects.SetUserPersonalizationError>
}

extension Objects {
  struct SetUserPersonalizationSuccess {
    let __typename: TypeName = .setUserPersonalizationSuccess
    let updatedUserPersonalization: [String: Objects.UserPersonalization]

    enum TypeName: String, Codable {
      case setUserPersonalizationSuccess = "SetUserPersonalizationSuccess"
    }
  }
}

extension Objects.SetUserPersonalizationSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "updatedUserPersonalization":
        if let value = try container.decode(Objects.UserPersonalization?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    updatedUserPersonalization = map["updatedUserPersonalization"]
  }
}

extension Fields where TypeLock == Objects.SetUserPersonalizationSuccess {
  func updatedUserPersonalization<Type>(selection: Selection<Type, Objects.UserPersonalization>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updatedUserPersonalization",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedUserPersonalization[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetUserPersonalizationSuccess<T> = Selection<T, Objects.SetUserPersonalizationSuccess>
}

extension Objects {
  struct SetWebhookError {
    let __typename: TypeName = .setWebhookError
    let errorCodes: [String: [Enums.SetWebhookErrorCode]]

    enum TypeName: String, Codable {
      case setWebhookError = "SetWebhookError"
    }
  }
}

extension Objects.SetWebhookError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetWebhookErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SetWebhookError {
  func errorCodes() throws -> [Enums.SetWebhookErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetWebhookError<T> = Selection<T, Objects.SetWebhookError>
}

extension Objects {
  struct SetWebhookSuccess {
    let __typename: TypeName = .setWebhookSuccess
    let webhook: [String: Objects.Webhook]

    enum TypeName: String, Codable {
      case setWebhookSuccess = "SetWebhookSuccess"
    }
  }
}

extension Objects.SetWebhookSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "webhook":
        if let value = try container.decode(Objects.Webhook?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    webhook = map["webhook"]
  }
}

extension Fields where TypeLock == Objects.SetWebhookSuccess {
  func webhook<Type>(selection: Selection<Type, Objects.Webhook>) throws -> Type {
    let field = GraphQLField.composite(
      name: "webhook",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.webhook[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetWebhookSuccess<T> = Selection<T, Objects.SetWebhookSuccess>
}

extension Objects {
  struct ShareStats {
    let __typename: TypeName = .shareStats
    let readDuration: [String: Int]
    let saveCount: [String: Int]
    let viewCount: [String: Int]

    enum TypeName: String, Codable {
      case shareStats = "ShareStats"
    }
  }
}

extension Objects.ShareStats: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "readDuration":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "saveCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "viewCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    readDuration = map["readDuration"]
    saveCount = map["saveCount"]
    viewCount = map["viewCount"]
  }
}

extension Fields where TypeLock == Objects.ShareStats {
  func readDuration() throws -> Int {
    let field = GraphQLField.leaf(
      name: "readDuration",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.readDuration[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Int.mockValue
    }
  }

  func saveCount() throws -> Int {
    let field = GraphQLField.leaf(
      name: "saveCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.saveCount[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Int.mockValue
    }
  }

  func viewCount() throws -> Int {
    let field = GraphQLField.leaf(
      name: "viewCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.viewCount[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Int.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ShareStats<T> = Selection<T, Objects.ShareStats>
}

extension Objects {
  struct SharedArticleError {
    let __typename: TypeName = .sharedArticleError
    let errorCodes: [String: [Enums.SharedArticleErrorCode]]

    enum TypeName: String, Codable {
      case sharedArticleError = "SharedArticleError"
    }
  }
}

extension Objects.SharedArticleError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SharedArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SharedArticleError {
  func errorCodes() throws -> [Enums.SharedArticleErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SharedArticleError<T> = Selection<T, Objects.SharedArticleError>
}

extension Objects {
  struct SharedArticleSuccess {
    let __typename: TypeName = .sharedArticleSuccess
    let article: [String: Objects.Article]

    enum TypeName: String, Codable {
      case sharedArticleSuccess = "SharedArticleSuccess"
    }
  }
}

extension Objects.SharedArticleSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "article":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    article = map["article"]
  }
}

extension Fields where TypeLock == Objects.SharedArticleSuccess {
  func article<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "article",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.article[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SharedArticleSuccess<T> = Selection<T, Objects.SharedArticleSuccess>
}

extension Objects {
  struct SubscribeError {
    let __typename: TypeName = .subscribeError
    let errorCodes: [String: [Enums.SubscribeErrorCode]]

    enum TypeName: String, Codable {
      case subscribeError = "SubscribeError"
    }
  }
}

extension Objects.SubscribeError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SubscribeErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SubscribeError {
  func errorCodes() throws -> [Enums.SubscribeErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SubscribeError<T> = Selection<T, Objects.SubscribeError>
}

extension Objects {
  struct SubscribeSuccess {
    let __typename: TypeName = .subscribeSuccess
    let subscriptions: [String: [Objects.Subscription]]

    enum TypeName: String, Codable {
      case subscribeSuccess = "SubscribeSuccess"
    }
  }
}

extension Objects.SubscribeSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "subscriptions":
        if let value = try container.decode([Objects.Subscription]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    subscriptions = map["subscriptions"]
  }
}

extension Fields where TypeLock == Objects.SubscribeSuccess {
  func subscriptions<Type>(selection: Selection<Type, [Objects.Subscription]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "subscriptions",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.subscriptions[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SubscribeSuccess<T> = Selection<T, Objects.SubscribeSuccess>
}

extension Objects {
  struct Subscription {
    let __typename: TypeName = .subscription
    let createdAt: [String: DateTime]
    let description: [String: String]
    let id: [String: String]
    let name: [String: String]
    let newsletterEmail: [String: String]
    let status: [String: Enums.SubscriptionStatus]
    let unsubscribeHttpUrl: [String: String]
    let unsubscribeMailTo: [String: String]
    let updatedAt: [String: DateTime]
    let url: [String: String]

    enum TypeName: String, Codable {
      case subscription = "Subscription"
    }
  }
}

extension Objects.Subscription: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "description":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "name":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "newsletterEmail":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "status":
        if let value = try container.decode(Enums.SubscriptionStatus?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "unsubscribeHttpUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "unsubscribeMailTo":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "url":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    createdAt = map["createdAt"]
    description = map["description"]
    id = map["id"]
    name = map["name"]
    newsletterEmail = map["newsletterEmail"]
    status = map["status"]
    unsubscribeHttpUrl = map["unsubscribeHttpUrl"]
    unsubscribeMailTo = map["unsubscribeMailTo"]
    updatedAt = map["updatedAt"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.Subscription {
  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func description() throws -> String? {
    let field = GraphQLField.leaf(
      name: "description",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.description[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func name() throws -> String {
    let field = GraphQLField.leaf(
      name: "name",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.name[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func newsletterEmail() throws -> String {
    let field = GraphQLField.leaf(
      name: "newsletterEmail",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.newsletterEmail[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func status() throws -> Enums.SubscriptionStatus {
    let field = GraphQLField.leaf(
      name: "status",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.status[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Enums.SubscriptionStatus.allCases.first!
    }
  }

  func unsubscribeHttpUrl() throws -> String? {
    let field = GraphQLField.leaf(
      name: "unsubscribeHttpUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.unsubscribeHttpUrl[field.alias!]
    case .mocking:
      return nil
    }
  }

  func unsubscribeMailTo() throws -> String? {
    let field = GraphQLField.leaf(
      name: "unsubscribeMailTo",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.unsubscribeMailTo[field.alias!]
    case .mocking:
      return nil
    }
  }

  func updatedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func url() throws -> String? {
    let field = GraphQLField.leaf(
      name: "url",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.url[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Subscription<T> = Selection<T, Objects.Subscription>
}

extension Objects {
  struct SubscriptionsError {
    let __typename: TypeName = .subscriptionsError
    let errorCodes: [String: [Enums.SubscriptionsErrorCode]]

    enum TypeName: String, Codable {
      case subscriptionsError = "SubscriptionsError"
    }
  }
}

extension Objects.SubscriptionsError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SubscriptionsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.SubscriptionsError {
  func errorCodes() throws -> [Enums.SubscriptionsErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SubscriptionsError<T> = Selection<T, Objects.SubscriptionsError>
}

extension Objects {
  struct SubscriptionsSuccess {
    let __typename: TypeName = .subscriptionsSuccess
    let subscriptions: [String: [Objects.Subscription]]

    enum TypeName: String, Codable {
      case subscriptionsSuccess = "SubscriptionsSuccess"
    }
  }
}

extension Objects.SubscriptionsSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "subscriptions":
        if let value = try container.decode([Objects.Subscription]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    subscriptions = map["subscriptions"]
  }
}

extension Fields where TypeLock == Objects.SubscriptionsSuccess {
  func subscriptions<Type>(selection: Selection<Type, [Objects.Subscription]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "subscriptions",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.subscriptions[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SubscriptionsSuccess<T> = Selection<T, Objects.SubscriptionsSuccess>
}

extension Objects {
  struct SyncUpdatedItemEdge {
    let __typename: TypeName = .syncUpdatedItemEdge
    let cursor: [String: String]
    let itemId: [String: String]
    let node: [String: Objects.SearchItem]
    let updateReason: [String: Enums.UpdateReason]

    enum TypeName: String, Codable {
      case syncUpdatedItemEdge = "SyncUpdatedItemEdge"
    }
  }
}

extension Objects.SyncUpdatedItemEdge: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "cursor":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "itemId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "node":
        if let value = try container.decode(Objects.SearchItem?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updateReason":
        if let value = try container.decode(Enums.UpdateReason?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    cursor = map["cursor"]
    itemId = map["itemId"]
    node = map["node"]
    updateReason = map["updateReason"]
  }
}

extension Fields where TypeLock == Objects.SyncUpdatedItemEdge {
  func cursor() throws -> String {
    let field = GraphQLField.leaf(
      name: "cursor",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.cursor[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func itemId() throws -> String {
    let field = GraphQLField.leaf(
      name: "itemID",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.itemId[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func node<Type>(selection: Selection<Type, Objects.SearchItem?>) throws -> Type {
    let field = GraphQLField.composite(
      name: "node",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      return try selection.decode(data: data.node[field.alias!])
    case .mocking:
      return selection.mock()
    }
  }

  func updateReason() throws -> Enums.UpdateReason {
    let field = GraphQLField.leaf(
      name: "updateReason",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updateReason[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Enums.UpdateReason.allCases.first!
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SyncUpdatedItemEdge<T> = Selection<T, Objects.SyncUpdatedItemEdge>
}

extension Objects {
  struct TypeaheadSearchError {
    let __typename: TypeName = .typeaheadSearchError
    let errorCodes: [String: [Enums.TypeaheadSearchErrorCode]]

    enum TypeName: String, Codable {
      case typeaheadSearchError = "TypeaheadSearchError"
    }
  }
}

extension Objects.TypeaheadSearchError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.TypeaheadSearchErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.TypeaheadSearchError {
  func errorCodes() throws -> [Enums.TypeaheadSearchErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias TypeaheadSearchError<T> = Selection<T, Objects.TypeaheadSearchError>
}

extension Objects {
  struct TypeaheadSearchItem {
    let __typename: TypeName = .typeaheadSearchItem
    let id: [String: String]
    let siteName: [String: String]
    let slug: [String: String]
    let title: [String: String]

    enum TypeName: String, Codable {
      case typeaheadSearchItem = "TypeaheadSearchItem"
    }
  }
}

extension Objects.TypeaheadSearchItem: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "siteName":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "slug":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "title":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    id = map["id"]
    siteName = map["siteName"]
    slug = map["slug"]
    title = map["title"]
  }
}

extension Fields where TypeLock == Objects.TypeaheadSearchItem {
  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func siteName() throws -> String? {
    let field = GraphQLField.leaf(
      name: "siteName",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.siteName[field.alias!]
    case .mocking:
      return nil
    }
  }

  func slug() throws -> String {
    let field = GraphQLField.leaf(
      name: "slug",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.slug[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func title() throws -> String {
    let field = GraphQLField.leaf(
      name: "title",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.title[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias TypeaheadSearchItem<T> = Selection<T, Objects.TypeaheadSearchItem>
}

extension Objects {
  struct TypeaheadSearchSuccess {
    let __typename: TypeName = .typeaheadSearchSuccess
    let items: [String: [Objects.TypeaheadSearchItem]]

    enum TypeName: String, Codable {
      case typeaheadSearchSuccess = "TypeaheadSearchSuccess"
    }
  }
}

extension Objects.TypeaheadSearchSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "items":
        if let value = try container.decode([Objects.TypeaheadSearchItem]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    items = map["items"]
  }
}

extension Fields where TypeLock == Objects.TypeaheadSearchSuccess {
  func items<Type>(selection: Selection<Type, [Objects.TypeaheadSearchItem]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "items",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.items[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias TypeaheadSearchSuccess<T> = Selection<T, Objects.TypeaheadSearchSuccess>
}

extension Objects {
  struct UnsubscribeError {
    let __typename: TypeName = .unsubscribeError
    let errorCodes: [String: [Enums.UnsubscribeErrorCode]]

    enum TypeName: String, Codable {
      case unsubscribeError = "UnsubscribeError"
    }
  }
}

extension Objects.UnsubscribeError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UnsubscribeErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UnsubscribeError {
  func errorCodes() throws -> [Enums.UnsubscribeErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UnsubscribeError<T> = Selection<T, Objects.UnsubscribeError>
}

extension Objects {
  struct UnsubscribeSuccess {
    let __typename: TypeName = .unsubscribeSuccess
    let subscription: [String: Objects.Subscription]

    enum TypeName: String, Codable {
      case unsubscribeSuccess = "UnsubscribeSuccess"
    }
  }
}

extension Objects.UnsubscribeSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "subscription":
        if let value = try container.decode(Objects.Subscription?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    subscription = map["subscription"]
  }
}

extension Fields where TypeLock == Objects.UnsubscribeSuccess {
  func subscription<Type>(selection: Selection<Type, Objects.Subscription>) throws -> Type {
    let field = GraphQLField.composite(
      name: "subscription",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.subscription[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UnsubscribeSuccess<T> = Selection<T, Objects.UnsubscribeSuccess>
}

extension Objects {
  struct UpdateHighlightError {
    let __typename: TypeName = .updateHighlightError
    let errorCodes: [String: [Enums.UpdateHighlightErrorCode]]

    enum TypeName: String, Codable {
      case updateHighlightError = "UpdateHighlightError"
    }
  }
}

extension Objects.UpdateHighlightError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdateHighlightError {
  func errorCodes() throws -> [Enums.UpdateHighlightErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateHighlightError<T> = Selection<T, Objects.UpdateHighlightError>
}

extension Objects {
  struct UpdateHighlightReplyError {
    let __typename: TypeName = .updateHighlightReplyError
    let errorCodes: [String: [Enums.UpdateHighlightReplyErrorCode]]

    enum TypeName: String, Codable {
      case updateHighlightReplyError = "UpdateHighlightReplyError"
    }
  }
}

extension Objects.UpdateHighlightReplyError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateHighlightReplyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdateHighlightReplyError {
  func errorCodes() throws -> [Enums.UpdateHighlightReplyErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateHighlightReplyError<T> = Selection<T, Objects.UpdateHighlightReplyError>
}

extension Objects {
  struct UpdateHighlightReplySuccess {
    let __typename: TypeName = .updateHighlightReplySuccess
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case updateHighlightReplySuccess = "UpdateHighlightReplySuccess"
    }
  }
}

extension Objects.UpdateHighlightReplySuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlightReply":
        if let value = try container.decode(Objects.HighlightReply?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlightReply = map["highlightReply"]
  }
}

extension Fields where TypeLock == Objects.UpdateHighlightReplySuccess {
  func highlightReply<Type>(selection: Selection<Type, Objects.HighlightReply>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlightReply",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlightReply[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateHighlightReplySuccess<T> = Selection<T, Objects.UpdateHighlightReplySuccess>
}

extension Objects {
  struct UpdateHighlightSuccess {
    let __typename: TypeName = .updateHighlightSuccess
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case updateHighlightSuccess = "UpdateHighlightSuccess"
    }
  }
}

extension Objects.UpdateHighlightSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    highlight = map["highlight"]
  }
}

extension Fields where TypeLock == Objects.UpdateHighlightSuccess {
  func highlight<Type>(selection: Selection<Type, Objects.Highlight>) throws -> Type {
    let field = GraphQLField.composite(
      name: "highlight",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.highlight[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateHighlightSuccess<T> = Selection<T, Objects.UpdateHighlightSuccess>
}

extension Objects {
  struct UpdateLabelError {
    let __typename: TypeName = .updateLabelError
    let errorCodes: [String: [Enums.UpdateLabelErrorCode]]

    enum TypeName: String, Codable {
      case updateLabelError = "UpdateLabelError"
    }
  }
}

extension Objects.UpdateLabelError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateLabelErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdateLabelError {
  func errorCodes() throws -> [Enums.UpdateLabelErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateLabelError<T> = Selection<T, Objects.UpdateLabelError>
}

extension Objects {
  struct UpdateLabelSuccess {
    let __typename: TypeName = .updateLabelSuccess
    let label: [String: Objects.Label]

    enum TypeName: String, Codable {
      case updateLabelSuccess = "UpdateLabelSuccess"
    }
  }
}

extension Objects.UpdateLabelSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "label":
        if let value = try container.decode(Objects.Label?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    label = map["label"]
  }
}

extension Fields where TypeLock == Objects.UpdateLabelSuccess {
  func label<Type>(selection: Selection<Type, Objects.Label>) throws -> Type {
    let field = GraphQLField.composite(
      name: "label",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.label[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateLabelSuccess<T> = Selection<T, Objects.UpdateLabelSuccess>
}

extension Objects {
  struct UpdateLinkShareInfoError {
    let __typename: TypeName = .updateLinkShareInfoError
    let errorCodes: [String: [Enums.UpdateLinkShareInfoErrorCode]]

    enum TypeName: String, Codable {
      case updateLinkShareInfoError = "UpdateLinkShareInfoError"
    }
  }
}

extension Objects.UpdateLinkShareInfoError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateLinkShareInfoErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdateLinkShareInfoError {
  func errorCodes() throws -> [Enums.UpdateLinkShareInfoErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateLinkShareInfoError<T> = Selection<T, Objects.UpdateLinkShareInfoError>
}

extension Objects {
  struct UpdateLinkShareInfoSuccess {
    let __typename: TypeName = .updateLinkShareInfoSuccess
    let message: [String: String]

    enum TypeName: String, Codable {
      case updateLinkShareInfoSuccess = "UpdateLinkShareInfoSuccess"
    }
  }
}

extension Objects.UpdateLinkShareInfoSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    message = map["message"]
  }
}

extension Fields where TypeLock == Objects.UpdateLinkShareInfoSuccess {
  func message() throws -> String {
    let field = GraphQLField.leaf(
      name: "message",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.message[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateLinkShareInfoSuccess<T> = Selection<T, Objects.UpdateLinkShareInfoSuccess>
}

extension Objects {
  struct UpdatePageError {
    let __typename: TypeName = .updatePageError
    let errorCodes: [String: [Enums.UpdatePageErrorCode]]

    enum TypeName: String, Codable {
      case updatePageError = "UpdatePageError"
    }
  }
}

extension Objects.UpdatePageError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdatePageErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdatePageError {
  func errorCodes() throws -> [Enums.UpdatePageErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdatePageError<T> = Selection<T, Objects.UpdatePageError>
}

extension Objects {
  struct UpdatePageSuccess {
    let __typename: TypeName = .updatePageSuccess
    let updatedPage: [String: Objects.Article]

    enum TypeName: String, Codable {
      case updatePageSuccess = "UpdatePageSuccess"
    }
  }
}

extension Objects.UpdatePageSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "updatedPage":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    updatedPage = map["updatedPage"]
  }
}

extension Fields where TypeLock == Objects.UpdatePageSuccess {
  func updatedPage<Type>(selection: Selection<Type, Objects.Article>) throws -> Type {
    let field = GraphQLField.composite(
      name: "updatedPage",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedPage[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdatePageSuccess<T> = Selection<T, Objects.UpdatePageSuccess>
}

extension Objects {
  struct UpdateReminderError {
    let __typename: TypeName = .updateReminderError
    let errorCodes: [String: [Enums.UpdateReminderErrorCode]]

    enum TypeName: String, Codable {
      case updateReminderError = "UpdateReminderError"
    }
  }
}

extension Objects.UpdateReminderError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateReminderErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdateReminderError {
  func errorCodes() throws -> [Enums.UpdateReminderErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateReminderError<T> = Selection<T, Objects.UpdateReminderError>
}

extension Objects {
  struct UpdateReminderSuccess {
    let __typename: TypeName = .updateReminderSuccess
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case updateReminderSuccess = "UpdateReminderSuccess"
    }
  }
}

extension Objects.UpdateReminderSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "reminder":
        if let value = try container.decode(Objects.Reminder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    reminder = map["reminder"]
  }
}

extension Fields where TypeLock == Objects.UpdateReminderSuccess {
  func reminder<Type>(selection: Selection<Type, Objects.Reminder>) throws -> Type {
    let field = GraphQLField.composite(
      name: "reminder",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.reminder[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateReminderSuccess<T> = Selection<T, Objects.UpdateReminderSuccess>
}

extension Objects {
  struct UpdateSharedCommentError {
    let __typename: TypeName = .updateSharedCommentError
    let errorCodes: [String: [Enums.UpdateSharedCommentErrorCode]]

    enum TypeName: String, Codable {
      case updateSharedCommentError = "UpdateSharedCommentError"
    }
  }
}

extension Objects.UpdateSharedCommentError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateSharedCommentErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdateSharedCommentError {
  func errorCodes() throws -> [Enums.UpdateSharedCommentErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateSharedCommentError<T> = Selection<T, Objects.UpdateSharedCommentError>
}

extension Objects {
  struct UpdateSharedCommentSuccess {
    let __typename: TypeName = .updateSharedCommentSuccess
    let articleId: [String: String]
    let sharedComment: [String: String]

    enum TypeName: String, Codable {
      case updateSharedCommentSuccess = "UpdateSharedCommentSuccess"
    }
  }
}

extension Objects.UpdateSharedCommentSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "articleId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedComment":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    articleId = map["articleId"]
    sharedComment = map["sharedComment"]
  }
}

extension Fields where TypeLock == Objects.UpdateSharedCommentSuccess {
  func articleId() throws -> String {
    let field = GraphQLField.leaf(
      name: "articleID",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.articleId[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func sharedComment() throws -> String {
    let field = GraphQLField.leaf(
      name: "sharedComment",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.sharedComment[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateSharedCommentSuccess<T> = Selection<T, Objects.UpdateSharedCommentSuccess>
}

extension Objects {
  struct UpdateUserError {
    let __typename: TypeName = .updateUserError
    let errorCodes: [String: [Enums.UpdateUserErrorCode]]

    enum TypeName: String, Codable {
      case updateUserError = "UpdateUserError"
    }
  }
}

extension Objects.UpdateUserError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateUserErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdateUserError {
  func errorCodes() throws -> [Enums.UpdateUserErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateUserError<T> = Selection<T, Objects.UpdateUserError>
}

extension Objects {
  struct UpdateUserProfileError {
    let __typename: TypeName = .updateUserProfileError
    let errorCodes: [String: [Enums.UpdateUserProfileErrorCode]]

    enum TypeName: String, Codable {
      case updateUserProfileError = "UpdateUserProfileError"
    }
  }
}

extension Objects.UpdateUserProfileError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateUserProfileErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdateUserProfileError {
  func errorCodes() throws -> [Enums.UpdateUserProfileErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateUserProfileError<T> = Selection<T, Objects.UpdateUserProfileError>
}

extension Objects {
  struct UpdateUserProfileSuccess {
    let __typename: TypeName = .updateUserProfileSuccess
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case updateUserProfileSuccess = "UpdateUserProfileSuccess"
    }
  }
}

extension Objects.UpdateUserProfileSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    user = map["user"]
  }
}

extension Fields where TypeLock == Objects.UpdateUserProfileSuccess {
  func user<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateUserProfileSuccess<T> = Selection<T, Objects.UpdateUserProfileSuccess>
}

extension Objects {
  struct UpdateUserSuccess {
    let __typename: TypeName = .updateUserSuccess
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case updateUserSuccess = "UpdateUserSuccess"
    }
  }
}

extension Objects.UpdateUserSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    user = map["user"]
  }
}

extension Fields where TypeLock == Objects.UpdateUserSuccess {
  func user<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateUserSuccess<T> = Selection<T, Objects.UpdateUserSuccess>
}

extension Objects {
  struct UpdatesSinceError {
    let __typename: TypeName = .updatesSinceError
    let errorCodes: [String: [Enums.UpdatesSinceErrorCode]]

    enum TypeName: String, Codable {
      case updatesSinceError = "UpdatesSinceError"
    }
  }
}

extension Objects.UpdatesSinceError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdatesSinceErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UpdatesSinceError {
  func errorCodes() throws -> [Enums.UpdatesSinceErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdatesSinceError<T> = Selection<T, Objects.UpdatesSinceError>
}

extension Objects {
  struct UpdatesSinceSuccess {
    let __typename: TypeName = .updatesSinceSuccess
    let edges: [String: [Objects.SyncUpdatedItemEdge]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case updatesSinceSuccess = "UpdatesSinceSuccess"
    }
  }
}

extension Objects.UpdatesSinceSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "edges":
        if let value = try container.decode([Objects.SyncUpdatedItemEdge]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageInfo":
        if let value = try container.decode(Objects.PageInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    edges = map["edges"]
    pageInfo = map["pageInfo"]
  }
}

extension Fields where TypeLock == Objects.UpdatesSinceSuccess {
  func edges<Type>(selection: Selection<Type, [Objects.SyncUpdatedItemEdge]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "edges",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.edges[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func pageInfo<Type>(selection: Selection<Type, Objects.PageInfo>) throws -> Type {
    let field = GraphQLField.composite(
      name: "pageInfo",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.pageInfo[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdatesSinceSuccess<T> = Selection<T, Objects.UpdatesSinceSuccess>
}

extension Objects {
  struct UploadFileRequestError {
    let __typename: TypeName = .uploadFileRequestError
    let errorCodes: [String: [Enums.UploadFileRequestErrorCode]]

    enum TypeName: String, Codable {
      case uploadFileRequestError = "UploadFileRequestError"
    }
  }
}

extension Objects.UploadFileRequestError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UploadFileRequestErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UploadFileRequestError {
  func errorCodes() throws -> [Enums.UploadFileRequestErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UploadFileRequestError<T> = Selection<T, Objects.UploadFileRequestError>
}

extension Objects {
  struct UploadFileRequestSuccess {
    let __typename: TypeName = .uploadFileRequestSuccess
    let createdPageId: [String: String]
    let id: [String: String]
    let uploadFileId: [String: String]
    let uploadSignedUrl: [String: String]

    enum TypeName: String, Codable {
      case uploadFileRequestSuccess = "UploadFileRequestSuccess"
    }
  }
}

extension Objects.UploadFileRequestSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "createdPageId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "uploadFileId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "uploadSignedUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    createdPageId = map["createdPageId"]
    id = map["id"]
    uploadFileId = map["uploadFileId"]
    uploadSignedUrl = map["uploadSignedUrl"]
  }
}

extension Fields where TypeLock == Objects.UploadFileRequestSuccess {
  func createdPageId() throws -> String? {
    let field = GraphQLField.leaf(
      name: "createdPageId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.createdPageId[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func uploadFileId() throws -> String? {
    let field = GraphQLField.leaf(
      name: "uploadFileId",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.uploadFileId[field.alias!]
    case .mocking:
      return nil
    }
  }

  func uploadSignedUrl() throws -> String? {
    let field = GraphQLField.leaf(
      name: "uploadSignedUrl",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.uploadSignedUrl[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UploadFileRequestSuccess<T> = Selection<T, Objects.UploadFileRequestSuccess>
}

extension Objects {
  struct User {
    let __typename: TypeName = .user
    let followersCount: [String: Int]
    let friendsCount: [String: Int]
    let id: [String: String]
    let isFriend: [String: Bool]
    let isFullUser: [String: Bool]
    let name: [String: String]
    let picture: [String: String]
    let profile: [String: Objects.Profile]
    let sharedArticles: [String: [Objects.FeedArticle]]
    let sharedArticlesCount: [String: Int]
    let sharedHighlightsCount: [String: Int]
    let sharedNotesCount: [String: Int]
    let viewerIsFollowing: [String: Bool]

    enum TypeName: String, Codable {
      case user = "User"
    }
  }
}

extension Objects.User: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "followersCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "friendsCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "isFriend":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "isFullUser":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "name":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "picture":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "profile":
        if let value = try container.decode(Objects.Profile?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedArticles":
        if let value = try container.decode([Objects.FeedArticle]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedArticlesCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedHighlightsCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedNotesCount":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "viewerIsFollowing":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    followersCount = map["followersCount"]
    friendsCount = map["friendsCount"]
    id = map["id"]
    isFriend = map["isFriend"]
    isFullUser = map["isFullUser"]
    name = map["name"]
    picture = map["picture"]
    profile = map["profile"]
    sharedArticles = map["sharedArticles"]
    sharedArticlesCount = map["sharedArticlesCount"]
    sharedHighlightsCount = map["sharedHighlightsCount"]
    sharedNotesCount = map["sharedNotesCount"]
    viewerIsFollowing = map["viewerIsFollowing"]
  }
}

extension Fields where TypeLock == Objects.User {
  func followersCount() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "followersCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.followersCount[field.alias!]
    case .mocking:
      return nil
    }
  }

  func friendsCount() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "friendsCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.friendsCount[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  @available(*, deprecated, message: "isFriend has been replaced with viewerIsFollowing")
  func isFriend() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "isFriend",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.isFriend[field.alias!]
    case .mocking:
      return nil
    }
  }

  func isFullUser() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "isFullUser",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.isFullUser[field.alias!]
    case .mocking:
      return nil
    }
  }

  func name() throws -> String {
    let field = GraphQLField.leaf(
      name: "name",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.name[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func picture() throws -> String? {
    let field = GraphQLField.leaf(
      name: "picture",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.picture[field.alias!]
    case .mocking:
      return nil
    }
  }

  func profile<Type>(selection: Selection<Type, Objects.Profile>) throws -> Type {
    let field = GraphQLField.composite(
      name: "profile",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.profile[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func sharedArticles<Type>(selection: Selection<Type, [Objects.FeedArticle]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "sharedArticles",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.sharedArticles[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func sharedArticlesCount() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "sharedArticlesCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.sharedArticlesCount[field.alias!]
    case .mocking:
      return nil
    }
  }

  func sharedHighlightsCount() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "sharedHighlightsCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.sharedHighlightsCount[field.alias!]
    case .mocking:
      return nil
    }
  }

  func sharedNotesCount() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "sharedNotesCount",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.sharedNotesCount[field.alias!]
    case .mocking:
      return nil
    }
  }

  func viewerIsFollowing() throws -> Bool? {
    let field = GraphQLField.leaf(
      name: "viewerIsFollowing",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.viewerIsFollowing[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias User<T> = Selection<T, Objects.User>
}

extension Objects {
  struct UserError {
    let __typename: TypeName = .userError
    let errorCodes: [String: [Enums.UserErrorCode]]

    enum TypeName: String, Codable {
      case userError = "UserError"
    }
  }
}

extension Objects.UserError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UserErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UserError {
  func errorCodes() throws -> [Enums.UserErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UserError<T> = Selection<T, Objects.UserError>
}

extension Objects {
  struct UserPersonalization {
    let __typename: TypeName = .userPersonalization
    let fontFamily: [String: String]
    let fontSize: [String: Int]
    let id: [String: String]
    let libraryLayoutType: [String: String]
    let librarySortOrder: [String: Enums.SortOrder]
    let margin: [String: Int]
    let theme: [String: String]

    enum TypeName: String, Codable {
      case userPersonalization = "UserPersonalization"
    }
  }
}

extension Objects.UserPersonalization: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "fontFamily":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "fontSize":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "libraryLayoutType":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "librarySortOrder":
        if let value = try container.decode(Enums.SortOrder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "margin":
        if let value = try container.decode(Int?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "theme":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    fontFamily = map["fontFamily"]
    fontSize = map["fontSize"]
    id = map["id"]
    libraryLayoutType = map["libraryLayoutType"]
    librarySortOrder = map["librarySortOrder"]
    margin = map["margin"]
    theme = map["theme"]
  }
}

extension Fields where TypeLock == Objects.UserPersonalization {
  func fontFamily() throws -> String? {
    let field = GraphQLField.leaf(
      name: "fontFamily",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.fontFamily[field.alias!]
    case .mocking:
      return nil
    }
  }

  func fontSize() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "fontSize",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.fontSize[field.alias!]
    case .mocking:
      return nil
    }
  }

  func id() throws -> String? {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.id[field.alias!]
    case .mocking:
      return nil
    }
  }

  func libraryLayoutType() throws -> String? {
    let field = GraphQLField.leaf(
      name: "libraryLayoutType",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.libraryLayoutType[field.alias!]
    case .mocking:
      return nil
    }
  }

  func librarySortOrder() throws -> Enums.SortOrder? {
    let field = GraphQLField.leaf(
      name: "librarySortOrder",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.librarySortOrder[field.alias!]
    case .mocking:
      return nil
    }
  }

  func margin() throws -> Int? {
    let field = GraphQLField.leaf(
      name: "margin",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.margin[field.alias!]
    case .mocking:
      return nil
    }
  }

  func theme() throws -> String? {
    let field = GraphQLField.leaf(
      name: "theme",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      return data.theme[field.alias!]
    case .mocking:
      return nil
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UserPersonalization<T> = Selection<T, Objects.UserPersonalization>
}

extension Objects {
  struct UserSuccess {
    let __typename: TypeName = .userSuccess
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case userSuccess = "UserSuccess"
    }
  }
}

extension Objects.UserSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    user = map["user"]
  }
}

extension Fields where TypeLock == Objects.UserSuccess {
  func user<Type>(selection: Selection<Type, Objects.User>) throws -> Type {
    let field = GraphQLField.composite(
      name: "user",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.user[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UserSuccess<T> = Selection<T, Objects.UserSuccess>
}

extension Objects {
  struct UsersError {
    let __typename: TypeName = .usersError
    let errorCodes: [String: [Enums.UsersErrorCode]]

    enum TypeName: String, Codable {
      case usersError = "UsersError"
    }
  }
}

extension Objects.UsersError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UsersErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.UsersError {
  func errorCodes() throws -> [Enums.UsersErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UsersError<T> = Selection<T, Objects.UsersError>
}

extension Objects {
  struct UsersSuccess {
    let __typename: TypeName = .usersSuccess
    let users: [String: [Objects.User]]

    enum TypeName: String, Codable {
      case usersSuccess = "UsersSuccess"
    }
  }
}

extension Objects.UsersSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "users":
        if let value = try container.decode([Objects.User]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    users = map["users"]
  }
}

extension Fields where TypeLock == Objects.UsersSuccess {
  func users<Type>(selection: Selection<Type, [Objects.User]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "users",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.users[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UsersSuccess<T> = Selection<T, Objects.UsersSuccess>
}

extension Objects {
  struct Webhook {
    let __typename: TypeName = .webhook
    let contentType: [String: String]
    let createdAt: [String: DateTime]
    let enabled: [String: Bool]
    let eventTypes: [String: [Enums.WebhookEvent]]
    let id: [String: String]
    let method: [String: String]
    let updatedAt: [String: DateTime]
    let url: [String: String]

    enum TypeName: String, Codable {
      case webhook = "Webhook"
    }
  }
}

extension Objects.Webhook: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "contentType":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "enabled":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "eventTypes":
        if let value = try container.decode([Enums.WebhookEvent]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "method":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedAt":
        if let value = try container.decode(DateTime?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "url":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    contentType = map["contentType"]
    createdAt = map["createdAt"]
    enabled = map["enabled"]
    eventTypes = map["eventTypes"]
    id = map["id"]
    method = map["method"]
    updatedAt = map["updatedAt"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.Webhook {
  func contentType() throws -> String {
    let field = GraphQLField.leaf(
      name: "contentType",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.contentType[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func createdAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "createdAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.createdAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func enabled() throws -> Bool {
    let field = GraphQLField.leaf(
      name: "enabled",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.enabled[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return Bool.mockValue
    }
  }

  func eventTypes() throws -> [Enums.WebhookEvent] {
    let field = GraphQLField.leaf(
      name: "eventTypes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.eventTypes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }

  func id() throws -> String {
    let field = GraphQLField.leaf(
      name: "id",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.id[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func method() throws -> String {
    let field = GraphQLField.leaf(
      name: "method",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.method[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

  func updatedAt() throws -> DateTime {
    let field = GraphQLField.leaf(
      name: "updatedAt",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.updatedAt[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return DateTime.mockValue
    }
  }

  func url() throws -> String {
    let field = GraphQLField.leaf(
      name: "url",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.url[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Webhook<T> = Selection<T, Objects.Webhook>
}

extension Objects {
  struct WebhookError {
    let __typename: TypeName = .webhookError
    let errorCodes: [String: [Enums.WebhookErrorCode]]

    enum TypeName: String, Codable {
      case webhookError = "WebhookError"
    }
  }
}

extension Objects.WebhookError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.WebhookErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.WebhookError {
  func errorCodes() throws -> [Enums.WebhookErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias WebhookError<T> = Selection<T, Objects.WebhookError>
}

extension Objects {
  struct WebhookSuccess {
    let __typename: TypeName = .webhookSuccess
    let webhook: [String: Objects.Webhook]

    enum TypeName: String, Codable {
      case webhookSuccess = "WebhookSuccess"
    }
  }
}

extension Objects.WebhookSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "webhook":
        if let value = try container.decode(Objects.Webhook?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    webhook = map["webhook"]
  }
}

extension Fields where TypeLock == Objects.WebhookSuccess {
  func webhook<Type>(selection: Selection<Type, Objects.Webhook>) throws -> Type {
    let field = GraphQLField.composite(
      name: "webhook",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.webhook[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias WebhookSuccess<T> = Selection<T, Objects.WebhookSuccess>
}

extension Objects {
  struct WebhooksError {
    let __typename: TypeName = .webhooksError
    let errorCodes: [String: [Enums.WebhooksErrorCode]]

    enum TypeName: String, Codable {
      case webhooksError = "WebhooksError"
    }
  }
}

extension Objects.WebhooksError: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.WebhooksErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Objects.WebhooksError {
  func errorCodes() throws -> [Enums.WebhooksErrorCode] {
    let field = GraphQLField.leaf(
      name: "errorCodes",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.errorCodes[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return []
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias WebhooksError<T> = Selection<T, Objects.WebhooksError>
}

extension Objects {
  struct WebhooksSuccess {
    let __typename: TypeName = .webhooksSuccess
    let webhooks: [String: [Objects.Webhook]]

    enum TypeName: String, Codable {
      case webhooksSuccess = "WebhooksSuccess"
    }
  }
}

extension Objects.WebhooksSuccess: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "webhooks":
        if let value = try container.decode([Objects.Webhook]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    webhooks = map["webhooks"]
  }
}

extension Fields where TypeLock == Objects.WebhooksSuccess {
  func webhooks<Type>(selection: Selection<Type, [Objects.Webhook]>) throws -> Type {
    let field = GraphQLField.composite(
      name: "webhooks",
      arguments: [],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.webhooks[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias WebhooksSuccess<T> = Selection<T, Objects.WebhooksSuccess>
}

// MARK: - Interfaces

enum Interfaces {}

// MARK: - Unions

enum Unions {}
extension Unions {
  struct AddPopularReadResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.AddPopularReadErrorCode]]
    let pageId: [String: String]

    enum TypeName: String, Codable {
      case addPopularReadError = "AddPopularReadError"
      case addPopularReadSuccess = "AddPopularReadSuccess"
    }
  }
}

extension Unions.AddPopularReadResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.AddPopularReadErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    pageId = map["pageId"]
  }
}

extension Fields where TypeLock == Unions.AddPopularReadResult {
  func on<Type>(addPopularReadError: Selection<Type, Objects.AddPopularReadError>, addPopularReadSuccess: Selection<Type, Objects.AddPopularReadSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "AddPopularReadError", selection: addPopularReadError.selection), GraphQLField.fragment(type: "AddPopularReadSuccess", selection: addPopularReadSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .addPopularReadError:
        let data = Objects.AddPopularReadError(errorCodes: data.errorCodes)
        return try addPopularReadError.decode(data: data)
      case .addPopularReadSuccess:
        let data = Objects.AddPopularReadSuccess(pageId: data.pageId)
        return try addPopularReadSuccess.decode(data: data)
      }
    case .mocking:
      return addPopularReadError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias AddPopularReadResult<T> = Selection<T, Unions.AddPopularReadResult>
}

extension Unions {
  struct ApiKeysResult {
    let __typename: TypeName
    let apiKeys: [String: [Objects.ApiKey]]
    let errorCodes: [String: [Enums.ApiKeysErrorCode]]

    enum TypeName: String, Codable {
      case apiKeysError = "ApiKeysError"
      case apiKeysSuccess = "ApiKeysSuccess"
    }
  }
}

extension Unions.ApiKeysResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "apiKeys":
        if let value = try container.decode([Objects.ApiKey]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.ApiKeysErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    apiKeys = map["apiKeys"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.ApiKeysResult {
  func on<Type>(apiKeysError: Selection<Type, Objects.ApiKeysError>, apiKeysSuccess: Selection<Type, Objects.ApiKeysSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "ApiKeysError", selection: apiKeysError.selection), GraphQLField.fragment(type: "ApiKeysSuccess", selection: apiKeysSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .apiKeysError:
        let data = Objects.ApiKeysError(errorCodes: data.errorCodes)
        return try apiKeysError.decode(data: data)
      case .apiKeysSuccess:
        let data = Objects.ApiKeysSuccess(apiKeys: data.apiKeys)
        return try apiKeysSuccess.decode(data: data)
      }
    case .mocking:
      return apiKeysError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ApiKeysResult<T> = Selection<T, Unions.ApiKeysResult>
}

extension Unions {
  struct ArchiveLinkResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.ArchiveLinkErrorCode]]
    let linkId: [String: String]
    let message: [String: String]

    enum TypeName: String, Codable {
      case archiveLinkError = "ArchiveLinkError"
      case archiveLinkSuccess = "ArchiveLinkSuccess"
    }
  }
}

extension Unions.ArchiveLinkResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.ArchiveLinkErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "linkId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    linkId = map["linkId"]
    message = map["message"]
  }
}

extension Fields where TypeLock == Unions.ArchiveLinkResult {
  func on<Type>(archiveLinkError: Selection<Type, Objects.ArchiveLinkError>, archiveLinkSuccess: Selection<Type, Objects.ArchiveLinkSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "ArchiveLinkError", selection: archiveLinkError.selection), GraphQLField.fragment(type: "ArchiveLinkSuccess", selection: archiveLinkSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .archiveLinkError:
        let data = Objects.ArchiveLinkError(errorCodes: data.errorCodes, message: data.message)
        return try archiveLinkError.decode(data: data)
      case .archiveLinkSuccess:
        let data = Objects.ArchiveLinkSuccess(linkId: data.linkId, message: data.message)
        return try archiveLinkSuccess.decode(data: data)
      }
    case .mocking:
      return archiveLinkError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArchiveLinkResult<T> = Selection<T, Unions.ArchiveLinkResult>
}

extension Unions {
  struct ArticleResult {
    let __typename: TypeName
    let article: [String: Objects.Article]
    let errorCodes: [String: [Enums.ArticleErrorCode]]

    enum TypeName: String, Codable {
      case articleError = "ArticleError"
      case articleSuccess = "ArticleSuccess"
    }
  }
}

extension Unions.ArticleResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "article":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.ArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    article = map["article"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.ArticleResult {
  func on<Type>(articleError: Selection<Type, Objects.ArticleError>, articleSuccess: Selection<Type, Objects.ArticleSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "ArticleError", selection: articleError.selection), GraphQLField.fragment(type: "ArticleSuccess", selection: articleSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .articleError:
        let data = Objects.ArticleError(errorCodes: data.errorCodes)
        return try articleError.decode(data: data)
      case .articleSuccess:
        let data = Objects.ArticleSuccess(article: data.article)
        return try articleSuccess.decode(data: data)
      }
    case .mocking:
      return articleError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleResult<T> = Selection<T, Unions.ArticleResult>
}

extension Unions {
  struct ArticleSavingRequestResult {
    let __typename: TypeName
    let articleSavingRequest: [String: Objects.ArticleSavingRequest]
    let errorCodes: [String: [Enums.ArticleSavingRequestErrorCode]]

    enum TypeName: String, Codable {
      case articleSavingRequestError = "ArticleSavingRequestError"
      case articleSavingRequestSuccess = "ArticleSavingRequestSuccess"
    }
  }
}

extension Unions.ArticleSavingRequestResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "articleSavingRequest":
        if let value = try container.decode(Objects.ArticleSavingRequest?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.ArticleSavingRequestErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    articleSavingRequest = map["articleSavingRequest"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.ArticleSavingRequestResult {
  func on<Type>(articleSavingRequestError: Selection<Type, Objects.ArticleSavingRequestError>, articleSavingRequestSuccess: Selection<Type, Objects.ArticleSavingRequestSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "ArticleSavingRequestError", selection: articleSavingRequestError.selection), GraphQLField.fragment(type: "ArticleSavingRequestSuccess", selection: articleSavingRequestSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .articleSavingRequestError:
        let data = Objects.ArticleSavingRequestError(errorCodes: data.errorCodes)
        return try articleSavingRequestError.decode(data: data)
      case .articleSavingRequestSuccess:
        let data = Objects.ArticleSavingRequestSuccess(articleSavingRequest: data.articleSavingRequest)
        return try articleSavingRequestSuccess.decode(data: data)
      }
    case .mocking:
      return articleSavingRequestError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleSavingRequestResult<T> = Selection<T, Unions.ArticleSavingRequestResult>
}

extension Unions {
  struct ArticlesResult {
    let __typename: TypeName
    let edges: [String: [Objects.ArticleEdge]]
    let errorCodes: [String: [Enums.ArticlesErrorCode]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case articlesError = "ArticlesError"
      case articlesSuccess = "ArticlesSuccess"
    }
  }
}

extension Unions.ArticlesResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "edges":
        if let value = try container.decode([Objects.ArticleEdge]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.ArticlesErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageInfo":
        if let value = try container.decode(Objects.PageInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    edges = map["edges"]
    errorCodes = map["errorCodes"]
    pageInfo = map["pageInfo"]
  }
}

extension Fields where TypeLock == Unions.ArticlesResult {
  func on<Type>(articlesError: Selection<Type, Objects.ArticlesError>, articlesSuccess: Selection<Type, Objects.ArticlesSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "ArticlesError", selection: articlesError.selection), GraphQLField.fragment(type: "ArticlesSuccess", selection: articlesSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .articlesError:
        let data = Objects.ArticlesError(errorCodes: data.errorCodes)
        return try articlesError.decode(data: data)
      case .articlesSuccess:
        let data = Objects.ArticlesSuccess(edges: data.edges, pageInfo: data.pageInfo)
        return try articlesSuccess.decode(data: data)
      }
    case .mocking:
      return articlesError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticlesResult<T> = Selection<T, Unions.ArticlesResult>
}

extension Unions {
  struct CreateArticleResult {
    let __typename: TypeName
    let created: [String: Bool]
    let createdArticle: [String: Objects.Article]
    let errorCodes: [String: [Enums.CreateArticleErrorCode]]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case createArticleError = "CreateArticleError"
      case createArticleSuccess = "CreateArticleSuccess"
    }
  }
}

extension Unions.CreateArticleResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "created":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "createdArticle":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.CreateArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    created = map["created"]
    createdArticle = map["createdArticle"]
    errorCodes = map["errorCodes"]
    user = map["user"]
  }
}

extension Fields where TypeLock == Unions.CreateArticleResult {
  func on<Type>(createArticleError: Selection<Type, Objects.CreateArticleError>, createArticleSuccess: Selection<Type, Objects.CreateArticleSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateArticleError", selection: createArticleError.selection), GraphQLField.fragment(type: "CreateArticleSuccess", selection: createArticleSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createArticleError:
        let data = Objects.CreateArticleError(errorCodes: data.errorCodes)
        return try createArticleError.decode(data: data)
      case .createArticleSuccess:
        let data = Objects.CreateArticleSuccess(created: data.created, createdArticle: data.createdArticle, user: data.user)
        return try createArticleSuccess.decode(data: data)
      }
    case .mocking:
      return createArticleError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleResult<T> = Selection<T, Unions.CreateArticleResult>
}

extension Unions {
  struct CreateArticleSavingRequestResult {
    let __typename: TypeName
    let articleSavingRequest: [String: Objects.ArticleSavingRequest]
    let errorCodes: [String: [Enums.CreateArticleSavingRequestErrorCode]]

    enum TypeName: String, Codable {
      case createArticleSavingRequestError = "CreateArticleSavingRequestError"
      case createArticleSavingRequestSuccess = "CreateArticleSavingRequestSuccess"
    }
  }
}

extension Unions.CreateArticleSavingRequestResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "articleSavingRequest":
        if let value = try container.decode(Objects.ArticleSavingRequest?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.CreateArticleSavingRequestErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    articleSavingRequest = map["articleSavingRequest"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.CreateArticleSavingRequestResult {
  func on<Type>(createArticleSavingRequestError: Selection<Type, Objects.CreateArticleSavingRequestError>, createArticleSavingRequestSuccess: Selection<Type, Objects.CreateArticleSavingRequestSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateArticleSavingRequestError", selection: createArticleSavingRequestError.selection), GraphQLField.fragment(type: "CreateArticleSavingRequestSuccess", selection: createArticleSavingRequestSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createArticleSavingRequestError:
        let data = Objects.CreateArticleSavingRequestError(errorCodes: data.errorCodes)
        return try createArticleSavingRequestError.decode(data: data)
      case .createArticleSavingRequestSuccess:
        let data = Objects.CreateArticleSavingRequestSuccess(articleSavingRequest: data.articleSavingRequest)
        return try createArticleSavingRequestSuccess.decode(data: data)
      }
    case .mocking:
      return createArticleSavingRequestError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleSavingRequestResult<T> = Selection<T, Unions.CreateArticleSavingRequestResult>
}

extension Unions {
  struct CreateHighlightReplyResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateHighlightReplyErrorCode]]
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case createHighlightReplyError = "CreateHighlightReplyError"
      case createHighlightReplySuccess = "CreateHighlightReplySuccess"
    }
  }
}

extension Unions.CreateHighlightReplyResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateHighlightReplyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlightReply":
        if let value = try container.decode(Objects.HighlightReply?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    highlightReply = map["highlightReply"]
  }
}

extension Fields where TypeLock == Unions.CreateHighlightReplyResult {
  func on<Type>(createHighlightReplyError: Selection<Type, Objects.CreateHighlightReplyError>, createHighlightReplySuccess: Selection<Type, Objects.CreateHighlightReplySuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateHighlightReplyError", selection: createHighlightReplyError.selection), GraphQLField.fragment(type: "CreateHighlightReplySuccess", selection: createHighlightReplySuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createHighlightReplyError:
        let data = Objects.CreateHighlightReplyError(errorCodes: data.errorCodes)
        return try createHighlightReplyError.decode(data: data)
      case .createHighlightReplySuccess:
        let data = Objects.CreateHighlightReplySuccess(highlightReply: data.highlightReply)
        return try createHighlightReplySuccess.decode(data: data)
      }
    case .mocking:
      return createHighlightReplyError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateHighlightReplyResult<T> = Selection<T, Unions.CreateHighlightReplyResult>
}

extension Unions {
  struct CreateHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case createHighlightError = "CreateHighlightError"
      case createHighlightSuccess = "CreateHighlightSuccess"
    }
  }
}

extension Unions.CreateHighlightResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    highlight = map["highlight"]
  }
}

extension Fields where TypeLock == Unions.CreateHighlightResult {
  func on<Type>(createHighlightError: Selection<Type, Objects.CreateHighlightError>, createHighlightSuccess: Selection<Type, Objects.CreateHighlightSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateHighlightError", selection: createHighlightError.selection), GraphQLField.fragment(type: "CreateHighlightSuccess", selection: createHighlightSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createHighlightError:
        let data = Objects.CreateHighlightError(errorCodes: data.errorCodes)
        return try createHighlightError.decode(data: data)
      case .createHighlightSuccess:
        let data = Objects.CreateHighlightSuccess(highlight: data.highlight)
        return try createHighlightSuccess.decode(data: data)
      }
    case .mocking:
      return createHighlightError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateHighlightResult<T> = Selection<T, Unions.CreateHighlightResult>
}

extension Unions {
  struct CreateLabelResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateLabelErrorCode]]
    let label: [String: Objects.Label]

    enum TypeName: String, Codable {
      case createLabelError = "CreateLabelError"
      case createLabelSuccess = "CreateLabelSuccess"
    }
  }
}

extension Unions.CreateLabelResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateLabelErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "label":
        if let value = try container.decode(Objects.Label?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    label = map["label"]
  }
}

extension Fields where TypeLock == Unions.CreateLabelResult {
  func on<Type>(createLabelError: Selection<Type, Objects.CreateLabelError>, createLabelSuccess: Selection<Type, Objects.CreateLabelSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateLabelError", selection: createLabelError.selection), GraphQLField.fragment(type: "CreateLabelSuccess", selection: createLabelSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createLabelError:
        let data = Objects.CreateLabelError(errorCodes: data.errorCodes)
        return try createLabelError.decode(data: data)
      case .createLabelSuccess:
        let data = Objects.CreateLabelSuccess(label: data.label)
        return try createLabelSuccess.decode(data: data)
      }
    case .mocking:
      return createLabelError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateLabelResult<T> = Selection<T, Unions.CreateLabelResult>
}

extension Unions {
  struct CreateNewsletterEmailResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateNewsletterEmailErrorCode]]
    let newsletterEmail: [String: Objects.NewsletterEmail]

    enum TypeName: String, Codable {
      case createNewsletterEmailError = "CreateNewsletterEmailError"
      case createNewsletterEmailSuccess = "CreateNewsletterEmailSuccess"
    }
  }
}

extension Unions.CreateNewsletterEmailResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateNewsletterEmailErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "newsletterEmail":
        if let value = try container.decode(Objects.NewsletterEmail?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    newsletterEmail = map["newsletterEmail"]
  }
}

extension Fields where TypeLock == Unions.CreateNewsletterEmailResult {
  func on<Type>(createNewsletterEmailError: Selection<Type, Objects.CreateNewsletterEmailError>, createNewsletterEmailSuccess: Selection<Type, Objects.CreateNewsletterEmailSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateNewsletterEmailError", selection: createNewsletterEmailError.selection), GraphQLField.fragment(type: "CreateNewsletterEmailSuccess", selection: createNewsletterEmailSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createNewsletterEmailError:
        let data = Objects.CreateNewsletterEmailError(errorCodes: data.errorCodes)
        return try createNewsletterEmailError.decode(data: data)
      case .createNewsletterEmailSuccess:
        let data = Objects.CreateNewsletterEmailSuccess(newsletterEmail: data.newsletterEmail)
        return try createNewsletterEmailSuccess.decode(data: data)
      }
    case .mocking:
      return createNewsletterEmailError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateNewsletterEmailResult<T> = Selection<T, Unions.CreateNewsletterEmailResult>
}

extension Unions {
  struct CreateReactionResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateReactionErrorCode]]
    let reaction: [String: Objects.Reaction]

    enum TypeName: String, Codable {
      case createReactionError = "CreateReactionError"
      case createReactionSuccess = "CreateReactionSuccess"
    }
  }
}

extension Unions.CreateReactionResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateReactionErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reaction":
        if let value = try container.decode(Objects.Reaction?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    reaction = map["reaction"]
  }
}

extension Fields where TypeLock == Unions.CreateReactionResult {
  func on<Type>(createReactionError: Selection<Type, Objects.CreateReactionError>, createReactionSuccess: Selection<Type, Objects.CreateReactionSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateReactionError", selection: createReactionError.selection), GraphQLField.fragment(type: "CreateReactionSuccess", selection: createReactionSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createReactionError:
        let data = Objects.CreateReactionError(errorCodes: data.errorCodes)
        return try createReactionError.decode(data: data)
      case .createReactionSuccess:
        let data = Objects.CreateReactionSuccess(reaction: data.reaction)
        return try createReactionSuccess.decode(data: data)
      }
    case .mocking:
      return createReactionError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateReactionResult<T> = Selection<T, Unions.CreateReactionResult>
}

extension Unions {
  struct CreateReminderResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateReminderErrorCode]]
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case createReminderError = "CreateReminderError"
      case createReminderSuccess = "CreateReminderSuccess"
    }
  }
}

extension Unions.CreateReminderResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.CreateReminderErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reminder":
        if let value = try container.decode(Objects.Reminder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    reminder = map["reminder"]
  }
}

extension Fields where TypeLock == Unions.CreateReminderResult {
  func on<Type>(createReminderError: Selection<Type, Objects.CreateReminderError>, createReminderSuccess: Selection<Type, Objects.CreateReminderSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateReminderError", selection: createReminderError.selection), GraphQLField.fragment(type: "CreateReminderSuccess", selection: createReminderSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createReminderError:
        let data = Objects.CreateReminderError(errorCodes: data.errorCodes)
        return try createReminderError.decode(data: data)
      case .createReminderSuccess:
        let data = Objects.CreateReminderSuccess(reminder: data.reminder)
        return try createReminderSuccess.decode(data: data)
      }
    case .mocking:
      return createReminderError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateReminderResult<T> = Selection<T, Unions.CreateReminderResult>
}

extension Unions {
  struct DeleteAccountResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteAccountErrorCode]]
    let userId: [String: String]

    enum TypeName: String, Codable {
      case deleteAccountError = "DeleteAccountError"
      case deleteAccountSuccess = "DeleteAccountSuccess"
    }
  }
}

extension Unions.DeleteAccountResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteAccountErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "userId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    userId = map["userId"]
  }
}

extension Fields where TypeLock == Unions.DeleteAccountResult {
  func on<Type>(deleteAccountError: Selection<Type, Objects.DeleteAccountError>, deleteAccountSuccess: Selection<Type, Objects.DeleteAccountSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteAccountError", selection: deleteAccountError.selection), GraphQLField.fragment(type: "DeleteAccountSuccess", selection: deleteAccountSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteAccountError:
        let data = Objects.DeleteAccountError(errorCodes: data.errorCodes)
        return try deleteAccountError.decode(data: data)
      case .deleteAccountSuccess:
        let data = Objects.DeleteAccountSuccess(userId: data.userId)
        return try deleteAccountSuccess.decode(data: data)
      }
    case .mocking:
      return deleteAccountError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteAccountResult<T> = Selection<T, Unions.DeleteAccountResult>
}

extension Unions {
  struct DeleteHighlightReplyResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteHighlightReplyErrorCode]]
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case deleteHighlightReplyError = "DeleteHighlightReplyError"
      case deleteHighlightReplySuccess = "DeleteHighlightReplySuccess"
    }
  }
}

extension Unions.DeleteHighlightReplyResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteHighlightReplyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlightReply":
        if let value = try container.decode(Objects.HighlightReply?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    highlightReply = map["highlightReply"]
  }
}

extension Fields where TypeLock == Unions.DeleteHighlightReplyResult {
  func on<Type>(deleteHighlightReplyError: Selection<Type, Objects.DeleteHighlightReplyError>, deleteHighlightReplySuccess: Selection<Type, Objects.DeleteHighlightReplySuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteHighlightReplyError", selection: deleteHighlightReplyError.selection), GraphQLField.fragment(type: "DeleteHighlightReplySuccess", selection: deleteHighlightReplySuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteHighlightReplyError:
        let data = Objects.DeleteHighlightReplyError(errorCodes: data.errorCodes)
        return try deleteHighlightReplyError.decode(data: data)
      case .deleteHighlightReplySuccess:
        let data = Objects.DeleteHighlightReplySuccess(highlightReply: data.highlightReply)
        return try deleteHighlightReplySuccess.decode(data: data)
      }
    case .mocking:
      return deleteHighlightReplyError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteHighlightReplyResult<T> = Selection<T, Unions.DeleteHighlightReplyResult>
}

extension Unions {
  struct DeleteHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case deleteHighlightError = "DeleteHighlightError"
      case deleteHighlightSuccess = "DeleteHighlightSuccess"
    }
  }
}

extension Unions.DeleteHighlightResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    highlight = map["highlight"]
  }
}

extension Fields where TypeLock == Unions.DeleteHighlightResult {
  func on<Type>(deleteHighlightError: Selection<Type, Objects.DeleteHighlightError>, deleteHighlightSuccess: Selection<Type, Objects.DeleteHighlightSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteHighlightError", selection: deleteHighlightError.selection), GraphQLField.fragment(type: "DeleteHighlightSuccess", selection: deleteHighlightSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteHighlightError:
        let data = Objects.DeleteHighlightError(errorCodes: data.errorCodes)
        return try deleteHighlightError.decode(data: data)
      case .deleteHighlightSuccess:
        let data = Objects.DeleteHighlightSuccess(highlight: data.highlight)
        return try deleteHighlightSuccess.decode(data: data)
      }
    case .mocking:
      return deleteHighlightError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteHighlightResult<T> = Selection<T, Unions.DeleteHighlightResult>
}

extension Unions {
  struct DeleteLabelResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteLabelErrorCode]]
    let label: [String: Objects.Label]

    enum TypeName: String, Codable {
      case deleteLabelError = "DeleteLabelError"
      case deleteLabelSuccess = "DeleteLabelSuccess"
    }
  }
}

extension Unions.DeleteLabelResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteLabelErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "label":
        if let value = try container.decode(Objects.Label?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    label = map["label"]
  }
}

extension Fields where TypeLock == Unions.DeleteLabelResult {
  func on<Type>(deleteLabelError: Selection<Type, Objects.DeleteLabelError>, deleteLabelSuccess: Selection<Type, Objects.DeleteLabelSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteLabelError", selection: deleteLabelError.selection), GraphQLField.fragment(type: "DeleteLabelSuccess", selection: deleteLabelSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteLabelError:
        let data = Objects.DeleteLabelError(errorCodes: data.errorCodes)
        return try deleteLabelError.decode(data: data)
      case .deleteLabelSuccess:
        let data = Objects.DeleteLabelSuccess(label: data.label)
        return try deleteLabelSuccess.decode(data: data)
      }
    case .mocking:
      return deleteLabelError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteLabelResult<T> = Selection<T, Unions.DeleteLabelResult>
}

extension Unions {
  struct DeleteNewsletterEmailResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteNewsletterEmailErrorCode]]
    let newsletterEmail: [String: Objects.NewsletterEmail]

    enum TypeName: String, Codable {
      case deleteNewsletterEmailError = "DeleteNewsletterEmailError"
      case deleteNewsletterEmailSuccess = "DeleteNewsletterEmailSuccess"
    }
  }
}

extension Unions.DeleteNewsletterEmailResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteNewsletterEmailErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "newsletterEmail":
        if let value = try container.decode(Objects.NewsletterEmail?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    newsletterEmail = map["newsletterEmail"]
  }
}

extension Fields where TypeLock == Unions.DeleteNewsletterEmailResult {
  func on<Type>(deleteNewsletterEmailError: Selection<Type, Objects.DeleteNewsletterEmailError>, deleteNewsletterEmailSuccess: Selection<Type, Objects.DeleteNewsletterEmailSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteNewsletterEmailError", selection: deleteNewsletterEmailError.selection), GraphQLField.fragment(type: "DeleteNewsletterEmailSuccess", selection: deleteNewsletterEmailSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteNewsletterEmailError:
        let data = Objects.DeleteNewsletterEmailError(errorCodes: data.errorCodes)
        return try deleteNewsletterEmailError.decode(data: data)
      case .deleteNewsletterEmailSuccess:
        let data = Objects.DeleteNewsletterEmailSuccess(newsletterEmail: data.newsletterEmail)
        return try deleteNewsletterEmailSuccess.decode(data: data)
      }
    case .mocking:
      return deleteNewsletterEmailError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteNewsletterEmailResult<T> = Selection<T, Unions.DeleteNewsletterEmailResult>
}

extension Unions {
  struct DeleteReactionResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteReactionErrorCode]]
    let reaction: [String: Objects.Reaction]

    enum TypeName: String, Codable {
      case deleteReactionError = "DeleteReactionError"
      case deleteReactionSuccess = "DeleteReactionSuccess"
    }
  }
}

extension Unions.DeleteReactionResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteReactionErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reaction":
        if let value = try container.decode(Objects.Reaction?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    reaction = map["reaction"]
  }
}

extension Fields where TypeLock == Unions.DeleteReactionResult {
  func on<Type>(deleteReactionError: Selection<Type, Objects.DeleteReactionError>, deleteReactionSuccess: Selection<Type, Objects.DeleteReactionSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteReactionError", selection: deleteReactionError.selection), GraphQLField.fragment(type: "DeleteReactionSuccess", selection: deleteReactionSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteReactionError:
        let data = Objects.DeleteReactionError(errorCodes: data.errorCodes)
        return try deleteReactionError.decode(data: data)
      case .deleteReactionSuccess:
        let data = Objects.DeleteReactionSuccess(reaction: data.reaction)
        return try deleteReactionSuccess.decode(data: data)
      }
    case .mocking:
      return deleteReactionError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteReactionResult<T> = Selection<T, Unions.DeleteReactionResult>
}

extension Unions {
  struct DeleteReminderResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteReminderErrorCode]]
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case deleteReminderError = "DeleteReminderError"
      case deleteReminderSuccess = "DeleteReminderSuccess"
    }
  }
}

extension Unions.DeleteReminderResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteReminderErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reminder":
        if let value = try container.decode(Objects.Reminder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    reminder = map["reminder"]
  }
}

extension Fields where TypeLock == Unions.DeleteReminderResult {
  func on<Type>(deleteReminderError: Selection<Type, Objects.DeleteReminderError>, deleteReminderSuccess: Selection<Type, Objects.DeleteReminderSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteReminderError", selection: deleteReminderError.selection), GraphQLField.fragment(type: "DeleteReminderSuccess", selection: deleteReminderSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteReminderError:
        let data = Objects.DeleteReminderError(errorCodes: data.errorCodes)
        return try deleteReminderError.decode(data: data)
      case .deleteReminderSuccess:
        let data = Objects.DeleteReminderSuccess(reminder: data.reminder)
        return try deleteReminderSuccess.decode(data: data)
      }
    case .mocking:
      return deleteReminderError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteReminderResult<T> = Selection<T, Unions.DeleteReminderResult>
}

extension Unions {
  struct DeleteWebhookResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteWebhookErrorCode]]
    let webhook: [String: Objects.Webhook]

    enum TypeName: String, Codable {
      case deleteWebhookError = "DeleteWebhookError"
      case deleteWebhookSuccess = "DeleteWebhookSuccess"
    }
  }
}

extension Unions.DeleteWebhookResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.DeleteWebhookErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "webhook":
        if let value = try container.decode(Objects.Webhook?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    webhook = map["webhook"]
  }
}

extension Fields where TypeLock == Unions.DeleteWebhookResult {
  func on<Type>(deleteWebhookError: Selection<Type, Objects.DeleteWebhookError>, deleteWebhookSuccess: Selection<Type, Objects.DeleteWebhookSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteWebhookError", selection: deleteWebhookError.selection), GraphQLField.fragment(type: "DeleteWebhookSuccess", selection: deleteWebhookSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteWebhookError:
        let data = Objects.DeleteWebhookError(errorCodes: data.errorCodes)
        return try deleteWebhookError.decode(data: data)
      case .deleteWebhookSuccess:
        let data = Objects.DeleteWebhookSuccess(webhook: data.webhook)
        return try deleteWebhookSuccess.decode(data: data)
      }
    case .mocking:
      return deleteWebhookError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteWebhookResult<T> = Selection<T, Unions.DeleteWebhookResult>
}

extension Unions {
  struct FeedArticlesResult {
    let __typename: TypeName
    let edges: [String: [Objects.FeedArticleEdge]]
    let errorCodes: [String: [Enums.FeedArticlesErrorCode]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case feedArticlesError = "FeedArticlesError"
      case feedArticlesSuccess = "FeedArticlesSuccess"
    }
  }
}

extension Unions.FeedArticlesResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "edges":
        if let value = try container.decode([Objects.FeedArticleEdge]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.FeedArticlesErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageInfo":
        if let value = try container.decode(Objects.PageInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    edges = map["edges"]
    errorCodes = map["errorCodes"]
    pageInfo = map["pageInfo"]
  }
}

extension Fields where TypeLock == Unions.FeedArticlesResult {
  func on<Type>(feedArticlesError: Selection<Type, Objects.FeedArticlesError>, feedArticlesSuccess: Selection<Type, Objects.FeedArticlesSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "FeedArticlesError", selection: feedArticlesError.selection), GraphQLField.fragment(type: "FeedArticlesSuccess", selection: feedArticlesSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .feedArticlesError:
        let data = Objects.FeedArticlesError(errorCodes: data.errorCodes)
        return try feedArticlesError.decode(data: data)
      case .feedArticlesSuccess:
        let data = Objects.FeedArticlesSuccess(edges: data.edges, pageInfo: data.pageInfo)
        return try feedArticlesSuccess.decode(data: data)
      }
    case .mocking:
      return feedArticlesError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias FeedArticlesResult<T> = Selection<T, Unions.FeedArticlesResult>
}

extension Unions {
  struct GenerateApiKeyResult {
    let __typename: TypeName
    let apiKey: [String: Objects.ApiKey]
    let errorCodes: [String: [Enums.GenerateApiKeyErrorCode]]

    enum TypeName: String, Codable {
      case generateApiKeyError = "GenerateApiKeyError"
      case generateApiKeySuccess = "GenerateApiKeySuccess"
    }
  }
}

extension Unions.GenerateApiKeyResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "apiKey":
        if let value = try container.decode(Objects.ApiKey?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.GenerateApiKeyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    apiKey = map["apiKey"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.GenerateApiKeyResult {
  func on<Type>(generateApiKeyError: Selection<Type, Objects.GenerateApiKeyError>, generateApiKeySuccess: Selection<Type, Objects.GenerateApiKeySuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "GenerateApiKeyError", selection: generateApiKeyError.selection), GraphQLField.fragment(type: "GenerateApiKeySuccess", selection: generateApiKeySuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .generateApiKeyError:
        let data = Objects.GenerateApiKeyError(errorCodes: data.errorCodes)
        return try generateApiKeyError.decode(data: data)
      case .generateApiKeySuccess:
        let data = Objects.GenerateApiKeySuccess(apiKey: data.apiKey)
        return try generateApiKeySuccess.decode(data: data)
      }
    case .mocking:
      return generateApiKeyError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GenerateApiKeyResult<T> = Selection<T, Unions.GenerateApiKeyResult>
}

extension Unions {
  struct GetFollowersResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.GetFollowersErrorCode]]
    let followers: [String: [Objects.User]]

    enum TypeName: String, Codable {
      case getFollowersError = "GetFollowersError"
      case getFollowersSuccess = "GetFollowersSuccess"
    }
  }
}

extension Unions.GetFollowersResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.GetFollowersErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "followers":
        if let value = try container.decode([Objects.User]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    followers = map["followers"]
  }
}

extension Fields where TypeLock == Unions.GetFollowersResult {
  func on<Type>(getFollowersError: Selection<Type, Objects.GetFollowersError>, getFollowersSuccess: Selection<Type, Objects.GetFollowersSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "GetFollowersError", selection: getFollowersError.selection), GraphQLField.fragment(type: "GetFollowersSuccess", selection: getFollowersSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .getFollowersError:
        let data = Objects.GetFollowersError(errorCodes: data.errorCodes)
        return try getFollowersError.decode(data: data)
      case .getFollowersSuccess:
        let data = Objects.GetFollowersSuccess(followers: data.followers)
        return try getFollowersSuccess.decode(data: data)
      }
    case .mocking:
      return getFollowersError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetFollowersResult<T> = Selection<T, Unions.GetFollowersResult>
}

extension Unions {
  struct GetFollowingResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.GetFollowingErrorCode]]
    let following: [String: [Objects.User]]

    enum TypeName: String, Codable {
      case getFollowingError = "GetFollowingError"
      case getFollowingSuccess = "GetFollowingSuccess"
    }
  }
}

extension Unions.GetFollowingResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.GetFollowingErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "following":
        if let value = try container.decode([Objects.User]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    following = map["following"]
  }
}

extension Fields where TypeLock == Unions.GetFollowingResult {
  func on<Type>(getFollowingError: Selection<Type, Objects.GetFollowingError>, getFollowingSuccess: Selection<Type, Objects.GetFollowingSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "GetFollowingError", selection: getFollowingError.selection), GraphQLField.fragment(type: "GetFollowingSuccess", selection: getFollowingSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .getFollowingError:
        let data = Objects.GetFollowingError(errorCodes: data.errorCodes)
        return try getFollowingError.decode(data: data)
      case .getFollowingSuccess:
        let data = Objects.GetFollowingSuccess(following: data.following)
        return try getFollowingSuccess.decode(data: data)
      }
    case .mocking:
      return getFollowingError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetFollowingResult<T> = Selection<T, Unions.GetFollowingResult>
}

extension Unions {
  struct GetUserPersonalizationResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.GetUserPersonalizationErrorCode]]
    let userPersonalization: [String: Objects.UserPersonalization]

    enum TypeName: String, Codable {
      case getUserPersonalizationError = "GetUserPersonalizationError"
      case getUserPersonalizationSuccess = "GetUserPersonalizationSuccess"
    }
  }
}

extension Unions.GetUserPersonalizationResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.GetUserPersonalizationErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "userPersonalization":
        if let value = try container.decode(Objects.UserPersonalization?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    userPersonalization = map["userPersonalization"]
  }
}

extension Fields where TypeLock == Unions.GetUserPersonalizationResult {
  func on<Type>(getUserPersonalizationError: Selection<Type, Objects.GetUserPersonalizationError>, getUserPersonalizationSuccess: Selection<Type, Objects.GetUserPersonalizationSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "GetUserPersonalizationError", selection: getUserPersonalizationError.selection), GraphQLField.fragment(type: "GetUserPersonalizationSuccess", selection: getUserPersonalizationSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .getUserPersonalizationError:
        let data = Objects.GetUserPersonalizationError(errorCodes: data.errorCodes)
        return try getUserPersonalizationError.decode(data: data)
      case .getUserPersonalizationSuccess:
        let data = Objects.GetUserPersonalizationSuccess(userPersonalization: data.userPersonalization)
        return try getUserPersonalizationSuccess.decode(data: data)
      }
    case .mocking:
      return getUserPersonalizationError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetUserPersonalizationResult<T> = Selection<T, Unions.GetUserPersonalizationResult>
}

extension Unions {
  struct GoogleSignupResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SignupErrorCode?]]
    let me: [String: Objects.User]

    enum TypeName: String, Codable {
      case googleSignupError = "GoogleSignupError"
      case googleSignupSuccess = "GoogleSignupSuccess"
    }
  }
}

extension Unions.GoogleSignupResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SignupErrorCode?]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "me":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    me = map["me"]
  }
}

extension Fields where TypeLock == Unions.GoogleSignupResult {
  func on<Type>(googleSignupError: Selection<Type, Objects.GoogleSignupError>, googleSignupSuccess: Selection<Type, Objects.GoogleSignupSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "GoogleSignupError", selection: googleSignupError.selection), GraphQLField.fragment(type: "GoogleSignupSuccess", selection: googleSignupSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .googleSignupError:
        let data = Objects.GoogleSignupError(errorCodes: data.errorCodes)
        return try googleSignupError.decode(data: data)
      case .googleSignupSuccess:
        let data = Objects.GoogleSignupSuccess(me: data.me)
        return try googleSignupSuccess.decode(data: data)
      }
    case .mocking:
      return googleSignupError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GoogleSignupResult<T> = Selection<T, Unions.GoogleSignupResult>
}

extension Unions {
  struct LabelsResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.LabelsErrorCode]]
    let labels: [String: [Objects.Label]]

    enum TypeName: String, Codable {
      case labelsError = "LabelsError"
      case labelsSuccess = "LabelsSuccess"
    }
  }
}

extension Unions.LabelsResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.LabelsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "labels":
        if let value = try container.decode([Objects.Label]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    labels = map["labels"]
  }
}

extension Fields where TypeLock == Unions.LabelsResult {
  func on<Type>(labelsError: Selection<Type, Objects.LabelsError>, labelsSuccess: Selection<Type, Objects.LabelsSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "LabelsError", selection: labelsError.selection), GraphQLField.fragment(type: "LabelsSuccess", selection: labelsSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .labelsError:
        let data = Objects.LabelsError(errorCodes: data.errorCodes)
        return try labelsError.decode(data: data)
      case .labelsSuccess:
        let data = Objects.LabelsSuccess(labels: data.labels)
        return try labelsSuccess.decode(data: data)
      }
    case .mocking:
      return labelsError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LabelsResult<T> = Selection<T, Unions.LabelsResult>
}

extension Unions {
  struct LogOutResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.LogOutErrorCode]]
    let message: [String: String]

    enum TypeName: String, Codable {
      case logOutError = "LogOutError"
      case logOutSuccess = "LogOutSuccess"
    }
  }
}

extension Unions.LogOutResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.LogOutErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    message = map["message"]
  }
}

extension Fields where TypeLock == Unions.LogOutResult {
  func on<Type>(logOutError: Selection<Type, Objects.LogOutError>, logOutSuccess: Selection<Type, Objects.LogOutSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "LogOutError", selection: logOutError.selection), GraphQLField.fragment(type: "LogOutSuccess", selection: logOutSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .logOutError:
        let data = Objects.LogOutError(errorCodes: data.errorCodes)
        return try logOutError.decode(data: data)
      case .logOutSuccess:
        let data = Objects.LogOutSuccess(message: data.message)
        return try logOutSuccess.decode(data: data)
      }
    case .mocking:
      return logOutError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LogOutResult<T> = Selection<T, Unions.LogOutResult>
}

extension Unions {
  struct LoginResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.LoginErrorCode]]
    let me: [String: Objects.User]

    enum TypeName: String, Codable {
      case loginError = "LoginError"
      case loginSuccess = "LoginSuccess"
    }
  }
}

extension Unions.LoginResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.LoginErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "me":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    me = map["me"]
  }
}

extension Fields where TypeLock == Unions.LoginResult {
  func on<Type>(loginError: Selection<Type, Objects.LoginError>, loginSuccess: Selection<Type, Objects.LoginSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "LoginError", selection: loginError.selection), GraphQLField.fragment(type: "LoginSuccess", selection: loginSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .loginError:
        let data = Objects.LoginError(errorCodes: data.errorCodes)
        return try loginError.decode(data: data)
      case .loginSuccess:
        let data = Objects.LoginSuccess(me: data.me)
        return try loginSuccess.decode(data: data)
      }
    case .mocking:
      return loginError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LoginResult<T> = Selection<T, Unions.LoginResult>
}

extension Unions {
  struct MergeHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.MergeHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]
    let overlapHighlightIdList: [String: [String]]

    enum TypeName: String, Codable {
      case mergeHighlightError = "MergeHighlightError"
      case mergeHighlightSuccess = "MergeHighlightSuccess"
    }
  }
}

extension Unions.MergeHighlightResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.MergeHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "overlapHighlightIdList":
        if let value = try container.decode([String]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    highlight = map["highlight"]
    overlapHighlightIdList = map["overlapHighlightIdList"]
  }
}

extension Fields where TypeLock == Unions.MergeHighlightResult {
  func on<Type>(mergeHighlightError: Selection<Type, Objects.MergeHighlightError>, mergeHighlightSuccess: Selection<Type, Objects.MergeHighlightSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "MergeHighlightError", selection: mergeHighlightError.selection), GraphQLField.fragment(type: "MergeHighlightSuccess", selection: mergeHighlightSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .mergeHighlightError:
        let data = Objects.MergeHighlightError(errorCodes: data.errorCodes)
        return try mergeHighlightError.decode(data: data)
      case .mergeHighlightSuccess:
        let data = Objects.MergeHighlightSuccess(highlight: data.highlight, overlapHighlightIdList: data.overlapHighlightIdList)
        return try mergeHighlightSuccess.decode(data: data)
      }
    case .mocking:
      return mergeHighlightError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias MergeHighlightResult<T> = Selection<T, Unions.MergeHighlightResult>
}

extension Unions {
  struct NewsletterEmailsResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.NewsletterEmailsErrorCode]]
    let newsletterEmails: [String: [Objects.NewsletterEmail]]

    enum TypeName: String, Codable {
      case newsletterEmailsError = "NewsletterEmailsError"
      case newsletterEmailsSuccess = "NewsletterEmailsSuccess"
    }
  }
}

extension Unions.NewsletterEmailsResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.NewsletterEmailsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "newsletterEmails":
        if let value = try container.decode([Objects.NewsletterEmail]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    newsletterEmails = map["newsletterEmails"]
  }
}

extension Fields where TypeLock == Unions.NewsletterEmailsResult {
  func on<Type>(newsletterEmailsError: Selection<Type, Objects.NewsletterEmailsError>, newsletterEmailsSuccess: Selection<Type, Objects.NewsletterEmailsSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "NewsletterEmailsError", selection: newsletterEmailsError.selection), GraphQLField.fragment(type: "NewsletterEmailsSuccess", selection: newsletterEmailsSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .newsletterEmailsError:
        let data = Objects.NewsletterEmailsError(errorCodes: data.errorCodes)
        return try newsletterEmailsError.decode(data: data)
      case .newsletterEmailsSuccess:
        let data = Objects.NewsletterEmailsSuccess(newsletterEmails: data.newsletterEmails)
        return try newsletterEmailsSuccess.decode(data: data)
      }
    case .mocking:
      return newsletterEmailsError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias NewsletterEmailsResult<T> = Selection<T, Unions.NewsletterEmailsResult>
}

extension Unions {
  struct ReminderResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.ReminderErrorCode]]
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case reminderError = "ReminderError"
      case reminderSuccess = "ReminderSuccess"
    }
  }
}

extension Unions.ReminderResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.ReminderErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reminder":
        if let value = try container.decode(Objects.Reminder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    reminder = map["reminder"]
  }
}

extension Fields where TypeLock == Unions.ReminderResult {
  func on<Type>(reminderError: Selection<Type, Objects.ReminderError>, reminderSuccess: Selection<Type, Objects.ReminderSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "ReminderError", selection: reminderError.selection), GraphQLField.fragment(type: "ReminderSuccess", selection: reminderSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .reminderError:
        let data = Objects.ReminderError(errorCodes: data.errorCodes)
        return try reminderError.decode(data: data)
      case .reminderSuccess:
        let data = Objects.ReminderSuccess(reminder: data.reminder)
        return try reminderSuccess.decode(data: data)
      }
    case .mocking:
      return reminderError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ReminderResult<T> = Selection<T, Unions.ReminderResult>
}

extension Unions {
  struct RevokeApiKeyResult {
    let __typename: TypeName
    let apiKey: [String: Objects.ApiKey]
    let errorCodes: [String: [Enums.RevokeApiKeyErrorCode]]

    enum TypeName: String, Codable {
      case revokeApiKeyError = "RevokeApiKeyError"
      case revokeApiKeySuccess = "RevokeApiKeySuccess"
    }
  }
}

extension Unions.RevokeApiKeyResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "apiKey":
        if let value = try container.decode(Objects.ApiKey?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.RevokeApiKeyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    apiKey = map["apiKey"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.RevokeApiKeyResult {
  func on<Type>(revokeApiKeyError: Selection<Type, Objects.RevokeApiKeyError>, revokeApiKeySuccess: Selection<Type, Objects.RevokeApiKeySuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "RevokeApiKeyError", selection: revokeApiKeyError.selection), GraphQLField.fragment(type: "RevokeApiKeySuccess", selection: revokeApiKeySuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .revokeApiKeyError:
        let data = Objects.RevokeApiKeyError(errorCodes: data.errorCodes)
        return try revokeApiKeyError.decode(data: data)
      case .revokeApiKeySuccess:
        let data = Objects.RevokeApiKeySuccess(apiKey: data.apiKey)
        return try revokeApiKeySuccess.decode(data: data)
      }
    case .mocking:
      return revokeApiKeyError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias RevokeApiKeyResult<T> = Selection<T, Unions.RevokeApiKeyResult>
}

extension Unions {
  struct SaveArticleReadingProgressResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SaveArticleReadingProgressErrorCode]]
    let updatedArticle: [String: Objects.Article]

    enum TypeName: String, Codable {
      case saveArticleReadingProgressError = "SaveArticleReadingProgressError"
      case saveArticleReadingProgressSuccess = "SaveArticleReadingProgressSuccess"
    }
  }
}

extension Unions.SaveArticleReadingProgressResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SaveArticleReadingProgressErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedArticle":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    updatedArticle = map["updatedArticle"]
  }
}

extension Fields where TypeLock == Unions.SaveArticleReadingProgressResult {
  func on<Type>(saveArticleReadingProgressError: Selection<Type, Objects.SaveArticleReadingProgressError>, saveArticleReadingProgressSuccess: Selection<Type, Objects.SaveArticleReadingProgressSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SaveArticleReadingProgressError", selection: saveArticleReadingProgressError.selection), GraphQLField.fragment(type: "SaveArticleReadingProgressSuccess", selection: saveArticleReadingProgressSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .saveArticleReadingProgressError:
        let data = Objects.SaveArticleReadingProgressError(errorCodes: data.errorCodes)
        return try saveArticleReadingProgressError.decode(data: data)
      case .saveArticleReadingProgressSuccess:
        let data = Objects.SaveArticleReadingProgressSuccess(updatedArticle: data.updatedArticle)
        return try saveArticleReadingProgressSuccess.decode(data: data)
      }
    case .mocking:
      return saveArticleReadingProgressError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveArticleReadingProgressResult<T> = Selection<T, Unions.SaveArticleReadingProgressResult>
}

extension Unions {
  struct SaveResult {
    let __typename: TypeName
    let clientRequestId: [String: String]
    let errorCodes: [String: [Enums.SaveErrorCode]]
    let message: [String: String]
    let url: [String: String]

    enum TypeName: String, Codable {
      case saveError = "SaveError"
      case saveSuccess = "SaveSuccess"
    }
  }
}

extension Unions.SaveResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "clientRequestId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.SaveErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "url":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    clientRequestId = map["clientRequestId"]
    errorCodes = map["errorCodes"]
    message = map["message"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Unions.SaveResult {
  func on<Type>(saveError: Selection<Type, Objects.SaveError>, saveSuccess: Selection<Type, Objects.SaveSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SaveError", selection: saveError.selection), GraphQLField.fragment(type: "SaveSuccess", selection: saveSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .saveError:
        let data = Objects.SaveError(errorCodes: data.errorCodes, message: data.message)
        return try saveError.decode(data: data)
      case .saveSuccess:
        let data = Objects.SaveSuccess(clientRequestId: data.clientRequestId, url: data.url)
        return try saveSuccess.decode(data: data)
      }
    case .mocking:
      return saveError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveResult<T> = Selection<T, Unions.SaveResult>
}

extension Unions {
  struct SearchResult {
    let __typename: TypeName
    let edges: [String: [Objects.SearchItemEdge]]
    let errorCodes: [String: [Enums.SearchErrorCode]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case searchError = "SearchError"
      case searchSuccess = "SearchSuccess"
    }
  }
}

extension Unions.SearchResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "edges":
        if let value = try container.decode([Objects.SearchItemEdge]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.SearchErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageInfo":
        if let value = try container.decode(Objects.PageInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    edges = map["edges"]
    errorCodes = map["errorCodes"]
    pageInfo = map["pageInfo"]
  }
}

extension Fields where TypeLock == Unions.SearchResult {
  func on<Type>(searchError: Selection<Type, Objects.SearchError>, searchSuccess: Selection<Type, Objects.SearchSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SearchError", selection: searchError.selection), GraphQLField.fragment(type: "SearchSuccess", selection: searchSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .searchError:
        let data = Objects.SearchError(errorCodes: data.errorCodes)
        return try searchError.decode(data: data)
      case .searchSuccess:
        let data = Objects.SearchSuccess(edges: data.edges, pageInfo: data.pageInfo)
        return try searchSuccess.decode(data: data)
      }
    case .mocking:
      return searchError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SearchResult<T> = Selection<T, Unions.SearchResult>
}

extension Unions {
  struct SendInstallInstructionsResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SendInstallInstructionsErrorCode]]
    let sent: [String: Bool]

    enum TypeName: String, Codable {
      case sendInstallInstructionsError = "SendInstallInstructionsError"
      case sendInstallInstructionsSuccess = "SendInstallInstructionsSuccess"
    }
  }
}

extension Unions.SendInstallInstructionsResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SendInstallInstructionsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sent":
        if let value = try container.decode(Bool?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    sent = map["sent"]
  }
}

extension Fields where TypeLock == Unions.SendInstallInstructionsResult {
  func on<Type>(sendInstallInstructionsError: Selection<Type, Objects.SendInstallInstructionsError>, sendInstallInstructionsSuccess: Selection<Type, Objects.SendInstallInstructionsSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SendInstallInstructionsError", selection: sendInstallInstructionsError.selection), GraphQLField.fragment(type: "SendInstallInstructionsSuccess", selection: sendInstallInstructionsSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .sendInstallInstructionsError:
        let data = Objects.SendInstallInstructionsError(errorCodes: data.errorCodes)
        return try sendInstallInstructionsError.decode(data: data)
      case .sendInstallInstructionsSuccess:
        let data = Objects.SendInstallInstructionsSuccess(sent: data.sent)
        return try sendInstallInstructionsSuccess.decode(data: data)
      }
    case .mocking:
      return sendInstallInstructionsError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SendInstallInstructionsResult<T> = Selection<T, Unions.SendInstallInstructionsResult>
}

extension Unions {
  struct SetBookmarkArticleResult {
    let __typename: TypeName
    let bookmarkedArticle: [String: Objects.Article]
    let errorCodes: [String: [Enums.SetBookmarkArticleErrorCode]]

    enum TypeName: String, Codable {
      case setBookmarkArticleError = "SetBookmarkArticleError"
      case setBookmarkArticleSuccess = "SetBookmarkArticleSuccess"
    }
  }
}

extension Unions.SetBookmarkArticleResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "bookmarkedArticle":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.SetBookmarkArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    bookmarkedArticle = map["bookmarkedArticle"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.SetBookmarkArticleResult {
  func on<Type>(setBookmarkArticleError: Selection<Type, Objects.SetBookmarkArticleError>, setBookmarkArticleSuccess: Selection<Type, Objects.SetBookmarkArticleSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SetBookmarkArticleError", selection: setBookmarkArticleError.selection), GraphQLField.fragment(type: "SetBookmarkArticleSuccess", selection: setBookmarkArticleSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setBookmarkArticleError:
        let data = Objects.SetBookmarkArticleError(errorCodes: data.errorCodes)
        return try setBookmarkArticleError.decode(data: data)
      case .setBookmarkArticleSuccess:
        let data = Objects.SetBookmarkArticleSuccess(bookmarkedArticle: data.bookmarkedArticle)
        return try setBookmarkArticleSuccess.decode(data: data)
      }
    case .mocking:
      return setBookmarkArticleError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetBookmarkArticleResult<T> = Selection<T, Unions.SetBookmarkArticleResult>
}

extension Unions {
  struct SetDeviceTokenResult {
    let __typename: TypeName
    let deviceToken: [String: Objects.DeviceToken]
    let errorCodes: [String: [Enums.SetDeviceTokenErrorCode]]

    enum TypeName: String, Codable {
      case setDeviceTokenError = "SetDeviceTokenError"
      case setDeviceTokenSuccess = "SetDeviceTokenSuccess"
    }
  }
}

extension Unions.SetDeviceTokenResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "deviceToken":
        if let value = try container.decode(Objects.DeviceToken?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.SetDeviceTokenErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    deviceToken = map["deviceToken"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.SetDeviceTokenResult {
  func on<Type>(setDeviceTokenError: Selection<Type, Objects.SetDeviceTokenError>, setDeviceTokenSuccess: Selection<Type, Objects.SetDeviceTokenSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SetDeviceTokenError", selection: setDeviceTokenError.selection), GraphQLField.fragment(type: "SetDeviceTokenSuccess", selection: setDeviceTokenSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setDeviceTokenError:
        let data = Objects.SetDeviceTokenError(errorCodes: data.errorCodes)
        return try setDeviceTokenError.decode(data: data)
      case .setDeviceTokenSuccess:
        let data = Objects.SetDeviceTokenSuccess(deviceToken: data.deviceToken)
        return try setDeviceTokenSuccess.decode(data: data)
      }
    case .mocking:
      return setDeviceTokenError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetDeviceTokenResult<T> = Selection<T, Unions.SetDeviceTokenResult>
}

extension Unions {
  struct SetFollowResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetFollowErrorCode]]
    let updatedUser: [String: Objects.User]

    enum TypeName: String, Codable {
      case setFollowError = "SetFollowError"
      case setFollowSuccess = "SetFollowSuccess"
    }
  }
}

extension Unions.SetFollowResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetFollowErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedUser":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    updatedUser = map["updatedUser"]
  }
}

extension Fields where TypeLock == Unions.SetFollowResult {
  func on<Type>(setFollowError: Selection<Type, Objects.SetFollowError>, setFollowSuccess: Selection<Type, Objects.SetFollowSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SetFollowError", selection: setFollowError.selection), GraphQLField.fragment(type: "SetFollowSuccess", selection: setFollowSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setFollowError:
        let data = Objects.SetFollowError(errorCodes: data.errorCodes)
        return try setFollowError.decode(data: data)
      case .setFollowSuccess:
        let data = Objects.SetFollowSuccess(updatedUser: data.updatedUser)
        return try setFollowSuccess.decode(data: data)
      }
    case .mocking:
      return setFollowError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetFollowResult<T> = Selection<T, Unions.SetFollowResult>
}

extension Unions {
  struct SetLabelsResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetLabelsErrorCode]]
    let labels: [String: [Objects.Label]]

    enum TypeName: String, Codable {
      case setLabelsError = "SetLabelsError"
      case setLabelsSuccess = "SetLabelsSuccess"
    }
  }
}

extension Unions.SetLabelsResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetLabelsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "labels":
        if let value = try container.decode([Objects.Label]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    labels = map["labels"]
  }
}

extension Fields where TypeLock == Unions.SetLabelsResult {
  func on<Type>(setLabelsError: Selection<Type, Objects.SetLabelsError>, setLabelsSuccess: Selection<Type, Objects.SetLabelsSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SetLabelsError", selection: setLabelsError.selection), GraphQLField.fragment(type: "SetLabelsSuccess", selection: setLabelsSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setLabelsError:
        let data = Objects.SetLabelsError(errorCodes: data.errorCodes)
        return try setLabelsError.decode(data: data)
      case .setLabelsSuccess:
        let data = Objects.SetLabelsSuccess(labels: data.labels)
        return try setLabelsSuccess.decode(data: data)
      }
    case .mocking:
      return setLabelsError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetLabelsResult<T> = Selection<T, Unions.SetLabelsResult>
}

extension Unions {
  struct SetShareArticleResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetShareArticleErrorCode]]
    let updatedArticle: [String: Objects.Article]
    let updatedFeedArticle: [String: Objects.FeedArticle]
    let updatedFeedArticleId: [String: String]

    enum TypeName: String, Codable {
      case setShareArticleError = "SetShareArticleError"
      case setShareArticleSuccess = "SetShareArticleSuccess"
    }
  }
}

extension Unions.SetShareArticleResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetShareArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedArticle":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedFeedArticle":
        if let value = try container.decode(Objects.FeedArticle?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedFeedArticleId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    updatedArticle = map["updatedArticle"]
    updatedFeedArticle = map["updatedFeedArticle"]
    updatedFeedArticleId = map["updatedFeedArticleId"]
  }
}

extension Fields where TypeLock == Unions.SetShareArticleResult {
  func on<Type>(setShareArticleError: Selection<Type, Objects.SetShareArticleError>, setShareArticleSuccess: Selection<Type, Objects.SetShareArticleSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SetShareArticleError", selection: setShareArticleError.selection), GraphQLField.fragment(type: "SetShareArticleSuccess", selection: setShareArticleSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setShareArticleError:
        let data = Objects.SetShareArticleError(errorCodes: data.errorCodes)
        return try setShareArticleError.decode(data: data)
      case .setShareArticleSuccess:
        let data = Objects.SetShareArticleSuccess(updatedArticle: data.updatedArticle, updatedFeedArticle: data.updatedFeedArticle, updatedFeedArticleId: data.updatedFeedArticleId)
        return try setShareArticleSuccess.decode(data: data)
      }
    case .mocking:
      return setShareArticleError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetShareArticleResult<T> = Selection<T, Unions.SetShareArticleResult>
}

extension Unions {
  struct SetShareHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetShareHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case setShareHighlightError = "SetShareHighlightError"
      case setShareHighlightSuccess = "SetShareHighlightSuccess"
    }
  }
}

extension Unions.SetShareHighlightResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetShareHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    highlight = map["highlight"]
  }
}

extension Fields where TypeLock == Unions.SetShareHighlightResult {
  func on<Type>(setShareHighlightError: Selection<Type, Objects.SetShareHighlightError>, setShareHighlightSuccess: Selection<Type, Objects.SetShareHighlightSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SetShareHighlightError", selection: setShareHighlightError.selection), GraphQLField.fragment(type: "SetShareHighlightSuccess", selection: setShareHighlightSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setShareHighlightError:
        let data = Objects.SetShareHighlightError(errorCodes: data.errorCodes)
        return try setShareHighlightError.decode(data: data)
      case .setShareHighlightSuccess:
        let data = Objects.SetShareHighlightSuccess(highlight: data.highlight)
        return try setShareHighlightSuccess.decode(data: data)
      }
    case .mocking:
      return setShareHighlightError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetShareHighlightResult<T> = Selection<T, Unions.SetShareHighlightResult>
}

extension Unions {
  struct SetUserPersonalizationResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetUserPersonalizationErrorCode]]
    let updatedUserPersonalization: [String: Objects.UserPersonalization]

    enum TypeName: String, Codable {
      case setUserPersonalizationError = "SetUserPersonalizationError"
      case setUserPersonalizationSuccess = "SetUserPersonalizationSuccess"
    }
  }
}

extension Unions.SetUserPersonalizationResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetUserPersonalizationErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedUserPersonalization":
        if let value = try container.decode(Objects.UserPersonalization?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    updatedUserPersonalization = map["updatedUserPersonalization"]
  }
}

extension Fields where TypeLock == Unions.SetUserPersonalizationResult {
  func on<Type>(setUserPersonalizationError: Selection<Type, Objects.SetUserPersonalizationError>, setUserPersonalizationSuccess: Selection<Type, Objects.SetUserPersonalizationSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SetUserPersonalizationError", selection: setUserPersonalizationError.selection), GraphQLField.fragment(type: "SetUserPersonalizationSuccess", selection: setUserPersonalizationSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setUserPersonalizationError:
        let data = Objects.SetUserPersonalizationError(errorCodes: data.errorCodes)
        return try setUserPersonalizationError.decode(data: data)
      case .setUserPersonalizationSuccess:
        let data = Objects.SetUserPersonalizationSuccess(updatedUserPersonalization: data.updatedUserPersonalization)
        return try setUserPersonalizationSuccess.decode(data: data)
      }
    case .mocking:
      return setUserPersonalizationError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetUserPersonalizationResult<T> = Selection<T, Unions.SetUserPersonalizationResult>
}

extension Unions {
  struct SetWebhookResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetWebhookErrorCode]]
    let webhook: [String: Objects.Webhook]

    enum TypeName: String, Codable {
      case setWebhookError = "SetWebhookError"
      case setWebhookSuccess = "SetWebhookSuccess"
    }
  }
}

extension Unions.SetWebhookResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SetWebhookErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "webhook":
        if let value = try container.decode(Objects.Webhook?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    webhook = map["webhook"]
  }
}

extension Fields where TypeLock == Unions.SetWebhookResult {
  func on<Type>(setWebhookError: Selection<Type, Objects.SetWebhookError>, setWebhookSuccess: Selection<Type, Objects.SetWebhookSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SetWebhookError", selection: setWebhookError.selection), GraphQLField.fragment(type: "SetWebhookSuccess", selection: setWebhookSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setWebhookError:
        let data = Objects.SetWebhookError(errorCodes: data.errorCodes)
        return try setWebhookError.decode(data: data)
      case .setWebhookSuccess:
        let data = Objects.SetWebhookSuccess(webhook: data.webhook)
        return try setWebhookSuccess.decode(data: data)
      }
    case .mocking:
      return setWebhookError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetWebhookResult<T> = Selection<T, Unions.SetWebhookResult>
}

extension Unions {
  struct SharedArticleResult {
    let __typename: TypeName
    let article: [String: Objects.Article]
    let errorCodes: [String: [Enums.SharedArticleErrorCode]]

    enum TypeName: String, Codable {
      case sharedArticleError = "SharedArticleError"
      case sharedArticleSuccess = "SharedArticleSuccess"
    }
  }
}

extension Unions.SharedArticleResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "article":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.SharedArticleErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    article = map["article"]
    errorCodes = map["errorCodes"]
  }
}

extension Fields where TypeLock == Unions.SharedArticleResult {
  func on<Type>(sharedArticleError: Selection<Type, Objects.SharedArticleError>, sharedArticleSuccess: Selection<Type, Objects.SharedArticleSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SharedArticleError", selection: sharedArticleError.selection), GraphQLField.fragment(type: "SharedArticleSuccess", selection: sharedArticleSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .sharedArticleError:
        let data = Objects.SharedArticleError(errorCodes: data.errorCodes)
        return try sharedArticleError.decode(data: data)
      case .sharedArticleSuccess:
        let data = Objects.SharedArticleSuccess(article: data.article)
        return try sharedArticleSuccess.decode(data: data)
      }
    case .mocking:
      return sharedArticleError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SharedArticleResult<T> = Selection<T, Unions.SharedArticleResult>
}

extension Unions {
  struct SubscribeResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SubscribeErrorCode]]
    let subscriptions: [String: [Objects.Subscription]]

    enum TypeName: String, Codable {
      case subscribeError = "SubscribeError"
      case subscribeSuccess = "SubscribeSuccess"
    }
  }
}

extension Unions.SubscribeResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SubscribeErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "subscriptions":
        if let value = try container.decode([Objects.Subscription]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    subscriptions = map["subscriptions"]
  }
}

extension Fields where TypeLock == Unions.SubscribeResult {
  func on<Type>(subscribeError: Selection<Type, Objects.SubscribeError>, subscribeSuccess: Selection<Type, Objects.SubscribeSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SubscribeError", selection: subscribeError.selection), GraphQLField.fragment(type: "SubscribeSuccess", selection: subscribeSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .subscribeError:
        let data = Objects.SubscribeError(errorCodes: data.errorCodes)
        return try subscribeError.decode(data: data)
      case .subscribeSuccess:
        let data = Objects.SubscribeSuccess(subscriptions: data.subscriptions)
        return try subscribeSuccess.decode(data: data)
      }
    case .mocking:
      return subscribeError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SubscribeResult<T> = Selection<T, Unions.SubscribeResult>
}

extension Unions {
  struct SubscriptionsResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SubscriptionsErrorCode]]
    let subscriptions: [String: [Objects.Subscription]]

    enum TypeName: String, Codable {
      case subscriptionsError = "SubscriptionsError"
      case subscriptionsSuccess = "SubscriptionsSuccess"
    }
  }
}

extension Unions.SubscriptionsResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.SubscriptionsErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "subscriptions":
        if let value = try container.decode([Objects.Subscription]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    subscriptions = map["subscriptions"]
  }
}

extension Fields where TypeLock == Unions.SubscriptionsResult {
  func on<Type>(subscriptionsError: Selection<Type, Objects.SubscriptionsError>, subscriptionsSuccess: Selection<Type, Objects.SubscriptionsSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "SubscriptionsError", selection: subscriptionsError.selection), GraphQLField.fragment(type: "SubscriptionsSuccess", selection: subscriptionsSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .subscriptionsError:
        let data = Objects.SubscriptionsError(errorCodes: data.errorCodes)
        return try subscriptionsError.decode(data: data)
      case .subscriptionsSuccess:
        let data = Objects.SubscriptionsSuccess(subscriptions: data.subscriptions)
        return try subscriptionsSuccess.decode(data: data)
      }
    case .mocking:
      return subscriptionsError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SubscriptionsResult<T> = Selection<T, Unions.SubscriptionsResult>
}

extension Unions {
  struct TypeaheadSearchResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.TypeaheadSearchErrorCode]]
    let items: [String: [Objects.TypeaheadSearchItem]]

    enum TypeName: String, Codable {
      case typeaheadSearchError = "TypeaheadSearchError"
      case typeaheadSearchSuccess = "TypeaheadSearchSuccess"
    }
  }
}

extension Unions.TypeaheadSearchResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.TypeaheadSearchErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "items":
        if let value = try container.decode([Objects.TypeaheadSearchItem]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    items = map["items"]
  }
}

extension Fields where TypeLock == Unions.TypeaheadSearchResult {
  func on<Type>(typeaheadSearchError: Selection<Type, Objects.TypeaheadSearchError>, typeaheadSearchSuccess: Selection<Type, Objects.TypeaheadSearchSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "TypeaheadSearchError", selection: typeaheadSearchError.selection), GraphQLField.fragment(type: "TypeaheadSearchSuccess", selection: typeaheadSearchSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .typeaheadSearchError:
        let data = Objects.TypeaheadSearchError(errorCodes: data.errorCodes)
        return try typeaheadSearchError.decode(data: data)
      case .typeaheadSearchSuccess:
        let data = Objects.TypeaheadSearchSuccess(items: data.items)
        return try typeaheadSearchSuccess.decode(data: data)
      }
    case .mocking:
      return typeaheadSearchError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias TypeaheadSearchResult<T> = Selection<T, Unions.TypeaheadSearchResult>
}

extension Unions {
  struct UnsubscribeResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UnsubscribeErrorCode]]
    let subscription: [String: Objects.Subscription]

    enum TypeName: String, Codable {
      case unsubscribeError = "UnsubscribeError"
      case unsubscribeSuccess = "UnsubscribeSuccess"
    }
  }
}

extension Unions.UnsubscribeResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UnsubscribeErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "subscription":
        if let value = try container.decode(Objects.Subscription?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    subscription = map["subscription"]
  }
}

extension Fields where TypeLock == Unions.UnsubscribeResult {
  func on<Type>(unsubscribeError: Selection<Type, Objects.UnsubscribeError>, unsubscribeSuccess: Selection<Type, Objects.UnsubscribeSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UnsubscribeError", selection: unsubscribeError.selection), GraphQLField.fragment(type: "UnsubscribeSuccess", selection: unsubscribeSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .unsubscribeError:
        let data = Objects.UnsubscribeError(errorCodes: data.errorCodes)
        return try unsubscribeError.decode(data: data)
      case .unsubscribeSuccess:
        let data = Objects.UnsubscribeSuccess(subscription: data.subscription)
        return try unsubscribeSuccess.decode(data: data)
      }
    case .mocking:
      return unsubscribeError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UnsubscribeResult<T> = Selection<T, Unions.UnsubscribeResult>
}

extension Unions {
  struct UpdateHighlightReplyResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateHighlightReplyErrorCode]]
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case updateHighlightReplyError = "UpdateHighlightReplyError"
      case updateHighlightReplySuccess = "UpdateHighlightReplySuccess"
    }
  }
}

extension Unions.UpdateHighlightReplyResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateHighlightReplyErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlightReply":
        if let value = try container.decode(Objects.HighlightReply?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    highlightReply = map["highlightReply"]
  }
}

extension Fields where TypeLock == Unions.UpdateHighlightReplyResult {
  func on<Type>(updateHighlightReplyError: Selection<Type, Objects.UpdateHighlightReplyError>, updateHighlightReplySuccess: Selection<Type, Objects.UpdateHighlightReplySuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateHighlightReplyError", selection: updateHighlightReplyError.selection), GraphQLField.fragment(type: "UpdateHighlightReplySuccess", selection: updateHighlightReplySuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateHighlightReplyError:
        let data = Objects.UpdateHighlightReplyError(errorCodes: data.errorCodes)
        return try updateHighlightReplyError.decode(data: data)
      case .updateHighlightReplySuccess:
        let data = Objects.UpdateHighlightReplySuccess(highlightReply: data.highlightReply)
        return try updateHighlightReplySuccess.decode(data: data)
      }
    case .mocking:
      return updateHighlightReplyError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateHighlightReplyResult<T> = Selection<T, Unions.UpdateHighlightReplyResult>
}

extension Unions {
  struct UpdateHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case updateHighlightError = "UpdateHighlightError"
      case updateHighlightSuccess = "UpdateHighlightSuccess"
    }
  }
}

extension Unions.UpdateHighlightResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateHighlightErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "highlight":
        if let value = try container.decode(Objects.Highlight?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    highlight = map["highlight"]
  }
}

extension Fields where TypeLock == Unions.UpdateHighlightResult {
  func on<Type>(updateHighlightError: Selection<Type, Objects.UpdateHighlightError>, updateHighlightSuccess: Selection<Type, Objects.UpdateHighlightSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateHighlightError", selection: updateHighlightError.selection), GraphQLField.fragment(type: "UpdateHighlightSuccess", selection: updateHighlightSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateHighlightError:
        let data = Objects.UpdateHighlightError(errorCodes: data.errorCodes)
        return try updateHighlightError.decode(data: data)
      case .updateHighlightSuccess:
        let data = Objects.UpdateHighlightSuccess(highlight: data.highlight)
        return try updateHighlightSuccess.decode(data: data)
      }
    case .mocking:
      return updateHighlightError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateHighlightResult<T> = Selection<T, Unions.UpdateHighlightResult>
}

extension Unions {
  struct UpdateLabelResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateLabelErrorCode]]
    let label: [String: Objects.Label]

    enum TypeName: String, Codable {
      case updateLabelError = "UpdateLabelError"
      case updateLabelSuccess = "UpdateLabelSuccess"
    }
  }
}

extension Unions.UpdateLabelResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateLabelErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "label":
        if let value = try container.decode(Objects.Label?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    label = map["label"]
  }
}

extension Fields where TypeLock == Unions.UpdateLabelResult {
  func on<Type>(updateLabelError: Selection<Type, Objects.UpdateLabelError>, updateLabelSuccess: Selection<Type, Objects.UpdateLabelSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateLabelError", selection: updateLabelError.selection), GraphQLField.fragment(type: "UpdateLabelSuccess", selection: updateLabelSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateLabelError:
        let data = Objects.UpdateLabelError(errorCodes: data.errorCodes)
        return try updateLabelError.decode(data: data)
      case .updateLabelSuccess:
        let data = Objects.UpdateLabelSuccess(label: data.label)
        return try updateLabelSuccess.decode(data: data)
      }
    case .mocking:
      return updateLabelError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateLabelResult<T> = Selection<T, Unions.UpdateLabelResult>
}

extension Unions {
  struct UpdateLinkShareInfoResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateLinkShareInfoErrorCode]]
    let message: [String: String]

    enum TypeName: String, Codable {
      case updateLinkShareInfoError = "UpdateLinkShareInfoError"
      case updateLinkShareInfoSuccess = "UpdateLinkShareInfoSuccess"
    }
  }
}

extension Unions.UpdateLinkShareInfoResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateLinkShareInfoErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "message":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    message = map["message"]
  }
}

extension Fields where TypeLock == Unions.UpdateLinkShareInfoResult {
  func on<Type>(updateLinkShareInfoError: Selection<Type, Objects.UpdateLinkShareInfoError>, updateLinkShareInfoSuccess: Selection<Type, Objects.UpdateLinkShareInfoSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateLinkShareInfoError", selection: updateLinkShareInfoError.selection), GraphQLField.fragment(type: "UpdateLinkShareInfoSuccess", selection: updateLinkShareInfoSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateLinkShareInfoError:
        let data = Objects.UpdateLinkShareInfoError(errorCodes: data.errorCodes)
        return try updateLinkShareInfoError.decode(data: data)
      case .updateLinkShareInfoSuccess:
        let data = Objects.UpdateLinkShareInfoSuccess(message: data.message)
        return try updateLinkShareInfoSuccess.decode(data: data)
      }
    case .mocking:
      return updateLinkShareInfoError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateLinkShareInfoResult<T> = Selection<T, Unions.UpdateLinkShareInfoResult>
}

extension Unions {
  struct UpdatePageResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdatePageErrorCode]]
    let updatedPage: [String: Objects.Article]

    enum TypeName: String, Codable {
      case updatePageError = "UpdatePageError"
      case updatePageSuccess = "UpdatePageSuccess"
    }
  }
}

extension Unions.UpdatePageResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdatePageErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "updatedPage":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    updatedPage = map["updatedPage"]
  }
}

extension Fields where TypeLock == Unions.UpdatePageResult {
  func on<Type>(updatePageError: Selection<Type, Objects.UpdatePageError>, updatePageSuccess: Selection<Type, Objects.UpdatePageSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdatePageError", selection: updatePageError.selection), GraphQLField.fragment(type: "UpdatePageSuccess", selection: updatePageSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updatePageError:
        let data = Objects.UpdatePageError(errorCodes: data.errorCodes)
        return try updatePageError.decode(data: data)
      case .updatePageSuccess:
        let data = Objects.UpdatePageSuccess(updatedPage: data.updatedPage)
        return try updatePageSuccess.decode(data: data)
      }
    case .mocking:
      return updatePageError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdatePageResult<T> = Selection<T, Unions.UpdatePageResult>
}

extension Unions {
  struct UpdateReminderResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateReminderErrorCode]]
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case updateReminderError = "UpdateReminderError"
      case updateReminderSuccess = "UpdateReminderSuccess"
    }
  }
}

extension Unions.UpdateReminderResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateReminderErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "reminder":
        if let value = try container.decode(Objects.Reminder?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    reminder = map["reminder"]
  }
}

extension Fields where TypeLock == Unions.UpdateReminderResult {
  func on<Type>(updateReminderError: Selection<Type, Objects.UpdateReminderError>, updateReminderSuccess: Selection<Type, Objects.UpdateReminderSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateReminderError", selection: updateReminderError.selection), GraphQLField.fragment(type: "UpdateReminderSuccess", selection: updateReminderSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateReminderError:
        let data = Objects.UpdateReminderError(errorCodes: data.errorCodes)
        return try updateReminderError.decode(data: data)
      case .updateReminderSuccess:
        let data = Objects.UpdateReminderSuccess(reminder: data.reminder)
        return try updateReminderSuccess.decode(data: data)
      }
    case .mocking:
      return updateReminderError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateReminderResult<T> = Selection<T, Unions.UpdateReminderResult>
}

extension Unions {
  struct UpdateSharedCommentResult {
    let __typename: TypeName
    let articleId: [String: String]
    let errorCodes: [String: [Enums.UpdateSharedCommentErrorCode]]
    let sharedComment: [String: String]

    enum TypeName: String, Codable {
      case updateSharedCommentError = "UpdateSharedCommentError"
      case updateSharedCommentSuccess = "UpdateSharedCommentSuccess"
    }
  }
}

extension Unions.UpdateSharedCommentResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "articleId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateSharedCommentErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "sharedComment":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    articleId = map["articleId"]
    errorCodes = map["errorCodes"]
    sharedComment = map["sharedComment"]
  }
}

extension Fields where TypeLock == Unions.UpdateSharedCommentResult {
  func on<Type>(updateSharedCommentError: Selection<Type, Objects.UpdateSharedCommentError>, updateSharedCommentSuccess: Selection<Type, Objects.UpdateSharedCommentSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateSharedCommentError", selection: updateSharedCommentError.selection), GraphQLField.fragment(type: "UpdateSharedCommentSuccess", selection: updateSharedCommentSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateSharedCommentError:
        let data = Objects.UpdateSharedCommentError(errorCodes: data.errorCodes)
        return try updateSharedCommentError.decode(data: data)
      case .updateSharedCommentSuccess:
        let data = Objects.UpdateSharedCommentSuccess(articleId: data.articleId, sharedComment: data.sharedComment)
        return try updateSharedCommentSuccess.decode(data: data)
      }
    case .mocking:
      return updateSharedCommentError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateSharedCommentResult<T> = Selection<T, Unions.UpdateSharedCommentResult>
}

extension Unions {
  struct UpdateUserProfileResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateUserProfileErrorCode]]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case updateUserProfileError = "UpdateUserProfileError"
      case updateUserProfileSuccess = "UpdateUserProfileSuccess"
    }
  }
}

extension Unions.UpdateUserProfileResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateUserProfileErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    user = map["user"]
  }
}

extension Fields where TypeLock == Unions.UpdateUserProfileResult {
  func on<Type>(updateUserProfileError: Selection<Type, Objects.UpdateUserProfileError>, updateUserProfileSuccess: Selection<Type, Objects.UpdateUserProfileSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateUserProfileError", selection: updateUserProfileError.selection), GraphQLField.fragment(type: "UpdateUserProfileSuccess", selection: updateUserProfileSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateUserProfileError:
        let data = Objects.UpdateUserProfileError(errorCodes: data.errorCodes)
        return try updateUserProfileError.decode(data: data)
      case .updateUserProfileSuccess:
        let data = Objects.UpdateUserProfileSuccess(user: data.user)
        return try updateUserProfileSuccess.decode(data: data)
      }
    case .mocking:
      return updateUserProfileError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateUserProfileResult<T> = Selection<T, Unions.UpdateUserProfileResult>
}

extension Unions {
  struct UpdateUserResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateUserErrorCode]]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case updateUserError = "UpdateUserError"
      case updateUserSuccess = "UpdateUserSuccess"
    }
  }
}

extension Unions.UpdateUserResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UpdateUserErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    user = map["user"]
  }
}

extension Fields where TypeLock == Unions.UpdateUserResult {
  func on<Type>(updateUserError: Selection<Type, Objects.UpdateUserError>, updateUserSuccess: Selection<Type, Objects.UpdateUserSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateUserError", selection: updateUserError.selection), GraphQLField.fragment(type: "UpdateUserSuccess", selection: updateUserSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateUserError:
        let data = Objects.UpdateUserError(errorCodes: data.errorCodes)
        return try updateUserError.decode(data: data)
      case .updateUserSuccess:
        let data = Objects.UpdateUserSuccess(user: data.user)
        return try updateUserSuccess.decode(data: data)
      }
    case .mocking:
      return updateUserError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateUserResult<T> = Selection<T, Unions.UpdateUserResult>
}

extension Unions {
  struct UpdatesSinceResult {
    let __typename: TypeName
    let edges: [String: [Objects.SyncUpdatedItemEdge]]
    let errorCodes: [String: [Enums.UpdatesSinceErrorCode]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case updatesSinceError = "UpdatesSinceError"
      case updatesSinceSuccess = "UpdatesSinceSuccess"
    }
  }
}

extension Unions.UpdatesSinceResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "edges":
        if let value = try container.decode([Objects.SyncUpdatedItemEdge]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.UpdatesSinceErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "pageInfo":
        if let value = try container.decode(Objects.PageInfo?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    edges = map["edges"]
    errorCodes = map["errorCodes"]
    pageInfo = map["pageInfo"]
  }
}

extension Fields where TypeLock == Unions.UpdatesSinceResult {
  func on<Type>(updatesSinceError: Selection<Type, Objects.UpdatesSinceError>, updatesSinceSuccess: Selection<Type, Objects.UpdatesSinceSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdatesSinceError", selection: updatesSinceError.selection), GraphQLField.fragment(type: "UpdatesSinceSuccess", selection: updatesSinceSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updatesSinceError:
        let data = Objects.UpdatesSinceError(errorCodes: data.errorCodes)
        return try updatesSinceError.decode(data: data)
      case .updatesSinceSuccess:
        let data = Objects.UpdatesSinceSuccess(edges: data.edges, pageInfo: data.pageInfo)
        return try updatesSinceSuccess.decode(data: data)
      }
    case .mocking:
      return updatesSinceError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdatesSinceResult<T> = Selection<T, Unions.UpdatesSinceResult>
}

extension Unions {
  struct UploadFileRequestResult {
    let __typename: TypeName
    let createdPageId: [String: String]
    let errorCodes: [String: [Enums.UploadFileRequestErrorCode]]
    let id: [String: String]
    let uploadFileId: [String: String]
    let uploadSignedUrl: [String: String]

    enum TypeName: String, Codable {
      case uploadFileRequestError = "UploadFileRequestError"
      case uploadFileRequestSuccess = "UploadFileRequestSuccess"
    }
  }
}

extension Unions.UploadFileRequestResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "createdPageId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "errorCodes":
        if let value = try container.decode([Enums.UploadFileRequestErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "id":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "uploadFileId":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "uploadSignedUrl":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    createdPageId = map["createdPageId"]
    errorCodes = map["errorCodes"]
    id = map["id"]
    uploadFileId = map["uploadFileId"]
    uploadSignedUrl = map["uploadSignedUrl"]
  }
}

extension Fields where TypeLock == Unions.UploadFileRequestResult {
  func on<Type>(uploadFileRequestError: Selection<Type, Objects.UploadFileRequestError>, uploadFileRequestSuccess: Selection<Type, Objects.UploadFileRequestSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UploadFileRequestError", selection: uploadFileRequestError.selection), GraphQLField.fragment(type: "UploadFileRequestSuccess", selection: uploadFileRequestSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .uploadFileRequestError:
        let data = Objects.UploadFileRequestError(errorCodes: data.errorCodes)
        return try uploadFileRequestError.decode(data: data)
      case .uploadFileRequestSuccess:
        let data = Objects.UploadFileRequestSuccess(createdPageId: data.createdPageId, id: data.id, uploadFileId: data.uploadFileId, uploadSignedUrl: data.uploadSignedUrl)
        return try uploadFileRequestSuccess.decode(data: data)
      }
    case .mocking:
      return uploadFileRequestError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UploadFileRequestResult<T> = Selection<T, Unions.UploadFileRequestResult>
}

extension Unions {
  struct UserResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UserErrorCode]]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case userError = "UserError"
      case userSuccess = "UserSuccess"
    }
  }
}

extension Unions.UserResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UserErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "user":
        if let value = try container.decode(Objects.User?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    user = map["user"]
  }
}

extension Fields where TypeLock == Unions.UserResult {
  func on<Type>(userError: Selection<Type, Objects.UserError>, userSuccess: Selection<Type, Objects.UserSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UserError", selection: userError.selection), GraphQLField.fragment(type: "UserSuccess", selection: userSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .userError:
        let data = Objects.UserError(errorCodes: data.errorCodes)
        return try userError.decode(data: data)
      case .userSuccess:
        let data = Objects.UserSuccess(user: data.user)
        return try userSuccess.decode(data: data)
      }
    case .mocking:
      return userError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UserResult<T> = Selection<T, Unions.UserResult>
}

extension Unions {
  struct UsersResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UsersErrorCode]]
    let users: [String: [Objects.User]]

    enum TypeName: String, Codable {
      case usersError = "UsersError"
      case usersSuccess = "UsersSuccess"
    }
  }
}

extension Unions.UsersResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.UsersErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "users":
        if let value = try container.decode([Objects.User]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    users = map["users"]
  }
}

extension Fields where TypeLock == Unions.UsersResult {
  func on<Type>(usersError: Selection<Type, Objects.UsersError>, usersSuccess: Selection<Type, Objects.UsersSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "UsersError", selection: usersError.selection), GraphQLField.fragment(type: "UsersSuccess", selection: usersSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .usersError:
        let data = Objects.UsersError(errorCodes: data.errorCodes)
        return try usersError.decode(data: data)
      case .usersSuccess:
        let data = Objects.UsersSuccess(users: data.users)
        return try usersSuccess.decode(data: data)
      }
    case .mocking:
      return usersError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UsersResult<T> = Selection<T, Unions.UsersResult>
}

extension Unions {
  struct WebhookResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.WebhookErrorCode]]
    let webhook: [String: Objects.Webhook]

    enum TypeName: String, Codable {
      case webhookError = "WebhookError"
      case webhookSuccess = "WebhookSuccess"
    }
  }
}

extension Unions.WebhookResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.WebhookErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "webhook":
        if let value = try container.decode(Objects.Webhook?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    webhook = map["webhook"]
  }
}

extension Fields where TypeLock == Unions.WebhookResult {
  func on<Type>(webhookError: Selection<Type, Objects.WebhookError>, webhookSuccess: Selection<Type, Objects.WebhookSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "WebhookError", selection: webhookError.selection), GraphQLField.fragment(type: "WebhookSuccess", selection: webhookSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .webhookError:
        let data = Objects.WebhookError(errorCodes: data.errorCodes)
        return try webhookError.decode(data: data)
      case .webhookSuccess:
        let data = Objects.WebhookSuccess(webhook: data.webhook)
        return try webhookSuccess.decode(data: data)
      }
    case .mocking:
      return webhookError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias WebhookResult<T> = Selection<T, Unions.WebhookResult>
}

extension Unions {
  struct WebhooksResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.WebhooksErrorCode]]
    let webhooks: [String: [Objects.Webhook]]

    enum TypeName: String, Codable {
      case webhooksError = "WebhooksError"
      case webhooksSuccess = "WebhooksSuccess"
    }
  }
}

extension Unions.WebhooksResult: Decodable {
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

    var map = HashMap()
    for codingKey in container.allKeys {
      if codingKey.isTypenameKey { continue }

      let alias = codingKey.stringValue
      let field = GraphQLField.getFieldNameFromAlias(alias)

      switch field {
      case "errorCodes":
        if let value = try container.decode([Enums.WebhooksErrorCode]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "webhooks":
        if let value = try container.decode([Objects.Webhook]?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      default:
        throw DecodingError.dataCorrupted(
          DecodingError.Context(
            codingPath: decoder.codingPath,
            debugDescription: "Unknown key \(field)."
          )
        )
      }
    }

    __typename = try container.decode(TypeName.self, forKey: DynamicCodingKeys(stringValue: "__typename")!)

    errorCodes = map["errorCodes"]
    webhooks = map["webhooks"]
  }
}

extension Fields where TypeLock == Unions.WebhooksResult {
  func on<Type>(webhooksError: Selection<Type, Objects.WebhooksError>, webhooksSuccess: Selection<Type, Objects.WebhooksSuccess>) throws -> Type {
    select([GraphQLField.fragment(type: "WebhooksError", selection: webhooksError.selection), GraphQLField.fragment(type: "WebhooksSuccess", selection: webhooksSuccess.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .webhooksError:
        let data = Objects.WebhooksError(errorCodes: data.errorCodes)
        return try webhooksError.decode(data: data)
      case .webhooksSuccess:
        let data = Objects.WebhooksSuccess(webhooks: data.webhooks)
        return try webhooksSuccess.decode(data: data)
      }
    case .mocking:
      return webhooksError.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias WebhooksResult<T> = Selection<T, Unions.WebhooksResult>
}

// MARK: - Enums

enum Enums {}
extension Enums {
  /// AddPopularReadErrorCode
  enum AddPopularReadErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// ApiKeysErrorCode
  enum ApiKeysErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// ArchiveLinkErrorCode
  enum ArchiveLinkErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// ArticleErrorCode
  enum ArticleErrorCode: String, CaseIterable, Codable {
    case badData = "BAD_DATA"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// ArticleSavingRequestErrorCode
  enum ArticleSavingRequestErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// ArticleSavingRequestStatus
  enum ArticleSavingRequestStatus: String, CaseIterable, Codable {
    case deleted = "DELETED"

    case failed = "FAILED"

    case processing = "PROCESSING"

    case succeeded = "SUCCEEDED"
  }
}

extension Enums {
  /// ArticlesErrorCode
  enum ArticlesErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// ContentReader
  enum ContentReader: String, CaseIterable, Codable {
    case pdf = "PDF"

    case web = "WEB"
  }
}

extension Enums {
  /// CreateArticleErrorCode
  enum CreateArticleErrorCode: String, CaseIterable, Codable {
    case elasticError = "ELASTIC_ERROR"

    case notAllowedToParse = "NOT_ALLOWED_TO_PARSE"

    case payloadTooLarge = "PAYLOAD_TOO_LARGE"

    case unableToFetch = "UNABLE_TO_FETCH"

    case unableToParse = "UNABLE_TO_PARSE"

    case unauthorized = "UNAUTHORIZED"

    case uploadFileMissing = "UPLOAD_FILE_MISSING"
  }
}

extension Enums {
  /// CreateArticleSavingRequestErrorCode
  enum CreateArticleSavingRequestErrorCode: String, CaseIterable, Codable {
    case badData = "BAD_DATA"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// CreateHighlightErrorCode
  enum CreateHighlightErrorCode: String, CaseIterable, Codable {
    case alreadyExists = "ALREADY_EXISTS"

    case badData = "BAD_DATA"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// CreateHighlightReplyErrorCode
  enum CreateHighlightReplyErrorCode: String, CaseIterable, Codable {
    case emptyAnnotation = "EMPTY_ANNOTATION"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// CreateLabelErrorCode
  enum CreateLabelErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case labelAlreadyExists = "LABEL_ALREADY_EXISTS"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// CreateNewsletterEmailErrorCode
  enum CreateNewsletterEmailErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// CreateReactionErrorCode
  enum CreateReactionErrorCode: String, CaseIterable, Codable {
    case badCode = "BAD_CODE"

    case badTarget = "BAD_TARGET"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// CreateReminderErrorCode
  enum CreateReminderErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// DeleteAccountErrorCode
  enum DeleteAccountErrorCode: String, CaseIterable, Codable {
    case forbidden = "FORBIDDEN"

    case unauthorized = "UNAUTHORIZED"

    case userNotFound = "USER_NOT_FOUND"
  }
}

extension Enums {
  /// DeleteHighlightErrorCode
  enum DeleteHighlightErrorCode: String, CaseIterable, Codable {
    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// DeleteHighlightReplyErrorCode
  enum DeleteHighlightReplyErrorCode: String, CaseIterable, Codable {
    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// DeleteLabelErrorCode
  enum DeleteLabelErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// DeleteNewsletterEmailErrorCode
  enum DeleteNewsletterEmailErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// DeleteReactionErrorCode
  enum DeleteReactionErrorCode: String, CaseIterable, Codable {
    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// DeleteReminderErrorCode
  enum DeleteReminderErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// DeleteWebhookErrorCode
  enum DeleteWebhookErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// FeedArticlesErrorCode
  enum FeedArticlesErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// GenerateApiKeyErrorCode
  enum GenerateApiKeyErrorCode: String, CaseIterable, Codable {
    case alreadyExists = "ALREADY_EXISTS"

    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// GetFollowersErrorCode
  enum GetFollowersErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// GetFollowingErrorCode
  enum GetFollowingErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// GetUserPersonalizationErrorCode
  enum GetUserPersonalizationErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// LabelsErrorCode
  enum LabelsErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// LogOutErrorCode
  enum LogOutErrorCode: String, CaseIterable, Codable {
    case logOutFailed = "LOG_OUT_FAILED"
  }
}

extension Enums {
  /// LoginErrorCode
  enum LoginErrorCode: String, CaseIterable, Codable {
    case accessDenied = "ACCESS_DENIED"

    case authFailed = "AUTH_FAILED"

    case invalidCredentials = "INVALID_CREDENTIALS"

    case userAlreadyExists = "USER_ALREADY_EXISTS"

    case userNotFound = "USER_NOT_FOUND"

    case wrongSource = "WRONG_SOURCE"
  }
}

extension Enums {
  /// MergeHighlightErrorCode
  enum MergeHighlightErrorCode: String, CaseIterable, Codable {
    case alreadyExists = "ALREADY_EXISTS"

    case badData = "BAD_DATA"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// NewsletterEmailsErrorCode
  enum NewsletterEmailsErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// PageType
  enum PageType: String, CaseIterable, Codable {
    case article = "ARTICLE"

    case book = "BOOK"

    case file = "FILE"

    case highlights = "HIGHLIGHTS"

    case profile = "PROFILE"

    case unknown = "UNKNOWN"

    case website = "WEBSITE"
  }
}

extension Enums {
  /// ReactionType
  enum ReactionType: String, CaseIterable, Codable {
    case crying = "CRYING"

    case heart = "HEART"

    case hushed = "HUSHED"

    case like = "LIKE"

    case pout = "POUT"

    case smile = "SMILE"
  }
}

extension Enums {
  /// ReminderErrorCode
  enum ReminderErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// ReportType
  enum ReportType: String, CaseIterable, Codable {
    case abusive = "ABUSIVE"

    case contentDisplay = "CONTENT_DISPLAY"

    case contentViolation = "CONTENT_VIOLATION"

    case spam = "SPAM"
  }
}

extension Enums {
  /// RevokeApiKeyErrorCode
  enum RevokeApiKeyErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SaveArticleReadingProgressErrorCode
  enum SaveArticleReadingProgressErrorCode: String, CaseIterable, Codable {
    case badData = "BAD_DATA"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SaveErrorCode
  enum SaveErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case unknown = "UNKNOWN"
  }
}

extension Enums {
  /// SearchErrorCode
  enum SearchErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SendInstallInstructionsErrorCode
  enum SendInstallInstructionsErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SetBookmarkArticleErrorCode
  enum SetBookmarkArticleErrorCode: String, CaseIterable, Codable {
    case bookmarkExists = "BOOKMARK_EXISTS"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// SetDeviceTokenErrorCode
  enum SetDeviceTokenErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SetFollowErrorCode
  enum SetFollowErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SetLabelsErrorCode
  enum SetLabelsErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SetShareArticleErrorCode
  enum SetShareArticleErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SetShareHighlightErrorCode
  enum SetShareHighlightErrorCode: String, CaseIterable, Codable {
    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SetUserPersonalizationErrorCode
  enum SetUserPersonalizationErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SetWebhookErrorCode
  enum SetWebhookErrorCode: String, CaseIterable, Codable {
    case alreadyExists = "ALREADY_EXISTS"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SharedArticleErrorCode
  enum SharedArticleErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// SignupErrorCode
  enum SignupErrorCode: String, CaseIterable, Codable {
    case accessDenied = "ACCESS_DENIED"

    case expiredToken = "EXPIRED_TOKEN"

    case googleAuthError = "GOOGLE_AUTH_ERROR"

    case invalidEmail = "INVALID_EMAIL"

    case invalidPassword = "INVALID_PASSWORD"

    case invalidUsername = "INVALID_USERNAME"

    case unknown = "UNKNOWN"

    case userExists = "USER_EXISTS"
  }
}

extension Enums {
  /// SortBy
  enum SortBy: String, CaseIterable, Codable {
    case publishedAt = "PUBLISHED_AT"

    case savedAt = "SAVED_AT"

    case score = "SCORE"

    case updatedTime = "UPDATED_TIME"
  }
}

extension Enums {
  /// SortOrder
  enum SortOrder: String, CaseIterable, Codable {
    case ascending = "ASCENDING"

    case descending = "DESCENDING"
  }
}

extension Enums {
  /// SubscribeErrorCode
  enum SubscribeErrorCode: String, CaseIterable, Codable {
    case alreadySubscribed = "ALREADY_SUBSCRIBED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SubscriptionStatus
  enum SubscriptionStatus: String, CaseIterable, Codable {
    case active = "ACTIVE"

    case deleted = "DELETED"

    case unsubscribed = "UNSUBSCRIBED"
  }
}

extension Enums {
  /// SubscriptionsErrorCode
  enum SubscriptionsErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// TypeaheadSearchErrorCode
  enum TypeaheadSearchErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UnsubscribeErrorCode
  enum UnsubscribeErrorCode: String, CaseIterable, Codable {
    case alreadyUnsubscribed = "ALREADY_UNSUBSCRIBED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"

    case unsubscribeMethodNotFound = "UNSUBSCRIBE_METHOD_NOT_FOUND"
  }
}

extension Enums {
  /// UpdateHighlightErrorCode
  enum UpdateHighlightErrorCode: String, CaseIterable, Codable {
    case badData = "BAD_DATA"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UpdateHighlightReplyErrorCode
  enum UpdateHighlightReplyErrorCode: String, CaseIterable, Codable {
    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UpdateLabelErrorCode
  enum UpdateLabelErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UpdateLinkShareInfoErrorCode
  enum UpdateLinkShareInfoErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UpdatePageErrorCode
  enum UpdatePageErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"

    case updateFailed = "UPDATE_FAILED"
  }
}

extension Enums {
  /// UpdateReason
  enum UpdateReason: String, CaseIterable, Codable {
    case created = "CREATED"

    case deleted = "DELETED"

    case updated = "UPDATED"
  }
}

extension Enums {
  /// UpdateReminderErrorCode
  enum UpdateReminderErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UpdateSharedCommentErrorCode
  enum UpdateSharedCommentErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UpdateUserErrorCode
  enum UpdateUserErrorCode: String, CaseIterable, Codable {
    case bioTooLong = "BIO_TOO_LONG"

    case emptyName = "EMPTY_NAME"

    case unauthorized = "UNAUTHORIZED"

    case userNotFound = "USER_NOT_FOUND"
  }
}

extension Enums {
  /// UpdateUserProfileErrorCode
  enum UpdateUserProfileErrorCode: String, CaseIterable, Codable {
    case badData = "BAD_DATA"

    case badUsername = "BAD_USERNAME"

    case forbidden = "FORBIDDEN"

    case unauthorized = "UNAUTHORIZED"

    case usernameExists = "USERNAME_EXISTS"
  }
}

extension Enums {
  /// UpdatesSinceErrorCode
  enum UpdatesSinceErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UploadFileRequestErrorCode
  enum UploadFileRequestErrorCode: String, CaseIterable, Codable {
    case badInput = "BAD_INPUT"

    case failedCreate = "FAILED_CREATE"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UploadFileStatus
  enum UploadFileStatus: String, CaseIterable, Codable {
    case completed = "COMPLETED"

    case initialized = "INITIALIZED"
  }
}

extension Enums {
  /// UserErrorCode
  enum UserErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"

    case userNotFound = "USER_NOT_FOUND"
  }
}

extension Enums {
  /// UsersErrorCode
  enum UsersErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// WebhookErrorCode
  enum WebhookErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// WebhookEvent
  enum WebhookEvent: String, CaseIterable, Codable {
    case highlightCreated = "HIGHLIGHT_CREATED"

    case highlightDeleted = "HIGHLIGHT_DELETED"

    case highlightUpdated = "HIGHLIGHT_UPDATED"

    case labelCreated = "LABEL_CREATED"

    case labelDeleted = "LABEL_DELETED"

    case labelUpdated = "LABEL_UPDATED"

    case pageCreated = "PAGE_CREATED"

    case pageDeleted = "PAGE_DELETED"

    case pageUpdated = "PAGE_UPDATED"
  }
}

extension Enums {
  /// WebhooksErrorCode
  enum WebhooksErrorCode: String, CaseIterable, Codable {
    case badRequest = "BAD_REQUEST"

    case unauthorized = "UNAUTHORIZED"
  }
}

// MARK: - Input Objects

enum InputObjects {}
extension InputObjects {
  struct ArchiveLinkInput: Encodable, Hashable {
    var archived: Bool

    var linkId: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(archived, forKey: .archived)
      try container.encode(linkId, forKey: .linkId)
    }

    enum CodingKeys: String, CodingKey {
      case archived
      case linkId
    }
  }
}

extension InputObjects {
  struct ArticleHighlightsInput: Encodable, Hashable {
    var includeFriends: OptionalArgument<Bool> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if includeFriends.hasValue { try container.encode(includeFriends, forKey: .includeFriends) }
    }

    enum CodingKeys: String, CodingKey {
      case includeFriends
    }
  }
}

extension InputObjects {
  struct CreateArticleInput: Encodable, Hashable {
    var articleSavingRequestId: OptionalArgument<String> = .absent()

    var preparedDocument: OptionalArgument<InputObjects.PreparedDocumentInput> = .absent()

    var skipParsing: OptionalArgument<Bool> = .absent()

    var source: OptionalArgument<String> = .absent()

    var uploadFileId: OptionalArgument<String> = .absent()

    var url: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if articleSavingRequestId.hasValue { try container.encode(articleSavingRequestId, forKey: .articleSavingRequestId) }
      if preparedDocument.hasValue { try container.encode(preparedDocument, forKey: .preparedDocument) }
      if skipParsing.hasValue { try container.encode(skipParsing, forKey: .skipParsing) }
      if source.hasValue { try container.encode(source, forKey: .source) }
      if uploadFileId.hasValue { try container.encode(uploadFileId, forKey: .uploadFileId) }
      try container.encode(url, forKey: .url)
    }

    enum CodingKeys: String, CodingKey {
      case articleSavingRequestId
      case preparedDocument
      case skipParsing
      case source
      case uploadFileId
      case url
    }
  }
}

extension InputObjects {
  struct CreateArticleSavingRequestInput: Encodable, Hashable {
    var url: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(url, forKey: .url)
    }

    enum CodingKeys: String, CodingKey {
      case url
    }
  }
}

extension InputObjects {
  struct CreateHighlightInput: Encodable, Hashable {
    var annotation: OptionalArgument<String> = .absent()

    var articleId: String

    var id: String

    var patch: String

    var prefix: OptionalArgument<String> = .absent()

    var quote: String

    var sharedAt: OptionalArgument<DateTime> = .absent()

    var shortId: String

    var suffix: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if annotation.hasValue { try container.encode(annotation, forKey: .annotation) }
      try container.encode(articleId, forKey: .articleId)
      try container.encode(id, forKey: .id)
      try container.encode(patch, forKey: .patch)
      if prefix.hasValue { try container.encode(prefix, forKey: .prefix) }
      try container.encode(quote, forKey: .quote)
      if sharedAt.hasValue { try container.encode(sharedAt, forKey: .sharedAt) }
      try container.encode(shortId, forKey: .shortId)
      if suffix.hasValue { try container.encode(suffix, forKey: .suffix) }
    }

    enum CodingKeys: String, CodingKey {
      case annotation
      case articleId
      case id
      case patch
      case prefix
      case quote
      case sharedAt
      case shortId
      case suffix
    }
  }
}

extension InputObjects {
  struct CreateHighlightReplyInput: Encodable, Hashable {
    var highlightId: String

    var text: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(highlightId, forKey: .highlightId)
      try container.encode(text, forKey: .text)
    }

    enum CodingKeys: String, CodingKey {
      case highlightId
      case text
    }
  }
}

extension InputObjects {
  struct CreateLabelInput: Encodable, Hashable {
    var color: String

    var description: OptionalArgument<String> = .absent()

    var name: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(color, forKey: .color)
      if description.hasValue { try container.encode(description, forKey: .description) }
      try container.encode(name, forKey: .name)
    }

    enum CodingKeys: String, CodingKey {
      case color
      case description
      case name
    }
  }
}

extension InputObjects {
  struct CreateReactionInput: Encodable, Hashable {
    var code: Enums.ReactionType

    var highlightId: OptionalArgument<String> = .absent()

    var userArticleId: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(code, forKey: .code)
      if highlightId.hasValue { try container.encode(highlightId, forKey: .highlightId) }
      if userArticleId.hasValue { try container.encode(userArticleId, forKey: .userArticleId) }
    }

    enum CodingKeys: String, CodingKey {
      case code
      case highlightId
      case userArticleId
    }
  }
}

extension InputObjects {
  struct CreateReminderInput: Encodable, Hashable {
    var archiveUntil: Bool

    var clientRequestId: OptionalArgument<String> = .absent()

    var linkId: OptionalArgument<String> = .absent()

    var remindAt: DateTime

    var sendNotification: Bool

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(archiveUntil, forKey: .archiveUntil)
      if clientRequestId.hasValue { try container.encode(clientRequestId, forKey: .clientRequestId) }
      if linkId.hasValue { try container.encode(linkId, forKey: .linkId) }
      try container.encode(remindAt, forKey: .remindAt)
      try container.encode(sendNotification, forKey: .sendNotification)
    }

    enum CodingKeys: String, CodingKey {
      case archiveUntil
      case clientRequestId
      case linkId
      case remindAt
      case sendNotification
    }
  }
}

extension InputObjects {
  struct GenerateApiKeyInput: Encodable, Hashable {
    var expiresAt: DateTime

    var name: String

    var scopes: OptionalArgument<[String]> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(expiresAt, forKey: .expiresAt)
      try container.encode(name, forKey: .name)
      if scopes.hasValue { try container.encode(scopes, forKey: .scopes) }
    }

    enum CodingKeys: String, CodingKey {
      case expiresAt
      case name
      case scopes
    }
  }
}

extension InputObjects {
  struct GoogleLoginInput: Encodable, Hashable {
    var email: String

    var secret: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(email, forKey: .email)
      try container.encode(secret, forKey: .secret)
    }

    enum CodingKeys: String, CodingKey {
      case email
      case secret
    }
  }
}

extension InputObjects {
  struct GoogleSignupInput: Encodable, Hashable {
    var bio: OptionalArgument<String> = .absent()

    var email: String

    var name: String

    var pictureUrl: String

    var secret: String

    var sourceUserId: String

    var username: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if bio.hasValue { try container.encode(bio, forKey: .bio) }
      try container.encode(email, forKey: .email)
      try container.encode(name, forKey: .name)
      try container.encode(pictureUrl, forKey: .pictureUrl)
      try container.encode(secret, forKey: .secret)
      try container.encode(sourceUserId, forKey: .sourceUserId)
      try container.encode(username, forKey: .username)
    }

    enum CodingKeys: String, CodingKey {
      case bio
      case email
      case name
      case pictureUrl
      case secret
      case sourceUserId
      case username
    }
  }
}

extension InputObjects {
  struct MergeHighlightInput: Encodable, Hashable {
    var annotation: OptionalArgument<String> = .absent()

    var articleId: String

    var id: String

    var overlapHighlightIdList: [String]

    var patch: String

    var prefix: OptionalArgument<String> = .absent()

    var quote: String

    var shortId: String

    var suffix: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if annotation.hasValue { try container.encode(annotation, forKey: .annotation) }
      try container.encode(articleId, forKey: .articleId)
      try container.encode(id, forKey: .id)
      try container.encode(overlapHighlightIdList, forKey: .overlapHighlightIdList)
      try container.encode(patch, forKey: .patch)
      if prefix.hasValue { try container.encode(prefix, forKey: .prefix) }
      try container.encode(quote, forKey: .quote)
      try container.encode(shortId, forKey: .shortId)
      if suffix.hasValue { try container.encode(suffix, forKey: .suffix) }
    }

    enum CodingKeys: String, CodingKey {
      case annotation
      case articleId
      case id
      case overlapHighlightIdList
      case patch
      case prefix
      case quote
      case shortId
      case suffix
    }
  }
}

extension InputObjects {
  struct PageInfoInput: Encodable, Hashable {
    var author: OptionalArgument<String> = .absent()

    var canonicalUrl: OptionalArgument<String> = .absent()

    var contentType: OptionalArgument<String> = .absent()

    var description: OptionalArgument<String> = .absent()

    var previewImage: OptionalArgument<String> = .absent()

    var publishedAt: OptionalArgument<DateTime> = .absent()

    var title: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if author.hasValue { try container.encode(author, forKey: .author) }
      if canonicalUrl.hasValue { try container.encode(canonicalUrl, forKey: .canonicalUrl) }
      if contentType.hasValue { try container.encode(contentType, forKey: .contentType) }
      if description.hasValue { try container.encode(description, forKey: .description) }
      if previewImage.hasValue { try container.encode(previewImage, forKey: .previewImage) }
      if publishedAt.hasValue { try container.encode(publishedAt, forKey: .publishedAt) }
      if title.hasValue { try container.encode(title, forKey: .title) }
    }

    enum CodingKeys: String, CodingKey {
      case author
      case canonicalUrl
      case contentType
      case description
      case previewImage
      case publishedAt
      case title
    }
  }
}

extension InputObjects {
  struct PreparedDocumentInput: Encodable, Hashable {
    var document: String

    var pageInfo: InputObjects.PageInfoInput

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(document, forKey: .document)
      try container.encode(pageInfo, forKey: .pageInfo)
    }

    enum CodingKeys: String, CodingKey {
      case document
      case pageInfo
    }
  }
}

extension InputObjects {
  struct ReportItemInput: Encodable, Hashable {
    var itemUrl: String

    var pageId: String

    var reportComment: String

    var reportTypes: [Enums.ReportType]

    var sharedBy: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(itemUrl, forKey: .itemUrl)
      try container.encode(pageId, forKey: .pageId)
      try container.encode(reportComment, forKey: .reportComment)
      try container.encode(reportTypes, forKey: .reportTypes)
      if sharedBy.hasValue { try container.encode(sharedBy, forKey: .sharedBy) }
    }

    enum CodingKeys: String, CodingKey {
      case itemUrl
      case pageId
      case reportComment
      case reportTypes
      case sharedBy
    }
  }
}

extension InputObjects {
  struct SaveArticleReadingProgressInput: Encodable, Hashable {
    var id: String

    var readingProgressAnchorIndex: Int

    var readingProgressPercent: Double

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(id, forKey: .id)
      try container.encode(readingProgressAnchorIndex, forKey: .readingProgressAnchorIndex)
      try container.encode(readingProgressPercent, forKey: .readingProgressPercent)
    }

    enum CodingKeys: String, CodingKey {
      case id
      case readingProgressAnchorIndex
      case readingProgressPercent
    }
  }
}

extension InputObjects {
  struct SaveFileInput: Encodable, Hashable {
    var clientRequestId: String

    var source: String

    var uploadFileId: String

    var url: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(clientRequestId, forKey: .clientRequestId)
      try container.encode(source, forKey: .source)
      try container.encode(uploadFileId, forKey: .uploadFileId)
      try container.encode(url, forKey: .url)
    }

    enum CodingKeys: String, CodingKey {
      case clientRequestId
      case source
      case uploadFileId
      case url
    }
  }
}

extension InputObjects {
  struct SavePageInput: Encodable, Hashable {
    var clientRequestId: String

    var originalContent: String

    var source: String

    var title: OptionalArgument<String> = .absent()

    var url: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(clientRequestId, forKey: .clientRequestId)
      try container.encode(originalContent, forKey: .originalContent)
      try container.encode(source, forKey: .source)
      if title.hasValue { try container.encode(title, forKey: .title) }
      try container.encode(url, forKey: .url)
    }

    enum CodingKeys: String, CodingKey {
      case clientRequestId
      case originalContent
      case source
      case title
      case url
    }
  }
}

extension InputObjects {
  struct SaveUrlInput: Encodable, Hashable {
    var clientRequestId: String

    var source: String

    var url: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(clientRequestId, forKey: .clientRequestId)
      try container.encode(source, forKey: .source)
      try container.encode(url, forKey: .url)
    }

    enum CodingKeys: String, CodingKey {
      case clientRequestId
      case source
      case url
    }
  }
}

extension InputObjects {
  struct SetBookmarkArticleInput: Encodable, Hashable {
    var articleId: String

    var bookmark: Bool

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(articleId, forKey: .articleId)
      try container.encode(bookmark, forKey: .bookmark)
    }

    enum CodingKeys: String, CodingKey {
      case articleId = "articleID"
      case bookmark
    }
  }
}

extension InputObjects {
  struct SetDeviceTokenInput: Encodable, Hashable {
    var id: OptionalArgument<String> = .absent()

    var token: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if id.hasValue { try container.encode(id, forKey: .id) }
      if token.hasValue { try container.encode(token, forKey: .token) }
    }

    enum CodingKeys: String, CodingKey {
      case id
      case token
    }
  }
}

extension InputObjects {
  struct SetFollowInput: Encodable, Hashable {
    var follow: Bool

    var userId: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(follow, forKey: .follow)
      try container.encode(userId, forKey: .userId)
    }

    enum CodingKeys: String, CodingKey {
      case follow
      case userId
    }
  }
}

extension InputObjects {
  struct SetLabelsForHighlightInput: Encodable, Hashable {
    var highlightId: String

    var labelIds: [String]

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(highlightId, forKey: .highlightId)
      try container.encode(labelIds, forKey: .labelIds)
    }

    enum CodingKeys: String, CodingKey {
      case highlightId
      case labelIds
    }
  }
}

extension InputObjects {
  struct SetLabelsInput: Encodable, Hashable {
    var labelIds: [String]

    var pageId: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(labelIds, forKey: .labelIds)
      try container.encode(pageId, forKey: .pageId)
    }

    enum CodingKeys: String, CodingKey {
      case labelIds
      case pageId
    }
  }
}

extension InputObjects {
  struct SetShareArticleInput: Encodable, Hashable {
    var articleId: String

    var share: Bool

    var sharedComment: OptionalArgument<String> = .absent()

    var sharedWithHighlights: OptionalArgument<Bool> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(articleId, forKey: .articleId)
      try container.encode(share, forKey: .share)
      if sharedComment.hasValue { try container.encode(sharedComment, forKey: .sharedComment) }
      if sharedWithHighlights.hasValue { try container.encode(sharedWithHighlights, forKey: .sharedWithHighlights) }
    }

    enum CodingKeys: String, CodingKey {
      case articleId = "articleID"
      case share
      case sharedComment
      case sharedWithHighlights
    }
  }
}

extension InputObjects {
  struct SetShareHighlightInput: Encodable, Hashable {
    var id: String

    var share: Bool

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(id, forKey: .id)
      try container.encode(share, forKey: .share)
    }

    enum CodingKeys: String, CodingKey {
      case id
      case share
    }
  }
}

extension InputObjects {
  struct SetUserPersonalizationInput: Encodable, Hashable {
    var fontFamily: OptionalArgument<String> = .absent()

    var fontSize: OptionalArgument<Int> = .absent()

    var libraryLayoutType: OptionalArgument<String> = .absent()

    var librarySortOrder: OptionalArgument<Enums.SortOrder> = .absent()

    var margin: OptionalArgument<Int> = .absent()

    var theme: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if fontFamily.hasValue { try container.encode(fontFamily, forKey: .fontFamily) }
      if fontSize.hasValue { try container.encode(fontSize, forKey: .fontSize) }
      if libraryLayoutType.hasValue { try container.encode(libraryLayoutType, forKey: .libraryLayoutType) }
      if librarySortOrder.hasValue { try container.encode(librarySortOrder, forKey: .librarySortOrder) }
      if margin.hasValue { try container.encode(margin, forKey: .margin) }
      if theme.hasValue { try container.encode(theme, forKey: .theme) }
    }

    enum CodingKeys: String, CodingKey {
      case fontFamily
      case fontSize
      case libraryLayoutType
      case librarySortOrder
      case margin
      case theme
    }
  }
}

extension InputObjects {
  struct SetWebhookInput: Encodable, Hashable {
    var contentType: OptionalArgument<String> = .absent()

    var enabled: OptionalArgument<Bool> = .absent()

    var eventTypes: [Enums.WebhookEvent]

    var id: OptionalArgument<String> = .absent()

    var method: OptionalArgument<String> = .absent()

    var url: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if contentType.hasValue { try container.encode(contentType, forKey: .contentType) }
      if enabled.hasValue { try container.encode(enabled, forKey: .enabled) }
      try container.encode(eventTypes, forKey: .eventTypes)
      if id.hasValue { try container.encode(id, forKey: .id) }
      if method.hasValue { try container.encode(method, forKey: .method) }
      try container.encode(url, forKey: .url)
    }

    enum CodingKeys: String, CodingKey {
      case contentType
      case enabled
      case eventTypes
      case id
      case method
      case url
    }
  }
}

extension InputObjects {
  struct SortParams: Encodable, Hashable {
    var by: Enums.SortBy

    var order: OptionalArgument<Enums.SortOrder> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(by, forKey: .by)
      if order.hasValue { try container.encode(order, forKey: .order) }
    }

    enum CodingKeys: String, CodingKey {
      case by
      case order
    }
  }
}

extension InputObjects {
  struct UpdateHighlightInput: Encodable, Hashable {
    var annotation: OptionalArgument<String> = .absent()

    var highlightId: String

    var sharedAt: OptionalArgument<DateTime> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if annotation.hasValue { try container.encode(annotation, forKey: .annotation) }
      try container.encode(highlightId, forKey: .highlightId)
      if sharedAt.hasValue { try container.encode(sharedAt, forKey: .sharedAt) }
    }

    enum CodingKeys: String, CodingKey {
      case annotation
      case highlightId
      case sharedAt
    }
  }
}

extension InputObjects {
  struct UpdateHighlightReplyInput: Encodable, Hashable {
    var highlightReplyId: String

    var text: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(highlightReplyId, forKey: .highlightReplyId)
      try container.encode(text, forKey: .text)
    }

    enum CodingKeys: String, CodingKey {
      case highlightReplyId
      case text
    }
  }
}

extension InputObjects {
  struct UpdateLabelInput: Encodable, Hashable {
    var color: String

    var description: OptionalArgument<String> = .absent()

    var labelId: String

    var name: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(color, forKey: .color)
      if description.hasValue { try container.encode(description, forKey: .description) }
      try container.encode(labelId, forKey: .labelId)
      try container.encode(name, forKey: .name)
    }

    enum CodingKeys: String, CodingKey {
      case color
      case description
      case labelId
      case name
    }
  }
}

extension InputObjects {
  struct UpdateLinkShareInfoInput: Encodable, Hashable {
    var description: String

    var linkId: String

    var title: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(description, forKey: .description)
      try container.encode(linkId, forKey: .linkId)
      try container.encode(title, forKey: .title)
    }

    enum CodingKeys: String, CodingKey {
      case description
      case linkId
      case title
    }
  }
}

extension InputObjects {
  struct UpdatePageInput: Encodable, Hashable {
    var description: OptionalArgument<String> = .absent()

    var pageId: String

    var title: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if description.hasValue { try container.encode(description, forKey: .description) }
      try container.encode(pageId, forKey: .pageId)
      if title.hasValue { try container.encode(title, forKey: .title) }
    }

    enum CodingKeys: String, CodingKey {
      case description
      case pageId
      case title
    }
  }
}

extension InputObjects {
  struct UpdateReminderInput: Encodable, Hashable {
    var archiveUntil: Bool

    var id: String

    var remindAt: DateTime

    var sendNotification: Bool

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(archiveUntil, forKey: .archiveUntil)
      try container.encode(id, forKey: .id)
      try container.encode(remindAt, forKey: .remindAt)
      try container.encode(sendNotification, forKey: .sendNotification)
    }

    enum CodingKeys: String, CodingKey {
      case archiveUntil
      case id
      case remindAt
      case sendNotification
    }
  }
}

extension InputObjects {
  struct UpdateSharedCommentInput: Encodable, Hashable {
    var articleId: String

    var sharedComment: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(articleId, forKey: .articleId)
      try container.encode(sharedComment, forKey: .sharedComment)
    }

    enum CodingKeys: String, CodingKey {
      case articleId = "articleID"
      case sharedComment
    }
  }
}

extension InputObjects {
  struct UpdateUserInput: Encodable, Hashable {
    var bio: OptionalArgument<String> = .absent()

    var name: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if bio.hasValue { try container.encode(bio, forKey: .bio) }
      try container.encode(name, forKey: .name)
    }

    enum CodingKeys: String, CodingKey {
      case bio
      case name
    }
  }
}

extension InputObjects {
  struct UpdateUserProfileInput: Encodable, Hashable {
    var bio: OptionalArgument<String> = .absent()

    var pictureUrl: OptionalArgument<String> = .absent()

    var userId: String

    var username: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if bio.hasValue { try container.encode(bio, forKey: .bio) }
      if pictureUrl.hasValue { try container.encode(pictureUrl, forKey: .pictureUrl) }
      try container.encode(userId, forKey: .userId)
      if username.hasValue { try container.encode(username, forKey: .username) }
    }

    enum CodingKeys: String, CodingKey {
      case bio
      case pictureUrl
      case userId
      case username
    }
  }
}

extension InputObjects {
  struct UploadFileRequestInput: Encodable, Hashable {
    var clientRequestId: OptionalArgument<String> = .absent()

    var contentType: String

    var createPageEntry: OptionalArgument<Bool> = .absent()

    var url: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if clientRequestId.hasValue { try container.encode(clientRequestId, forKey: .clientRequestId) }
      try container.encode(contentType, forKey: .contentType)
      if createPageEntry.hasValue { try container.encode(createPageEntry, forKey: .createPageEntry) }
      try container.encode(url, forKey: .url)
    }

    enum CodingKeys: String, CodingKey {
      case clientRequestId
      case contentType
      case createPageEntry
      case url
    }
  }
}
