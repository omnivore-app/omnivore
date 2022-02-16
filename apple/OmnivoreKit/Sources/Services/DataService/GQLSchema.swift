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

// MARK: - Objects

enum Objects {}
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias User<T> = Selection<T, Objects.User>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Profile<T> = Selection<T, Objects.Profile>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ReadState<T> = Selection<T, Objects.ReadState>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ShareStats<T> = Selection<T, Objects.ShareStats>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LinkShareInfo<T> = Selection<T, Objects.LinkShareInfo>
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
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.Link {
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Link<T> = Selection<T, Objects.Link>
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
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.Page {
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

  func author() throws -> String {
    let field = GraphQLField.leaf(
      name: "author",
      arguments: []
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.author[field.alias!] {
        return data
      }
      throw HttpError.badpayload
    case .mocking:
      return String.mockValue
    }
  }

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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Page<T> = Selection<T, Objects.Page>
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
    let originalArticleUrl: [String: String]
    let originalHtml: [String: String]
    let pageType: [String: Enums.PageType]
    let postedByViewer: [String: Bool]
    let publishedAt: [String: DateTime]
    let readingProgressAnchorIndex: [String: Int]
    let readingProgressPercent: [String: Double]
    let savedAt: [String: DateTime]
    let savedByViewer: [String: Bool]
    let shareInfo: [String: Objects.LinkShareInfo]
    let sharedComment: [String: String]
    let slug: [String: String]
    let title: [String: String]
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
      case "slug":
        if let value = try container.decode(String?.self, forKey: codingKey) {
          map.set(key: field, hash: alias, value: value as Any)
        }
      case "title":
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
    originalArticleUrl = map["originalArticleUrl"]
    originalHtml = map["originalHtml"]
    pageType = map["pageType"]
    postedByViewer = map["postedByViewer"]
    publishedAt = map["publishedAt"]
    readingProgressAnchorIndex = map["readingProgressAnchorIndex"]
    readingProgressPercent = map["readingProgressPercent"]
    savedAt = map["savedAt"]
    savedByViewer = map["savedByViewer"]
    shareInfo = map["shareInfo"]
    sharedComment = map["sharedComment"]
    slug = map["slug"]
    title = map["title"]
    url = map["url"]
  }
}

extension Fields where TypeLock == Objects.Article {
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Article<T> = Selection<T, Objects.Article>
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

    id = map["id"]
    uploadFileId = map["uploadFileId"]
    uploadSignedUrl = map["uploadSignedUrl"]
  }
}

extension Fields where TypeLock == Objects.UploadFileRequestSuccess {
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UploadFileRequestSuccess<T> = Selection<T, Objects.UploadFileRequestSuccess>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleSuccess<T> = Selection<T, Objects.CreateArticleSuccess>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveSuccess<T> = Selection<T, Objects.SaveSuccess>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias FeedArticle<T> = Selection<T, Objects.FeedArticle>
}

extension Objects {
  struct Highlight {
    let __typename: TypeName = .highlight
    let annotation: [String: String]
    let article: [String: Objects.Article]
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
      case "article":
        if let value = try container.decode(Objects.Article?.self, forKey: codingKey) {
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
    article = map["article"]
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Highlight<T> = Selection<T, Objects.Highlight>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias HighlightReply<T> = Selection<T, Objects.HighlightReply>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Reaction<T> = Selection<T, Objects.Reaction>
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
  typealias SetShareArticleSuccess<T> = Selection<T, Objects.SetShareArticleSuccess>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UserPersonalization<T> = Selection<T, Objects.UserPersonalization>
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
  struct ArticleSavingRequest {
    let __typename: TypeName = .articleSavingRequest
    let article: [String: Objects.Article]
    let createdAt: [String: DateTime]
    let errorCode: [String: Enums.CreateArticleErrorCode]
    let id: [String: String]
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
    status = map["status"]
    updatedAt = map["updatedAt"]
    user = map["user"]
    userId = map["userId"]
  }
}

extension Fields where TypeLock == Objects.ArticleSavingRequest {
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias NewsletterEmail<T> = Selection<T, Objects.NewsletterEmail>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias Reminder<T> = Selection<T, Objects.Reminder>
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
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeviceToken<T> = Selection<T, Objects.DeviceToken>
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
  struct Label {
    let __typename: TypeName = .label
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

    id = map["id"]
    name = map["name"]
  }
}

extension Fields where TypeLock == Objects.Label {
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
  struct SignupSuccess {
    let __typename: TypeName = .signupSuccess
    let me: [String: Objects.User]

    enum TypeName: String, Codable {
      case signupSuccess = "SignupSuccess"
    }
  }
}

extension Objects.SignupSuccess: Decodable {
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

extension Fields where TypeLock == Objects.SignupSuccess {
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
  typealias SignupSuccess<T> = Selection<T, Objects.SignupSuccess>
}

extension Objects {
  struct SignupError {
    let __typename: TypeName = .signupError
    let errorCodes: [String: [Enums.SignupErrorCode?]]

    enum TypeName: String, Codable {
      case signupError = "SignupError"
    }
  }
}

extension Objects.SignupError: Decodable {
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

extension Fields where TypeLock == Objects.SignupError {
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
  typealias SignupError<T> = Selection<T, Objects.SignupError>
}

extension Objects {
  struct Mutation {
    let __typename: TypeName = .mutation
    let createArticle: [String: Unions.CreateArticleResult]
    let createArticleSavingRequest: [String: Unions.CreateArticleSavingRequestResult]
    let createHighlight: [String: Unions.CreateHighlightResult]
    let createHighlightReply: [String: Unions.CreateHighlightReplyResult]
    let createLabel: [String: Unions.CreateLabelResult]
    let createNewsletterEmail: [String: Unions.CreateNewsletterEmailResult]
    let createReaction: [String: Unions.CreateReactionResult]
    let createReminder: [String: Unions.CreateReminderResult]
    let deleteHighlight: [String: Unions.DeleteHighlightResult]
    let deleteHighlightReply: [String: Unions.DeleteHighlightReplyResult]
    let deleteLabel: [String: Unions.DeleteLabelResult]
    let deleteNewsletterEmail: [String: Unions.DeleteNewsletterEmailResult]
    let deleteReaction: [String: Unions.DeleteReactionResult]
    let deleteReminder: [String: Unions.DeleteReminderResult]
    let googleLogin: [String: Unions.LoginResult]
    let googleSignup: [String: Unions.GoogleSignupResult]
    let logOut: [String: Unions.LogOutResult]
    let login: [String: Unions.LoginResult]
    let mergeHighlight: [String: Unions.MergeHighlightResult]
    let reportItem: [String: Objects.ReportItemResult]
    let saveArticleReadingProgress: [String: Unions.SaveArticleReadingProgressResult]
    let saveFile: [String: Unions.SaveResult]
    let savePage: [String: Unions.SaveResult]
    let saveUrl: [String: Unions.SaveResult]
    let setBookmarkArticle: [String: Unions.SetBookmarkArticleResult]
    let setDeviceToken: [String: Unions.SetDeviceTokenResult]
    let setFollow: [String: Unions.SetFollowResult]
    let setLinkArchived: [String: Unions.ArchiveLinkResult]
    let setShareArticle: [String: Unions.SetShareArticleResult]
    let setShareHighlight: [String: Unions.SetShareHighlightResult]
    let setUserPersonalization: [String: Unions.SetUserPersonalizationResult]
    let signup: [String: Unions.SignupResult]
    let updateHighlight: [String: Unions.UpdateHighlightResult]
    let updateHighlightReply: [String: Unions.UpdateHighlightReplyResult]
    let updateLinkShareInfo: [String: Unions.UpdateLinkShareInfoResult]
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
      case "login":
        if let value = try container.decode(Unions.LoginResult?.self, forKey: codingKey) {
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
      case "signup":
        if let value = try container.decode(Unions.SignupResult?.self, forKey: codingKey) {
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
      case "updateLinkShareInfo":
        if let value = try container.decode(Unions.UpdateLinkShareInfoResult?.self, forKey: codingKey) {
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

    createArticle = map["createArticle"]
    createArticleSavingRequest = map["createArticleSavingRequest"]
    createHighlight = map["createHighlight"]
    createHighlightReply = map["createHighlightReply"]
    createLabel = map["createLabel"]
    createNewsletterEmail = map["createNewsletterEmail"]
    createReaction = map["createReaction"]
    createReminder = map["createReminder"]
    deleteHighlight = map["deleteHighlight"]
    deleteHighlightReply = map["deleteHighlightReply"]
    deleteLabel = map["deleteLabel"]
    deleteNewsletterEmail = map["deleteNewsletterEmail"]
    deleteReaction = map["deleteReaction"]
    deleteReminder = map["deleteReminder"]
    googleLogin = map["googleLogin"]
    googleSignup = map["googleSignup"]
    logOut = map["logOut"]
    login = map["login"]
    mergeHighlight = map["mergeHighlight"]
    reportItem = map["reportItem"]
    saveArticleReadingProgress = map["saveArticleReadingProgress"]
    saveFile = map["saveFile"]
    savePage = map["savePage"]
    saveUrl = map["saveUrl"]
    setBookmarkArticle = map["setBookmarkArticle"]
    setDeviceToken = map["setDeviceToken"]
    setFollow = map["setFollow"]
    setLinkArchived = map["setLinkArchived"]
    setShareArticle = map["setShareArticle"]
    setShareHighlight = map["setShareHighlight"]
    setUserPersonalization = map["setUserPersonalization"]
    signup = map["signup"]
    updateHighlight = map["updateHighlight"]
    updateHighlightReply = map["updateHighlightReply"]
    updateLinkShareInfo = map["updateLinkShareInfo"]
    updateReminder = map["updateReminder"]
    updateSharedComment = map["updateSharedComment"]
    updateUser = map["updateUser"]
    updateUserProfile = map["updateUserProfile"]
    uploadFileRequest = map["uploadFileRequest"]
  }
}

extension Fields where TypeLock == Objects.Mutation {
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

  func login<Type>(input: InputObjects.LoginInput, selection: Selection<Type, Unions.LoginResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "login",
      arguments: [Argument(name: "input", type: "LoginInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.login[field.alias!] {
        return try selection.decode(data: data)
      }
      throw HttpError.badpayload
    case .mocking:
      return selection.mock()
    }
  }

  func signup<Type>(input: InputObjects.SignupInput, selection: Selection<Type, Unions.SignupResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "signup",
      arguments: [Argument(name: "input", type: "SignupInput!", value: input)],
      selection: selection.selection
    )
    select(field)

    switch response {
    case let .decoding(data):
      if let data = data.signup[field.alias!] {
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
  struct Query {
    let __typename: TypeName = .query
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
    let sharedArticle: [String: Unions.SharedArticleResult]
    let user: [String: Unions.UserResult]
    let users: [String: Unions.UsersResult]
    let validateUsername: [String: Bool]

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
      case "sharedArticle":
        if let value = try container.decode(Unions.SharedArticleResult?.self, forKey: codingKey) {
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
    sharedArticle = map["sharedArticle"]
    user = map["user"]
    users = map["users"]
    validateUsername = map["validateUsername"]
  }
}

extension Fields where TypeLock == Objects.Query {
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

  func articles<Type>(sharedOnly: OptionalArgument<Bool> = .absent(), sort: OptionalArgument<InputObjects.SortParams> = .absent(), after: OptionalArgument<String> = .absent(), first: OptionalArgument<Int> = .absent(), query: OptionalArgument<String> = .absent(), selection: Selection<Type, Unions.ArticlesResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "articles",
      arguments: [Argument(name: "sharedOnly", type: "Boolean", value: sharedOnly), Argument(name: "sort", type: "SortParams", value: sort), Argument(name: "after", type: "String", value: after), Argument(name: "first", type: "Int", value: first), Argument(name: "query", type: "String", value: query)],
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

  func article<Type>(username: String, slug: String, selection: Selection<Type, Unions.ArticleResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "article",
      arguments: [Argument(name: "username", type: "String!", value: username), Argument(name: "slug", type: "String!", value: slug)],
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

  func sharedArticle<Type>(username: String, slug: String, selectedHighlightId: OptionalArgument<String> = .absent(), selection: Selection<Type, Unions.SharedArticleResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "sharedArticle",
      arguments: [Argument(name: "username", type: "String!", value: username), Argument(name: "slug", type: "String!", value: slug), Argument(name: "selectedHighlightId", type: "String", value: selectedHighlightId)],
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

  func feedArticles<Type>(after: OptionalArgument<String> = .absent(), first: OptionalArgument<Int> = .absent(), sort: OptionalArgument<InputObjects.SortParams> = .absent(), sharedByUser: OptionalArgument<String> = .absent(), selection: Selection<Type, Unions.FeedArticlesResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "feedArticles",
      arguments: [Argument(name: "after", type: "String", value: after), Argument(name: "first", type: "Int", value: first), Argument(name: "sort", type: "SortParams", value: sort), Argument(name: "sharedByUser", type: "ID", value: sharedByUser)],
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

  func labels<Type>(linkId: String, selection: Selection<Type, Unions.LabelsResult>) throws -> Type {
    let field = GraphQLField.composite(
      name: "labels",
      arguments: [Argument(name: "linkId", type: "ID!", value: linkId)],
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
  typealias Query<T> = Selection<T, Objects.Query>
}

// MARK: - Interfaces

enum Interfaces {}

// MARK: - Unions

enum Unions {}
extension Unions {
  struct UserResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UserErrorCode]]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case userSuccess = "UserSuccess"
      case userError = "UserError"
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
  func on<Type>(userSuccess: Selection<Type, Objects.UserSuccess>, userError: Selection<Type, Objects.UserError>) throws -> Type {
    select([GraphQLField.fragment(type: "UserSuccess", selection: userSuccess.selection), GraphQLField.fragment(type: "UserError", selection: userError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .userSuccess:
        let data = Objects.UserSuccess(user: data.user)
        return try userSuccess.decode(data: data)
      case .userError:
        let data = Objects.UserError(errorCodes: data.errorCodes)
        return try userError.decode(data: data)
      }
    case .mocking:
      return userSuccess.mock()
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
      case usersSuccess = "UsersSuccess"
      case usersError = "UsersError"
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
  func on<Type>(usersSuccess: Selection<Type, Objects.UsersSuccess>, usersError: Selection<Type, Objects.UsersError>) throws -> Type {
    select([GraphQLField.fragment(type: "UsersSuccess", selection: usersSuccess.selection), GraphQLField.fragment(type: "UsersError", selection: usersError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .usersSuccess:
        let data = Objects.UsersSuccess(users: data.users)
        return try usersSuccess.decode(data: data)
      case .usersError:
        let data = Objects.UsersError(errorCodes: data.errorCodes)
        return try usersError.decode(data: data)
      }
    case .mocking:
      return usersSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UsersResult<T> = Selection<T, Unions.UsersResult>
}

extension Unions {
  struct LoginResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.LoginErrorCode]]
    let me: [String: Objects.User]

    enum TypeName: String, Codable {
      case loginSuccess = "LoginSuccess"
      case loginError = "LoginError"
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
  func on<Type>(loginSuccess: Selection<Type, Objects.LoginSuccess>, loginError: Selection<Type, Objects.LoginError>) throws -> Type {
    select([GraphQLField.fragment(type: "LoginSuccess", selection: loginSuccess.selection), GraphQLField.fragment(type: "LoginError", selection: loginError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .loginSuccess:
        let data = Objects.LoginSuccess(me: data.me)
        return try loginSuccess.decode(data: data)
      case .loginError:
        let data = Objects.LoginError(errorCodes: data.errorCodes)
        return try loginError.decode(data: data)
      }
    case .mocking:
      return loginSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LoginResult<T> = Selection<T, Unions.LoginResult>
}

extension Unions {
  struct GoogleSignupResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SignupErrorCode?]]
    let me: [String: Objects.User]

    enum TypeName: String, Codable {
      case googleSignupSuccess = "GoogleSignupSuccess"
      case googleSignupError = "GoogleSignupError"
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
  func on<Type>(googleSignupSuccess: Selection<Type, Objects.GoogleSignupSuccess>, googleSignupError: Selection<Type, Objects.GoogleSignupError>) throws -> Type {
    select([GraphQLField.fragment(type: "GoogleSignupSuccess", selection: googleSignupSuccess.selection), GraphQLField.fragment(type: "GoogleSignupError", selection: googleSignupError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .googleSignupSuccess:
        let data = Objects.GoogleSignupSuccess(me: data.me)
        return try googleSignupSuccess.decode(data: data)
      case .googleSignupError:
        let data = Objects.GoogleSignupError(errorCodes: data.errorCodes)
        return try googleSignupError.decode(data: data)
      }
    case .mocking:
      return googleSignupSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GoogleSignupResult<T> = Selection<T, Unions.GoogleSignupResult>
}

extension Unions {
  struct LogOutResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.LogOutErrorCode]]
    let message: [String: String]

    enum TypeName: String, Codable {
      case logOutSuccess = "LogOutSuccess"
      case logOutError = "LogOutError"
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
  func on<Type>(logOutSuccess: Selection<Type, Objects.LogOutSuccess>, logOutError: Selection<Type, Objects.LogOutError>) throws -> Type {
    select([GraphQLField.fragment(type: "LogOutSuccess", selection: logOutSuccess.selection), GraphQLField.fragment(type: "LogOutError", selection: logOutError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .logOutSuccess:
        let data = Objects.LogOutSuccess(message: data.message)
        return try logOutSuccess.decode(data: data)
      case .logOutError:
        let data = Objects.LogOutError(errorCodes: data.errorCodes)
        return try logOutError.decode(data: data)
      }
    case .mocking:
      return logOutSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LogOutResult<T> = Selection<T, Unions.LogOutResult>
}

extension Unions {
  struct UpdateUserResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateUserErrorCode]]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case updateUserSuccess = "UpdateUserSuccess"
      case updateUserError = "UpdateUserError"
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
  func on<Type>(updateUserSuccess: Selection<Type, Objects.UpdateUserSuccess>, updateUserError: Selection<Type, Objects.UpdateUserError>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateUserSuccess", selection: updateUserSuccess.selection), GraphQLField.fragment(type: "UpdateUserError", selection: updateUserError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateUserSuccess:
        let data = Objects.UpdateUserSuccess(user: data.user)
        return try updateUserSuccess.decode(data: data)
      case .updateUserError:
        let data = Objects.UpdateUserError(errorCodes: data.errorCodes)
        return try updateUserError.decode(data: data)
      }
    case .mocking:
      return updateUserSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateUserResult<T> = Selection<T, Unions.UpdateUserResult>
}

extension Unions {
  struct UpdateUserProfileResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateUserProfileErrorCode]]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case updateUserProfileSuccess = "UpdateUserProfileSuccess"
      case updateUserProfileError = "UpdateUserProfileError"
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
  func on<Type>(updateUserProfileSuccess: Selection<Type, Objects.UpdateUserProfileSuccess>, updateUserProfileError: Selection<Type, Objects.UpdateUserProfileError>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateUserProfileSuccess", selection: updateUserProfileSuccess.selection), GraphQLField.fragment(type: "UpdateUserProfileError", selection: updateUserProfileError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateUserProfileSuccess:
        let data = Objects.UpdateUserProfileSuccess(user: data.user)
        return try updateUserProfileSuccess.decode(data: data)
      case .updateUserProfileError:
        let data = Objects.UpdateUserProfileError(errorCodes: data.errorCodes)
        return try updateUserProfileError.decode(data: data)
      }
    case .mocking:
      return updateUserProfileSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateUserProfileResult<T> = Selection<T, Unions.UpdateUserProfileResult>
}

extension Unions {
  struct ArticleResult {
    let __typename: TypeName
    let article: [String: Objects.Article]
    let errorCodes: [String: [Enums.ArticleErrorCode]]

    enum TypeName: String, Codable {
      case articleSuccess = "ArticleSuccess"
      case articleError = "ArticleError"
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
  func on<Type>(articleSuccess: Selection<Type, Objects.ArticleSuccess>, articleError: Selection<Type, Objects.ArticleError>) throws -> Type {
    select([GraphQLField.fragment(type: "ArticleSuccess", selection: articleSuccess.selection), GraphQLField.fragment(type: "ArticleError", selection: articleError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .articleSuccess:
        let data = Objects.ArticleSuccess(article: data.article)
        return try articleSuccess.decode(data: data)
      case .articleError:
        let data = Objects.ArticleError(errorCodes: data.errorCodes)
        return try articleError.decode(data: data)
      }
    case .mocking:
      return articleSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleResult<T> = Selection<T, Unions.ArticleResult>
}

extension Unions {
  struct SharedArticleResult {
    let __typename: TypeName
    let article: [String: Objects.Article]
    let errorCodes: [String: [Enums.SharedArticleErrorCode]]

    enum TypeName: String, Codable {
      case sharedArticleSuccess = "SharedArticleSuccess"
      case sharedArticleError = "SharedArticleError"
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
  func on<Type>(sharedArticleSuccess: Selection<Type, Objects.SharedArticleSuccess>, sharedArticleError: Selection<Type, Objects.SharedArticleError>) throws -> Type {
    select([GraphQLField.fragment(type: "SharedArticleSuccess", selection: sharedArticleSuccess.selection), GraphQLField.fragment(type: "SharedArticleError", selection: sharedArticleError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .sharedArticleSuccess:
        let data = Objects.SharedArticleSuccess(article: data.article)
        return try sharedArticleSuccess.decode(data: data)
      case .sharedArticleError:
        let data = Objects.SharedArticleError(errorCodes: data.errorCodes)
        return try sharedArticleError.decode(data: data)
      }
    case .mocking:
      return sharedArticleSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SharedArticleResult<T> = Selection<T, Unions.SharedArticleResult>
}

extension Unions {
  struct ArticlesResult {
    let __typename: TypeName
    let edges: [String: [Objects.ArticleEdge]]
    let errorCodes: [String: [Enums.ArticlesErrorCode]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case articlesSuccess = "ArticlesSuccess"
      case articlesError = "ArticlesError"
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
  func on<Type>(articlesSuccess: Selection<Type, Objects.ArticlesSuccess>, articlesError: Selection<Type, Objects.ArticlesError>) throws -> Type {
    select([GraphQLField.fragment(type: "ArticlesSuccess", selection: articlesSuccess.selection), GraphQLField.fragment(type: "ArticlesError", selection: articlesError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .articlesSuccess:
        let data = Objects.ArticlesSuccess(edges: data.edges, pageInfo: data.pageInfo)
        return try articlesSuccess.decode(data: data)
      case .articlesError:
        let data = Objects.ArticlesError(errorCodes: data.errorCodes)
        return try articlesError.decode(data: data)
      }
    case .mocking:
      return articlesSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticlesResult<T> = Selection<T, Unions.ArticlesResult>
}

extension Unions {
  struct UploadFileRequestResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UploadFileRequestErrorCode]]
    let id: [String: String]
    let uploadFileId: [String: String]
    let uploadSignedUrl: [String: String]

    enum TypeName: String, Codable {
      case uploadFileRequestSuccess = "UploadFileRequestSuccess"
      case uploadFileRequestError = "UploadFileRequestError"
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

    errorCodes = map["errorCodes"]
    id = map["id"]
    uploadFileId = map["uploadFileId"]
    uploadSignedUrl = map["uploadSignedUrl"]
  }
}

extension Fields where TypeLock == Unions.UploadFileRequestResult {
  func on<Type>(uploadFileRequestSuccess: Selection<Type, Objects.UploadFileRequestSuccess>, uploadFileRequestError: Selection<Type, Objects.UploadFileRequestError>) throws -> Type {
    select([GraphQLField.fragment(type: "UploadFileRequestSuccess", selection: uploadFileRequestSuccess.selection), GraphQLField.fragment(type: "UploadFileRequestError", selection: uploadFileRequestError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .uploadFileRequestSuccess:
        let data = Objects.UploadFileRequestSuccess(id: data.id, uploadFileId: data.uploadFileId, uploadSignedUrl: data.uploadSignedUrl)
        return try uploadFileRequestSuccess.decode(data: data)
      case .uploadFileRequestError:
        let data = Objects.UploadFileRequestError(errorCodes: data.errorCodes)
        return try uploadFileRequestError.decode(data: data)
      }
    case .mocking:
      return uploadFileRequestSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UploadFileRequestResult<T> = Selection<T, Unions.UploadFileRequestResult>
}

extension Unions {
  struct CreateArticleResult {
    let __typename: TypeName
    let created: [String: Bool]
    let createdArticle: [String: Objects.Article]
    let errorCodes: [String: [Enums.CreateArticleErrorCode]]
    let user: [String: Objects.User]

    enum TypeName: String, Codable {
      case createArticleSuccess = "CreateArticleSuccess"
      case createArticleError = "CreateArticleError"
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
  func on<Type>(createArticleSuccess: Selection<Type, Objects.CreateArticleSuccess>, createArticleError: Selection<Type, Objects.CreateArticleError>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateArticleSuccess", selection: createArticleSuccess.selection), GraphQLField.fragment(type: "CreateArticleError", selection: createArticleError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createArticleSuccess:
        let data = Objects.CreateArticleSuccess(created: data.created, createdArticle: data.createdArticle, user: data.user)
        return try createArticleSuccess.decode(data: data)
      case .createArticleError:
        let data = Objects.CreateArticleError(errorCodes: data.errorCodes)
        return try createArticleError.decode(data: data)
      }
    case .mocking:
      return createArticleSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleResult<T> = Selection<T, Unions.CreateArticleResult>
}

extension Unions {
  struct SaveResult {
    let __typename: TypeName
    let clientRequestId: [String: String]
    let errorCodes: [String: [Enums.SaveErrorCode]]
    let message: [String: String]
    let url: [String: String]

    enum TypeName: String, Codable {
      case saveSuccess = "SaveSuccess"
      case saveError = "SaveError"
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
  func on<Type>(saveSuccess: Selection<Type, Objects.SaveSuccess>, saveError: Selection<Type, Objects.SaveError>) throws -> Type {
    select([GraphQLField.fragment(type: "SaveSuccess", selection: saveSuccess.selection), GraphQLField.fragment(type: "SaveError", selection: saveError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .saveSuccess:
        let data = Objects.SaveSuccess(clientRequestId: data.clientRequestId, url: data.url)
        return try saveSuccess.decode(data: data)
      case .saveError:
        let data = Objects.SaveError(errorCodes: data.errorCodes, message: data.message)
        return try saveError.decode(data: data)
      }
    case .mocking:
      return saveSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveResult<T> = Selection<T, Unions.SaveResult>
}

extension Unions {
  struct SetFollowResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetFollowErrorCode]]
    let updatedUser: [String: Objects.User]

    enum TypeName: String, Codable {
      case setFollowSuccess = "SetFollowSuccess"
      case setFollowError = "SetFollowError"
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
  func on<Type>(setFollowSuccess: Selection<Type, Objects.SetFollowSuccess>, setFollowError: Selection<Type, Objects.SetFollowError>) throws -> Type {
    select([GraphQLField.fragment(type: "SetFollowSuccess", selection: setFollowSuccess.selection), GraphQLField.fragment(type: "SetFollowError", selection: setFollowError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setFollowSuccess:
        let data = Objects.SetFollowSuccess(updatedUser: data.updatedUser)
        return try setFollowSuccess.decode(data: data)
      case .setFollowError:
        let data = Objects.SetFollowError(errorCodes: data.errorCodes)
        return try setFollowError.decode(data: data)
      }
    case .mocking:
      return setFollowSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetFollowResult<T> = Selection<T, Unions.SetFollowResult>
}

extension Unions {
  struct SaveArticleReadingProgressResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SaveArticleReadingProgressErrorCode]]
    let updatedArticle: [String: Objects.Article]

    enum TypeName: String, Codable {
      case saveArticleReadingProgressSuccess = "SaveArticleReadingProgressSuccess"
      case saveArticleReadingProgressError = "SaveArticleReadingProgressError"
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
  func on<Type>(saveArticleReadingProgressSuccess: Selection<Type, Objects.SaveArticleReadingProgressSuccess>, saveArticleReadingProgressError: Selection<Type, Objects.SaveArticleReadingProgressError>) throws -> Type {
    select([GraphQLField.fragment(type: "SaveArticleReadingProgressSuccess", selection: saveArticleReadingProgressSuccess.selection), GraphQLField.fragment(type: "SaveArticleReadingProgressError", selection: saveArticleReadingProgressError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .saveArticleReadingProgressSuccess:
        let data = Objects.SaveArticleReadingProgressSuccess(updatedArticle: data.updatedArticle)
        return try saveArticleReadingProgressSuccess.decode(data: data)
      case .saveArticleReadingProgressError:
        let data = Objects.SaveArticleReadingProgressError(errorCodes: data.errorCodes)
        return try saveArticleReadingProgressError.decode(data: data)
      }
    case .mocking:
      return saveArticleReadingProgressSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SaveArticleReadingProgressResult<T> = Selection<T, Unions.SaveArticleReadingProgressResult>
}

extension Unions {
  struct SetBookmarkArticleResult {
    let __typename: TypeName
    let bookmarkedArticle: [String: Objects.Article]
    let errorCodes: [String: [Enums.SetBookmarkArticleErrorCode]]

    enum TypeName: String, Codable {
      case setBookmarkArticleSuccess = "SetBookmarkArticleSuccess"
      case setBookmarkArticleError = "SetBookmarkArticleError"
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
  func on<Type>(setBookmarkArticleSuccess: Selection<Type, Objects.SetBookmarkArticleSuccess>, setBookmarkArticleError: Selection<Type, Objects.SetBookmarkArticleError>) throws -> Type {
    select([GraphQLField.fragment(type: "SetBookmarkArticleSuccess", selection: setBookmarkArticleSuccess.selection), GraphQLField.fragment(type: "SetBookmarkArticleError", selection: setBookmarkArticleError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setBookmarkArticleSuccess:
        let data = Objects.SetBookmarkArticleSuccess(bookmarkedArticle: data.bookmarkedArticle)
        return try setBookmarkArticleSuccess.decode(data: data)
      case .setBookmarkArticleError:
        let data = Objects.SetBookmarkArticleError(errorCodes: data.errorCodes)
        return try setBookmarkArticleError.decode(data: data)
      }
    case .mocking:
      return setBookmarkArticleSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetBookmarkArticleResult<T> = Selection<T, Unions.SetBookmarkArticleResult>
}

extension Unions {
  struct CreateHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case createHighlightSuccess = "CreateHighlightSuccess"
      case createHighlightError = "CreateHighlightError"
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
  func on<Type>(createHighlightSuccess: Selection<Type, Objects.CreateHighlightSuccess>, createHighlightError: Selection<Type, Objects.CreateHighlightError>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateHighlightSuccess", selection: createHighlightSuccess.selection), GraphQLField.fragment(type: "CreateHighlightError", selection: createHighlightError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createHighlightSuccess:
        let data = Objects.CreateHighlightSuccess(highlight: data.highlight)
        return try createHighlightSuccess.decode(data: data)
      case .createHighlightError:
        let data = Objects.CreateHighlightError(errorCodes: data.errorCodes)
        return try createHighlightError.decode(data: data)
      }
    case .mocking:
      return createHighlightSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateHighlightResult<T> = Selection<T, Unions.CreateHighlightResult>
}

extension Unions {
  struct MergeHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.MergeHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]
    let overlapHighlightIdList: [String: [String]]

    enum TypeName: String, Codable {
      case mergeHighlightSuccess = "MergeHighlightSuccess"
      case mergeHighlightError = "MergeHighlightError"
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
  func on<Type>(mergeHighlightSuccess: Selection<Type, Objects.MergeHighlightSuccess>, mergeHighlightError: Selection<Type, Objects.MergeHighlightError>) throws -> Type {
    select([GraphQLField.fragment(type: "MergeHighlightSuccess", selection: mergeHighlightSuccess.selection), GraphQLField.fragment(type: "MergeHighlightError", selection: mergeHighlightError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .mergeHighlightSuccess:
        let data = Objects.MergeHighlightSuccess(highlight: data.highlight, overlapHighlightIdList: data.overlapHighlightIdList)
        return try mergeHighlightSuccess.decode(data: data)
      case .mergeHighlightError:
        let data = Objects.MergeHighlightError(errorCodes: data.errorCodes)
        return try mergeHighlightError.decode(data: data)
      }
    case .mocking:
      return mergeHighlightSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias MergeHighlightResult<T> = Selection<T, Unions.MergeHighlightResult>
}

extension Unions {
  struct UpdateHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case updateHighlightSuccess = "UpdateHighlightSuccess"
      case updateHighlightError = "UpdateHighlightError"
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
  func on<Type>(updateHighlightSuccess: Selection<Type, Objects.UpdateHighlightSuccess>, updateHighlightError: Selection<Type, Objects.UpdateHighlightError>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateHighlightSuccess", selection: updateHighlightSuccess.selection), GraphQLField.fragment(type: "UpdateHighlightError", selection: updateHighlightError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateHighlightSuccess:
        let data = Objects.UpdateHighlightSuccess(highlight: data.highlight)
        return try updateHighlightSuccess.decode(data: data)
      case .updateHighlightError:
        let data = Objects.UpdateHighlightError(errorCodes: data.errorCodes)
        return try updateHighlightError.decode(data: data)
      }
    case .mocking:
      return updateHighlightSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateHighlightResult<T> = Selection<T, Unions.UpdateHighlightResult>
}

extension Unions {
  struct DeleteHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case deleteHighlightSuccess = "DeleteHighlightSuccess"
      case deleteHighlightError = "DeleteHighlightError"
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
  func on<Type>(deleteHighlightSuccess: Selection<Type, Objects.DeleteHighlightSuccess>, deleteHighlightError: Selection<Type, Objects.DeleteHighlightError>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteHighlightSuccess", selection: deleteHighlightSuccess.selection), GraphQLField.fragment(type: "DeleteHighlightError", selection: deleteHighlightError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteHighlightSuccess:
        let data = Objects.DeleteHighlightSuccess(highlight: data.highlight)
        return try deleteHighlightSuccess.decode(data: data)
      case .deleteHighlightError:
        let data = Objects.DeleteHighlightError(errorCodes: data.errorCodes)
        return try deleteHighlightError.decode(data: data)
      }
    case .mocking:
      return deleteHighlightSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteHighlightResult<T> = Selection<T, Unions.DeleteHighlightResult>
}

extension Unions {
  struct CreateHighlightReplyResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateHighlightReplyErrorCode]]
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case createHighlightReplySuccess = "CreateHighlightReplySuccess"
      case createHighlightReplyError = "CreateHighlightReplyError"
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
  func on<Type>(createHighlightReplySuccess: Selection<Type, Objects.CreateHighlightReplySuccess>, createHighlightReplyError: Selection<Type, Objects.CreateHighlightReplyError>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateHighlightReplySuccess", selection: createHighlightReplySuccess.selection), GraphQLField.fragment(type: "CreateHighlightReplyError", selection: createHighlightReplyError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createHighlightReplySuccess:
        let data = Objects.CreateHighlightReplySuccess(highlightReply: data.highlightReply)
        return try createHighlightReplySuccess.decode(data: data)
      case .createHighlightReplyError:
        let data = Objects.CreateHighlightReplyError(errorCodes: data.errorCodes)
        return try createHighlightReplyError.decode(data: data)
      }
    case .mocking:
      return createHighlightReplySuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateHighlightReplyResult<T> = Selection<T, Unions.CreateHighlightReplyResult>
}

extension Unions {
  struct UpdateHighlightReplyResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateHighlightReplyErrorCode]]
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case updateHighlightReplySuccess = "UpdateHighlightReplySuccess"
      case updateHighlightReplyError = "UpdateHighlightReplyError"
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
  func on<Type>(updateHighlightReplySuccess: Selection<Type, Objects.UpdateHighlightReplySuccess>, updateHighlightReplyError: Selection<Type, Objects.UpdateHighlightReplyError>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateHighlightReplySuccess", selection: updateHighlightReplySuccess.selection), GraphQLField.fragment(type: "UpdateHighlightReplyError", selection: updateHighlightReplyError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateHighlightReplySuccess:
        let data = Objects.UpdateHighlightReplySuccess(highlightReply: data.highlightReply)
        return try updateHighlightReplySuccess.decode(data: data)
      case .updateHighlightReplyError:
        let data = Objects.UpdateHighlightReplyError(errorCodes: data.errorCodes)
        return try updateHighlightReplyError.decode(data: data)
      }
    case .mocking:
      return updateHighlightReplySuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateHighlightReplyResult<T> = Selection<T, Unions.UpdateHighlightReplyResult>
}

extension Unions {
  struct DeleteHighlightReplyResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteHighlightReplyErrorCode]]
    let highlightReply: [String: Objects.HighlightReply]

    enum TypeName: String, Codable {
      case deleteHighlightReplySuccess = "DeleteHighlightReplySuccess"
      case deleteHighlightReplyError = "DeleteHighlightReplyError"
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
  func on<Type>(deleteHighlightReplySuccess: Selection<Type, Objects.DeleteHighlightReplySuccess>, deleteHighlightReplyError: Selection<Type, Objects.DeleteHighlightReplyError>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteHighlightReplySuccess", selection: deleteHighlightReplySuccess.selection), GraphQLField.fragment(type: "DeleteHighlightReplyError", selection: deleteHighlightReplyError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteHighlightReplySuccess:
        let data = Objects.DeleteHighlightReplySuccess(highlightReply: data.highlightReply)
        return try deleteHighlightReplySuccess.decode(data: data)
      case .deleteHighlightReplyError:
        let data = Objects.DeleteHighlightReplyError(errorCodes: data.errorCodes)
        return try deleteHighlightReplyError.decode(data: data)
      }
    case .mocking:
      return deleteHighlightReplySuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteHighlightReplyResult<T> = Selection<T, Unions.DeleteHighlightReplyResult>
}

extension Unions {
  struct CreateReactionResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateReactionErrorCode]]
    let reaction: [String: Objects.Reaction]

    enum TypeName: String, Codable {
      case createReactionSuccess = "CreateReactionSuccess"
      case createReactionError = "CreateReactionError"
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
  func on<Type>(createReactionSuccess: Selection<Type, Objects.CreateReactionSuccess>, createReactionError: Selection<Type, Objects.CreateReactionError>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateReactionSuccess", selection: createReactionSuccess.selection), GraphQLField.fragment(type: "CreateReactionError", selection: createReactionError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createReactionSuccess:
        let data = Objects.CreateReactionSuccess(reaction: data.reaction)
        return try createReactionSuccess.decode(data: data)
      case .createReactionError:
        let data = Objects.CreateReactionError(errorCodes: data.errorCodes)
        return try createReactionError.decode(data: data)
      }
    case .mocking:
      return createReactionSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateReactionResult<T> = Selection<T, Unions.CreateReactionResult>
}

extension Unions {
  struct DeleteReactionResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteReactionErrorCode]]
    let reaction: [String: Objects.Reaction]

    enum TypeName: String, Codable {
      case deleteReactionSuccess = "DeleteReactionSuccess"
      case deleteReactionError = "DeleteReactionError"
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
  func on<Type>(deleteReactionSuccess: Selection<Type, Objects.DeleteReactionSuccess>, deleteReactionError: Selection<Type, Objects.DeleteReactionError>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteReactionSuccess", selection: deleteReactionSuccess.selection), GraphQLField.fragment(type: "DeleteReactionError", selection: deleteReactionError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteReactionSuccess:
        let data = Objects.DeleteReactionSuccess(reaction: data.reaction)
        return try deleteReactionSuccess.decode(data: data)
      case .deleteReactionError:
        let data = Objects.DeleteReactionError(errorCodes: data.errorCodes)
        return try deleteReactionError.decode(data: data)
      }
    case .mocking:
      return deleteReactionSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteReactionResult<T> = Selection<T, Unions.DeleteReactionResult>
}

extension Unions {
  struct FeedArticlesResult {
    let __typename: TypeName
    let edges: [String: [Objects.FeedArticleEdge]]
    let errorCodes: [String: [Enums.FeedArticlesErrorCode]]
    let pageInfo: [String: Objects.PageInfo]

    enum TypeName: String, Codable {
      case feedArticlesSuccess = "FeedArticlesSuccess"
      case feedArticlesError = "FeedArticlesError"
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
  func on<Type>(feedArticlesSuccess: Selection<Type, Objects.FeedArticlesSuccess>, feedArticlesError: Selection<Type, Objects.FeedArticlesError>) throws -> Type {
    select([GraphQLField.fragment(type: "FeedArticlesSuccess", selection: feedArticlesSuccess.selection), GraphQLField.fragment(type: "FeedArticlesError", selection: feedArticlesError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .feedArticlesSuccess:
        let data = Objects.FeedArticlesSuccess(edges: data.edges, pageInfo: data.pageInfo)
        return try feedArticlesSuccess.decode(data: data)
      case .feedArticlesError:
        let data = Objects.FeedArticlesError(errorCodes: data.errorCodes)
        return try feedArticlesError.decode(data: data)
      }
    case .mocking:
      return feedArticlesSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias FeedArticlesResult<T> = Selection<T, Unions.FeedArticlesResult>
}

extension Unions {
  struct SetShareArticleResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetShareArticleErrorCode]]
    let updatedArticle: [String: Objects.Article]
    let updatedFeedArticle: [String: Objects.FeedArticle]
    let updatedFeedArticleId: [String: String]

    enum TypeName: String, Codable {
      case setShareArticleSuccess = "SetShareArticleSuccess"
      case setShareArticleError = "SetShareArticleError"
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
  func on<Type>(setShareArticleSuccess: Selection<Type, Objects.SetShareArticleSuccess>, setShareArticleError: Selection<Type, Objects.SetShareArticleError>) throws -> Type {
    select([GraphQLField.fragment(type: "SetShareArticleSuccess", selection: setShareArticleSuccess.selection), GraphQLField.fragment(type: "SetShareArticleError", selection: setShareArticleError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setShareArticleSuccess:
        let data = Objects.SetShareArticleSuccess(updatedArticle: data.updatedArticle, updatedFeedArticle: data.updatedFeedArticle, updatedFeedArticleId: data.updatedFeedArticleId)
        return try setShareArticleSuccess.decode(data: data)
      case .setShareArticleError:
        let data = Objects.SetShareArticleError(errorCodes: data.errorCodes)
        return try setShareArticleError.decode(data: data)
      }
    case .mocking:
      return setShareArticleSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetShareArticleResult<T> = Selection<T, Unions.SetShareArticleResult>
}

extension Unions {
  struct UpdateSharedCommentResult {
    let __typename: TypeName
    let articleId: [String: String]
    let errorCodes: [String: [Enums.UpdateSharedCommentErrorCode]]
    let sharedComment: [String: String]

    enum TypeName: String, Codable {
      case updateSharedCommentSuccess = "UpdateSharedCommentSuccess"
      case updateSharedCommentError = "UpdateSharedCommentError"
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
  func on<Type>(updateSharedCommentSuccess: Selection<Type, Objects.UpdateSharedCommentSuccess>, updateSharedCommentError: Selection<Type, Objects.UpdateSharedCommentError>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateSharedCommentSuccess", selection: updateSharedCommentSuccess.selection), GraphQLField.fragment(type: "UpdateSharedCommentError", selection: updateSharedCommentError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateSharedCommentSuccess:
        let data = Objects.UpdateSharedCommentSuccess(articleId: data.articleId, sharedComment: data.sharedComment)
        return try updateSharedCommentSuccess.decode(data: data)
      case .updateSharedCommentError:
        let data = Objects.UpdateSharedCommentError(errorCodes: data.errorCodes)
        return try updateSharedCommentError.decode(data: data)
      }
    case .mocking:
      return updateSharedCommentSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateSharedCommentResult<T> = Selection<T, Unions.UpdateSharedCommentResult>
}

extension Unions {
  struct GetFollowersResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.GetFollowersErrorCode]]
    let followers: [String: [Objects.User]]

    enum TypeName: String, Codable {
      case getFollowersSuccess = "GetFollowersSuccess"
      case getFollowersError = "GetFollowersError"
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
  func on<Type>(getFollowersSuccess: Selection<Type, Objects.GetFollowersSuccess>, getFollowersError: Selection<Type, Objects.GetFollowersError>) throws -> Type {
    select([GraphQLField.fragment(type: "GetFollowersSuccess", selection: getFollowersSuccess.selection), GraphQLField.fragment(type: "GetFollowersError", selection: getFollowersError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .getFollowersSuccess:
        let data = Objects.GetFollowersSuccess(followers: data.followers)
        return try getFollowersSuccess.decode(data: data)
      case .getFollowersError:
        let data = Objects.GetFollowersError(errorCodes: data.errorCodes)
        return try getFollowersError.decode(data: data)
      }
    case .mocking:
      return getFollowersSuccess.mock()
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
      case getFollowingSuccess = "GetFollowingSuccess"
      case getFollowingError = "GetFollowingError"
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
  func on<Type>(getFollowingSuccess: Selection<Type, Objects.GetFollowingSuccess>, getFollowingError: Selection<Type, Objects.GetFollowingError>) throws -> Type {
    select([GraphQLField.fragment(type: "GetFollowingSuccess", selection: getFollowingSuccess.selection), GraphQLField.fragment(type: "GetFollowingError", selection: getFollowingError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .getFollowingSuccess:
        let data = Objects.GetFollowingSuccess(following: data.following)
        return try getFollowingSuccess.decode(data: data)
      case .getFollowingError:
        let data = Objects.GetFollowingError(errorCodes: data.errorCodes)
        return try getFollowingError.decode(data: data)
      }
    case .mocking:
      return getFollowingSuccess.mock()
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
      case getUserPersonalizationSuccess = "GetUserPersonalizationSuccess"
      case getUserPersonalizationError = "GetUserPersonalizationError"
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
  func on<Type>(getUserPersonalizationSuccess: Selection<Type, Objects.GetUserPersonalizationSuccess>, getUserPersonalizationError: Selection<Type, Objects.GetUserPersonalizationError>) throws -> Type {
    select([GraphQLField.fragment(type: "GetUserPersonalizationSuccess", selection: getUserPersonalizationSuccess.selection), GraphQLField.fragment(type: "GetUserPersonalizationError", selection: getUserPersonalizationError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .getUserPersonalizationSuccess:
        let data = Objects.GetUserPersonalizationSuccess(userPersonalization: data.userPersonalization)
        return try getUserPersonalizationSuccess.decode(data: data)
      case .getUserPersonalizationError:
        let data = Objects.GetUserPersonalizationError(errorCodes: data.errorCodes)
        return try getUserPersonalizationError.decode(data: data)
      }
    case .mocking:
      return getUserPersonalizationSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias GetUserPersonalizationResult<T> = Selection<T, Unions.GetUserPersonalizationResult>
}

extension Unions {
  struct SetUserPersonalizationResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetUserPersonalizationErrorCode]]
    let updatedUserPersonalization: [String: Objects.UserPersonalization]

    enum TypeName: String, Codable {
      case setUserPersonalizationSuccess = "SetUserPersonalizationSuccess"
      case setUserPersonalizationError = "SetUserPersonalizationError"
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
  func on<Type>(setUserPersonalizationSuccess: Selection<Type, Objects.SetUserPersonalizationSuccess>, setUserPersonalizationError: Selection<Type, Objects.SetUserPersonalizationError>) throws -> Type {
    select([GraphQLField.fragment(type: "SetUserPersonalizationSuccess", selection: setUserPersonalizationSuccess.selection), GraphQLField.fragment(type: "SetUserPersonalizationError", selection: setUserPersonalizationError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setUserPersonalizationSuccess:
        let data = Objects.SetUserPersonalizationSuccess(updatedUserPersonalization: data.updatedUserPersonalization)
        return try setUserPersonalizationSuccess.decode(data: data)
      case .setUserPersonalizationError:
        let data = Objects.SetUserPersonalizationError(errorCodes: data.errorCodes)
        return try setUserPersonalizationError.decode(data: data)
      }
    case .mocking:
      return setUserPersonalizationSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetUserPersonalizationResult<T> = Selection<T, Unions.SetUserPersonalizationResult>
}

extension Unions {
  struct ArticleSavingRequestResult {
    let __typename: TypeName
    let articleSavingRequest: [String: Objects.ArticleSavingRequest]
    let errorCodes: [String: [Enums.ArticleSavingRequestErrorCode]]

    enum TypeName: String, Codable {
      case articleSavingRequestSuccess = "ArticleSavingRequestSuccess"
      case articleSavingRequestError = "ArticleSavingRequestError"
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
  func on<Type>(articleSavingRequestSuccess: Selection<Type, Objects.ArticleSavingRequestSuccess>, articleSavingRequestError: Selection<Type, Objects.ArticleSavingRequestError>) throws -> Type {
    select([GraphQLField.fragment(type: "ArticleSavingRequestSuccess", selection: articleSavingRequestSuccess.selection), GraphQLField.fragment(type: "ArticleSavingRequestError", selection: articleSavingRequestError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .articleSavingRequestSuccess:
        let data = Objects.ArticleSavingRequestSuccess(articleSavingRequest: data.articleSavingRequest)
        return try articleSavingRequestSuccess.decode(data: data)
      case .articleSavingRequestError:
        let data = Objects.ArticleSavingRequestError(errorCodes: data.errorCodes)
        return try articleSavingRequestError.decode(data: data)
      }
    case .mocking:
      return articleSavingRequestSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArticleSavingRequestResult<T> = Selection<T, Unions.ArticleSavingRequestResult>
}

extension Unions {
  struct CreateArticleSavingRequestResult {
    let __typename: TypeName
    let articleSavingRequest: [String: Objects.ArticleSavingRequest]
    let errorCodes: [String: [Enums.CreateArticleSavingRequestErrorCode]]

    enum TypeName: String, Codable {
      case createArticleSavingRequestSuccess = "CreateArticleSavingRequestSuccess"
      case createArticleSavingRequestError = "CreateArticleSavingRequestError"
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
  func on<Type>(createArticleSavingRequestSuccess: Selection<Type, Objects.CreateArticleSavingRequestSuccess>, createArticleSavingRequestError: Selection<Type, Objects.CreateArticleSavingRequestError>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateArticleSavingRequestSuccess", selection: createArticleSavingRequestSuccess.selection), GraphQLField.fragment(type: "CreateArticleSavingRequestError", selection: createArticleSavingRequestError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createArticleSavingRequestSuccess:
        let data = Objects.CreateArticleSavingRequestSuccess(articleSavingRequest: data.articleSavingRequest)
        return try createArticleSavingRequestSuccess.decode(data: data)
      case .createArticleSavingRequestError:
        let data = Objects.CreateArticleSavingRequestError(errorCodes: data.errorCodes)
        return try createArticleSavingRequestError.decode(data: data)
      }
    case .mocking:
      return createArticleSavingRequestSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateArticleSavingRequestResult<T> = Selection<T, Unions.CreateArticleSavingRequestResult>
}

extension Unions {
  struct SetShareHighlightResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SetShareHighlightErrorCode]]
    let highlight: [String: Objects.Highlight]

    enum TypeName: String, Codable {
      case setShareHighlightSuccess = "SetShareHighlightSuccess"
      case setShareHighlightError = "SetShareHighlightError"
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
  func on<Type>(setShareHighlightSuccess: Selection<Type, Objects.SetShareHighlightSuccess>, setShareHighlightError: Selection<Type, Objects.SetShareHighlightError>) throws -> Type {
    select([GraphQLField.fragment(type: "SetShareHighlightSuccess", selection: setShareHighlightSuccess.selection), GraphQLField.fragment(type: "SetShareHighlightError", selection: setShareHighlightError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setShareHighlightSuccess:
        let data = Objects.SetShareHighlightSuccess(highlight: data.highlight)
        return try setShareHighlightSuccess.decode(data: data)
      case .setShareHighlightError:
        let data = Objects.SetShareHighlightError(errorCodes: data.errorCodes)
        return try setShareHighlightError.decode(data: data)
      }
    case .mocking:
      return setShareHighlightSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetShareHighlightResult<T> = Selection<T, Unions.SetShareHighlightResult>
}

extension Unions {
  struct UpdateLinkShareInfoResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateLinkShareInfoErrorCode]]
    let message: [String: String]

    enum TypeName: String, Codable {
      case updateLinkShareInfoSuccess = "UpdateLinkShareInfoSuccess"
      case updateLinkShareInfoError = "UpdateLinkShareInfoError"
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
  func on<Type>(updateLinkShareInfoSuccess: Selection<Type, Objects.UpdateLinkShareInfoSuccess>, updateLinkShareInfoError: Selection<Type, Objects.UpdateLinkShareInfoError>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateLinkShareInfoSuccess", selection: updateLinkShareInfoSuccess.selection), GraphQLField.fragment(type: "UpdateLinkShareInfoError", selection: updateLinkShareInfoError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateLinkShareInfoSuccess:
        let data = Objects.UpdateLinkShareInfoSuccess(message: data.message)
        return try updateLinkShareInfoSuccess.decode(data: data)
      case .updateLinkShareInfoError:
        let data = Objects.UpdateLinkShareInfoError(errorCodes: data.errorCodes)
        return try updateLinkShareInfoError.decode(data: data)
      }
    case .mocking:
      return updateLinkShareInfoSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateLinkShareInfoResult<T> = Selection<T, Unions.UpdateLinkShareInfoResult>
}

extension Unions {
  struct ArchiveLinkResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.ArchiveLinkErrorCode]]
    let linkId: [String: String]
    let message: [String: String]

    enum TypeName: String, Codable {
      case archiveLinkSuccess = "ArchiveLinkSuccess"
      case archiveLinkError = "ArchiveLinkError"
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
  func on<Type>(archiveLinkSuccess: Selection<Type, Objects.ArchiveLinkSuccess>, archiveLinkError: Selection<Type, Objects.ArchiveLinkError>) throws -> Type {
    select([GraphQLField.fragment(type: "ArchiveLinkSuccess", selection: archiveLinkSuccess.selection), GraphQLField.fragment(type: "ArchiveLinkError", selection: archiveLinkError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .archiveLinkSuccess:
        let data = Objects.ArchiveLinkSuccess(linkId: data.linkId, message: data.message)
        return try archiveLinkSuccess.decode(data: data)
      case .archiveLinkError:
        let data = Objects.ArchiveLinkError(errorCodes: data.errorCodes, message: data.message)
        return try archiveLinkError.decode(data: data)
      }
    case .mocking:
      return archiveLinkSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ArchiveLinkResult<T> = Selection<T, Unions.ArchiveLinkResult>
}

extension Unions {
  struct NewsletterEmailsResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.NewsletterEmailsErrorCode]]
    let newsletterEmails: [String: [Objects.NewsletterEmail]]

    enum TypeName: String, Codable {
      case newsletterEmailsSuccess = "NewsletterEmailsSuccess"
      case newsletterEmailsError = "NewsletterEmailsError"
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
  func on<Type>(newsletterEmailsSuccess: Selection<Type, Objects.NewsletterEmailsSuccess>, newsletterEmailsError: Selection<Type, Objects.NewsletterEmailsError>) throws -> Type {
    select([GraphQLField.fragment(type: "NewsletterEmailsSuccess", selection: newsletterEmailsSuccess.selection), GraphQLField.fragment(type: "NewsletterEmailsError", selection: newsletterEmailsError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .newsletterEmailsSuccess:
        let data = Objects.NewsletterEmailsSuccess(newsletterEmails: data.newsletterEmails)
        return try newsletterEmailsSuccess.decode(data: data)
      case .newsletterEmailsError:
        let data = Objects.NewsletterEmailsError(errorCodes: data.errorCodes)
        return try newsletterEmailsError.decode(data: data)
      }
    case .mocking:
      return newsletterEmailsSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias NewsletterEmailsResult<T> = Selection<T, Unions.NewsletterEmailsResult>
}

extension Unions {
  struct CreateNewsletterEmailResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateNewsletterEmailErrorCode]]
    let newsletterEmail: [String: Objects.NewsletterEmail]

    enum TypeName: String, Codable {
      case createNewsletterEmailSuccess = "CreateNewsletterEmailSuccess"
      case createNewsletterEmailError = "CreateNewsletterEmailError"
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
  func on<Type>(createNewsletterEmailSuccess: Selection<Type, Objects.CreateNewsletterEmailSuccess>, createNewsletterEmailError: Selection<Type, Objects.CreateNewsletterEmailError>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateNewsletterEmailSuccess", selection: createNewsletterEmailSuccess.selection), GraphQLField.fragment(type: "CreateNewsletterEmailError", selection: createNewsletterEmailError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createNewsletterEmailSuccess:
        let data = Objects.CreateNewsletterEmailSuccess(newsletterEmail: data.newsletterEmail)
        return try createNewsletterEmailSuccess.decode(data: data)
      case .createNewsletterEmailError:
        let data = Objects.CreateNewsletterEmailError(errorCodes: data.errorCodes)
        return try createNewsletterEmailError.decode(data: data)
      }
    case .mocking:
      return createNewsletterEmailSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateNewsletterEmailResult<T> = Selection<T, Unions.CreateNewsletterEmailResult>
}

extension Unions {
  struct DeleteNewsletterEmailResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteNewsletterEmailErrorCode]]
    let newsletterEmail: [String: Objects.NewsletterEmail]

    enum TypeName: String, Codable {
      case deleteNewsletterEmailSuccess = "DeleteNewsletterEmailSuccess"
      case deleteNewsletterEmailError = "DeleteNewsletterEmailError"
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
  func on<Type>(deleteNewsletterEmailSuccess: Selection<Type, Objects.DeleteNewsletterEmailSuccess>, deleteNewsletterEmailError: Selection<Type, Objects.DeleteNewsletterEmailError>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteNewsletterEmailSuccess", selection: deleteNewsletterEmailSuccess.selection), GraphQLField.fragment(type: "DeleteNewsletterEmailError", selection: deleteNewsletterEmailError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteNewsletterEmailSuccess:
        let data = Objects.DeleteNewsletterEmailSuccess(newsletterEmail: data.newsletterEmail)
        return try deleteNewsletterEmailSuccess.decode(data: data)
      case .deleteNewsletterEmailError:
        let data = Objects.DeleteNewsletterEmailError(errorCodes: data.errorCodes)
        return try deleteNewsletterEmailError.decode(data: data)
      }
    case .mocking:
      return deleteNewsletterEmailSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteNewsletterEmailResult<T> = Selection<T, Unions.DeleteNewsletterEmailResult>
}

extension Unions {
  struct ReminderResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.ReminderErrorCode]]
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case reminderSuccess = "ReminderSuccess"
      case reminderError = "ReminderError"
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
  func on<Type>(reminderSuccess: Selection<Type, Objects.ReminderSuccess>, reminderError: Selection<Type, Objects.ReminderError>) throws -> Type {
    select([GraphQLField.fragment(type: "ReminderSuccess", selection: reminderSuccess.selection), GraphQLField.fragment(type: "ReminderError", selection: reminderError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .reminderSuccess:
        let data = Objects.ReminderSuccess(reminder: data.reminder)
        return try reminderSuccess.decode(data: data)
      case .reminderError:
        let data = Objects.ReminderError(errorCodes: data.errorCodes)
        return try reminderError.decode(data: data)
      }
    case .mocking:
      return reminderSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias ReminderResult<T> = Selection<T, Unions.ReminderResult>
}

extension Unions {
  struct CreateReminderResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateReminderErrorCode]]
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case createReminderSuccess = "CreateReminderSuccess"
      case createReminderError = "CreateReminderError"
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
  func on<Type>(createReminderSuccess: Selection<Type, Objects.CreateReminderSuccess>, createReminderError: Selection<Type, Objects.CreateReminderError>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateReminderSuccess", selection: createReminderSuccess.selection), GraphQLField.fragment(type: "CreateReminderError", selection: createReminderError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createReminderSuccess:
        let data = Objects.CreateReminderSuccess(reminder: data.reminder)
        return try createReminderSuccess.decode(data: data)
      case .createReminderError:
        let data = Objects.CreateReminderError(errorCodes: data.errorCodes)
        return try createReminderError.decode(data: data)
      }
    case .mocking:
      return createReminderSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateReminderResult<T> = Selection<T, Unions.CreateReminderResult>
}

extension Unions {
  struct UpdateReminderResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.UpdateReminderErrorCode]]
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case updateReminderSuccess = "UpdateReminderSuccess"
      case updateReminderError = "UpdateReminderError"
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
  func on<Type>(updateReminderSuccess: Selection<Type, Objects.UpdateReminderSuccess>, updateReminderError: Selection<Type, Objects.UpdateReminderError>) throws -> Type {
    select([GraphQLField.fragment(type: "UpdateReminderSuccess", selection: updateReminderSuccess.selection), GraphQLField.fragment(type: "UpdateReminderError", selection: updateReminderError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .updateReminderSuccess:
        let data = Objects.UpdateReminderSuccess(reminder: data.reminder)
        return try updateReminderSuccess.decode(data: data)
      case .updateReminderError:
        let data = Objects.UpdateReminderError(errorCodes: data.errorCodes)
        return try updateReminderError.decode(data: data)
      }
    case .mocking:
      return updateReminderSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias UpdateReminderResult<T> = Selection<T, Unions.UpdateReminderResult>
}

extension Unions {
  struct DeleteReminderResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteReminderErrorCode]]
    let reminder: [String: Objects.Reminder]

    enum TypeName: String, Codable {
      case deleteReminderSuccess = "DeleteReminderSuccess"
      case deleteReminderError = "DeleteReminderError"
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
  func on<Type>(deleteReminderSuccess: Selection<Type, Objects.DeleteReminderSuccess>, deleteReminderError: Selection<Type, Objects.DeleteReminderError>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteReminderSuccess", selection: deleteReminderSuccess.selection), GraphQLField.fragment(type: "DeleteReminderError", selection: deleteReminderError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteReminderSuccess:
        let data = Objects.DeleteReminderSuccess(reminder: data.reminder)
        return try deleteReminderSuccess.decode(data: data)
      case .deleteReminderError:
        let data = Objects.DeleteReminderError(errorCodes: data.errorCodes)
        return try deleteReminderError.decode(data: data)
      }
    case .mocking:
      return deleteReminderSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteReminderResult<T> = Selection<T, Unions.DeleteReminderResult>
}

extension Unions {
  struct SetDeviceTokenResult {
    let __typename: TypeName
    let deviceToken: [String: Objects.DeviceToken]
    let errorCodes: [String: [Enums.SetDeviceTokenErrorCode]]

    enum TypeName: String, Codable {
      case setDeviceTokenSuccess = "SetDeviceTokenSuccess"
      case setDeviceTokenError = "SetDeviceTokenError"
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
  func on<Type>(setDeviceTokenSuccess: Selection<Type, Objects.SetDeviceTokenSuccess>, setDeviceTokenError: Selection<Type, Objects.SetDeviceTokenError>) throws -> Type {
    select([GraphQLField.fragment(type: "SetDeviceTokenSuccess", selection: setDeviceTokenSuccess.selection), GraphQLField.fragment(type: "SetDeviceTokenError", selection: setDeviceTokenError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .setDeviceTokenSuccess:
        let data = Objects.SetDeviceTokenSuccess(deviceToken: data.deviceToken)
        return try setDeviceTokenSuccess.decode(data: data)
      case .setDeviceTokenError:
        let data = Objects.SetDeviceTokenError(errorCodes: data.errorCodes)
        return try setDeviceTokenError.decode(data: data)
      }
    case .mocking:
      return setDeviceTokenSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SetDeviceTokenResult<T> = Selection<T, Unions.SetDeviceTokenResult>
}

extension Unions {
  struct LabelsResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.LabelsErrorCode]]
    let labels: [String: [Objects.Label]]

    enum TypeName: String, Codable {
      case labelsSuccess = "LabelsSuccess"
      case labelsError = "LabelsError"
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
  func on<Type>(labelsSuccess: Selection<Type, Objects.LabelsSuccess>, labelsError: Selection<Type, Objects.LabelsError>) throws -> Type {
    select([GraphQLField.fragment(type: "LabelsSuccess", selection: labelsSuccess.selection), GraphQLField.fragment(type: "LabelsError", selection: labelsError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .labelsSuccess:
        let data = Objects.LabelsSuccess(labels: data.labels)
        return try labelsSuccess.decode(data: data)
      case .labelsError:
        let data = Objects.LabelsError(errorCodes: data.errorCodes)
        return try labelsError.decode(data: data)
      }
    case .mocking:
      return labelsSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias LabelsResult<T> = Selection<T, Unions.LabelsResult>
}

extension Unions {
  struct CreateLabelResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.CreateLabelErrorCode]]
    let label: [String: Objects.Label]

    enum TypeName: String, Codable {
      case createLabelSuccess = "CreateLabelSuccess"
      case createLabelError = "CreateLabelError"
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
  func on<Type>(createLabelSuccess: Selection<Type, Objects.CreateLabelSuccess>, createLabelError: Selection<Type, Objects.CreateLabelError>) throws -> Type {
    select([GraphQLField.fragment(type: "CreateLabelSuccess", selection: createLabelSuccess.selection), GraphQLField.fragment(type: "CreateLabelError", selection: createLabelError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .createLabelSuccess:
        let data = Objects.CreateLabelSuccess(label: data.label)
        return try createLabelSuccess.decode(data: data)
      case .createLabelError:
        let data = Objects.CreateLabelError(errorCodes: data.errorCodes)
        return try createLabelError.decode(data: data)
      }
    case .mocking:
      return createLabelSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias CreateLabelResult<T> = Selection<T, Unions.CreateLabelResult>
}

extension Unions {
  struct DeleteLabelResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.DeleteLabelErrorCode]]
    let label: [String: Objects.Label]

    enum TypeName: String, Codable {
      case deleteLabelSuccess = "DeleteLabelSuccess"
      case deleteLabelError = "DeleteLabelError"
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
  func on<Type>(deleteLabelSuccess: Selection<Type, Objects.DeleteLabelSuccess>, deleteLabelError: Selection<Type, Objects.DeleteLabelError>) throws -> Type {
    select([GraphQLField.fragment(type: "DeleteLabelSuccess", selection: deleteLabelSuccess.selection), GraphQLField.fragment(type: "DeleteLabelError", selection: deleteLabelError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .deleteLabelSuccess:
        let data = Objects.DeleteLabelSuccess(label: data.label)
        return try deleteLabelSuccess.decode(data: data)
      case .deleteLabelError:
        let data = Objects.DeleteLabelError(errorCodes: data.errorCodes)
        return try deleteLabelError.decode(data: data)
      }
    case .mocking:
      return deleteLabelSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias DeleteLabelResult<T> = Selection<T, Unions.DeleteLabelResult>
}

extension Unions {
  struct SignupResult {
    let __typename: TypeName
    let errorCodes: [String: [Enums.SignupErrorCode?]]
    let me: [String: Objects.User]

    enum TypeName: String, Codable {
      case signupSuccess = "SignupSuccess"
      case signupError = "SignupError"
    }
  }
}

extension Unions.SignupResult: Decodable {
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

extension Fields where TypeLock == Unions.SignupResult {
  func on<Type>(signupSuccess: Selection<Type, Objects.SignupSuccess>, signupError: Selection<Type, Objects.SignupError>) throws -> Type {
    select([GraphQLField.fragment(type: "SignupSuccess", selection: signupSuccess.selection), GraphQLField.fragment(type: "SignupError", selection: signupError.selection)])

    switch response {
    case let .decoding(data):
      switch data.__typename {
      case .signupSuccess:
        let data = Objects.SignupSuccess(me: data.me)
        return try signupSuccess.decode(data: data)
      case .signupError:
        let data = Objects.SignupError(errorCodes: data.errorCodes)
        return try signupError.decode(data: data)
      }
    case .mocking:
      return signupSuccess.mock()
    }
  }
}

extension Selection where TypeLock == Never, Type == Never {
  typealias SignupResult<T> = Selection<T, Unions.SignupResult>
}

// MARK: - Enums

enum Enums {}
extension Enums {
  /// SortOrder
  enum SortOrder: String, CaseIterable, Codable {
    case ascending = "ASCENDING"

    case descending = "DESCENDING"
  }
}

extension Enums {
  /// ReactionType
  enum ReactionType: String, CaseIterable, Codable {
    case like = "LIKE"

    case heart = "HEART"

    case smile = "SMILE"

    case hushed = "HUSHED"

    case crying = "CRYING"

    case pout = "POUT"
  }
}

extension Enums {
  /// SortBy
  enum SortBy: String, CaseIterable, Codable {
    case updatedTime = "UPDATED_TIME"
  }
}

extension Enums {
  /// ContentReader
  enum ContentReader: String, CaseIterable, Codable {
    case web = "WEB"

    case pdf = "PDF"
  }
}

extension Enums {
  /// UserErrorCode
  enum UserErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case userNotFound = "USER_NOT_FOUND"

    case badRequest = "BAD_REQUEST"
  }
}

extension Enums {
  /// UsersErrorCode
  enum UsersErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// LoginErrorCode
  enum LoginErrorCode: String, CaseIterable, Codable {
    case authFailed = "AUTH_FAILED"

    case userAlreadyExists = "USER_ALREADY_EXISTS"

    case invalidCredentials = "INVALID_CREDENTIALS"

    case userNotFound = "USER_NOT_FOUND"

    case wrongSource = "WRONG_SOURCE"

    case accessDenied = "ACCESS_DENIED"
  }
}

extension Enums {
  /// SignupErrorCode
  enum SignupErrorCode: String, CaseIterable, Codable {
    case unknown = "UNKNOWN"

    case accessDenied = "ACCESS_DENIED"

    case googleAuthError = "GOOGLE_AUTH_ERROR"

    case invalidUsername = "INVALID_USERNAME"

    case userExists = "USER_EXISTS"

    case expiredToken = "EXPIRED_TOKEN"

    case invalidPassword = "INVALID_PASSWORD"
  }
}

extension Enums {
  /// LogOutErrorCode
  enum LogOutErrorCode: String, CaseIterable, Codable {
    case logOutFailed = "LOG_OUT_FAILED"
  }
}

extension Enums {
  /// UpdateUserErrorCode
  enum UpdateUserErrorCode: String, CaseIterable, Codable {
    case emptyName = "EMPTY_NAME"

    case bioTooLong = "BIO_TOO_LONG"

    case userNotFound = "USER_NOT_FOUND"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UpdateUserProfileErrorCode
  enum UpdateUserProfileErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case badData = "BAD_DATA"

    case badUsername = "BAD_USERNAME"

    case usernameExists = "USERNAME_EXISTS"
  }
}

extension Enums {
  /// PageType
  enum PageType: String, CaseIterable, Codable {
    case article = "ARTICLE"

    case book = "BOOK"

    case file = "FILE"

    case profile = "PROFILE"

    case website = "WEBSITE"

    case unknown = "UNKNOWN"
  }
}

extension Enums {
  /// ArticleErrorCode
  enum ArticleErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"

    case badData = "BAD_DATA"

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
  /// ArticlesErrorCode
  enum ArticlesErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// UploadFileStatus
  enum UploadFileStatus: String, CaseIterable, Codable {
    case initialized = "INITIALIZED"

    case completed = "COMPLETED"
  }
}

extension Enums {
  /// UploadFileRequestErrorCode
  enum UploadFileRequestErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badInput = "BAD_INPUT"

    case failedCreate = "FAILED_CREATE"
  }
}

extension Enums {
  /// CreateArticleErrorCode
  enum CreateArticleErrorCode: String, CaseIterable, Codable {
    case unableToFetch = "UNABLE_TO_FETCH"

    case unableToParse = "UNABLE_TO_PARSE"

    case unauthorized = "UNAUTHORIZED"

    case notAllowedToParse = "NOT_ALLOWED_TO_PARSE"

    case payloadTooLarge = "PAYLOAD_TOO_LARGE"

    case uploadFileMissing = "UPLOAD_FILE_MISSING"
  }
}

extension Enums {
  /// SaveErrorCode
  enum SaveErrorCode: String, CaseIterable, Codable {
    case unknown = "UNKNOWN"

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
  /// SaveArticleReadingProgressErrorCode
  enum SaveArticleReadingProgressErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"

    case badData = "BAD_DATA"

    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// SetBookmarkArticleErrorCode
  enum SetBookmarkArticleErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"

    case bookmarkExists = "BOOKMARK_EXISTS"
  }
}

extension Enums {
  /// CreateHighlightErrorCode
  enum CreateHighlightErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case badData = "BAD_DATA"

    case notFound = "NOT_FOUND"

    case alreadyExists = "ALREADY_EXISTS"
  }
}

extension Enums {
  /// MergeHighlightErrorCode
  enum MergeHighlightErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case badData = "BAD_DATA"

    case notFound = "NOT_FOUND"

    case alreadyExists = "ALREADY_EXISTS"
  }
}

extension Enums {
  /// UpdateHighlightErrorCode
  enum UpdateHighlightErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case badData = "BAD_DATA"
  }
}

extension Enums {
  /// DeleteHighlightErrorCode
  enum DeleteHighlightErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// CreateHighlightReplyErrorCode
  enum CreateHighlightReplyErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"

    case emptyAnnotation = "EMPTY_ANNOTATION"
  }
}

extension Enums {
  /// UpdateHighlightReplyErrorCode
  enum UpdateHighlightReplyErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// DeleteHighlightReplyErrorCode
  enum DeleteHighlightReplyErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// CreateReactionErrorCode
  enum CreateReactionErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case badTarget = "BAD_TARGET"

    case badCode = "BAD_CODE"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// DeleteReactionErrorCode
  enum DeleteReactionErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case forbidden = "FORBIDDEN"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// FeedArticlesErrorCode
  enum FeedArticlesErrorCode: String, CaseIterable, Codable {
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
  /// UpdateSharedCommentErrorCode
  enum UpdateSharedCommentErrorCode: String, CaseIterable, Codable {
    case notFound = "NOT_FOUND"

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
  /// SetUserPersonalizationErrorCode
  enum SetUserPersonalizationErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"
  }
}

extension Enums {
  /// ArticleSavingRequestStatus
  enum ArticleSavingRequestStatus: String, CaseIterable, Codable {
    case processing = "PROCESSING"

    case succeeded = "SUCCEEDED"

    case failed = "FAILED"
  }
}

extension Enums {
  /// ArticleSavingRequestErrorCode
  enum ArticleSavingRequestErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// CreateArticleSavingRequestErrorCode
  enum CreateArticleSavingRequestErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badData = "BAD_DATA"
  }
}

extension Enums {
  /// SetShareHighlightErrorCode
  enum SetShareHighlightErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case notFound = "NOT_FOUND"

    case forbidden = "FORBIDDEN"
  }
}

extension Enums {
  /// ReportType
  enum ReportType: String, CaseIterable, Codable {
    case spam = "SPAM"

    case abusive = "ABUSIVE"

    case contentDisplay = "CONTENT_DISPLAY"

    case contentViolation = "CONTENT_VIOLATION"
  }
}

extension Enums {
  /// UpdateLinkShareInfoErrorCode
  enum UpdateLinkShareInfoErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"
  }
}

extension Enums {
  /// ArchiveLinkErrorCode
  enum ArchiveLinkErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"
  }
}

extension Enums {
  /// NewsletterEmailsErrorCode
  enum NewsletterEmailsErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"
  }
}

extension Enums {
  /// CreateNewsletterEmailErrorCode
  enum CreateNewsletterEmailErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"
  }
}

extension Enums {
  /// DeleteNewsletterEmailErrorCode
  enum DeleteNewsletterEmailErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// ReminderErrorCode
  enum ReminderErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// CreateReminderErrorCode
  enum CreateReminderErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// UpdateReminderErrorCode
  enum UpdateReminderErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// DeleteReminderErrorCode
  enum DeleteReminderErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// SetDeviceTokenErrorCode
  enum SetDeviceTokenErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// LabelsErrorCode
  enum LabelsErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// CreateLabelErrorCode
  enum CreateLabelErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

extension Enums {
  /// DeleteLabelErrorCode
  enum DeleteLabelErrorCode: String, CaseIterable, Codable {
    case unauthorized = "UNAUTHORIZED"

    case badRequest = "BAD_REQUEST"

    case notFound = "NOT_FOUND"
  }
}

// MARK: - Input Objects

enum InputObjects {}
extension InputObjects {
  struct SortParams: Encodable, Hashable {
    var order: OptionalArgument<Enums.SortOrder> = .absent()

    var by: Enums.SortBy

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if order.hasValue { try container.encode(order, forKey: .order) }
      try container.encode(by, forKey: .by)
    }

    enum CodingKeys: String, CodingKey {
      case order
      case by
    }
  }
}

extension InputObjects {
  struct GoogleLoginInput: Encodable, Hashable {
    var secret: String

    var email: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(secret, forKey: .secret)
      try container.encode(email, forKey: .email)
    }

    enum CodingKeys: String, CodingKey {
      case secret
      case email
    }
  }
}

extension InputObjects {
  struct GoogleSignupInput: Encodable, Hashable {
    var secret: String

    var email: String

    var username: String

    var name: String

    var pictureUrl: String

    var sourceUserId: String

    var bio: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(secret, forKey: .secret)
      try container.encode(email, forKey: .email)
      try container.encode(username, forKey: .username)
      try container.encode(name, forKey: .name)
      try container.encode(pictureUrl, forKey: .pictureUrl)
      try container.encode(sourceUserId, forKey: .sourceUserId)
      if bio.hasValue { try container.encode(bio, forKey: .bio) }
    }

    enum CodingKeys: String, CodingKey {
      case secret
      case email
      case username
      case name
      case pictureUrl
      case sourceUserId
      case bio
    }
  }
}

extension InputObjects {
  struct UpdateUserInput: Encodable, Hashable {
    var name: String

    var bio: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(name, forKey: .name)
      if bio.hasValue { try container.encode(bio, forKey: .bio) }
    }

    enum CodingKeys: String, CodingKey {
      case name
      case bio
    }
  }
}

extension InputObjects {
  struct UpdateUserProfileInput: Encodable, Hashable {
    var userId: String

    var username: OptionalArgument<String> = .absent()

    var bio: OptionalArgument<String> = .absent()

    var pictureUrl: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(userId, forKey: .userId)
      if username.hasValue { try container.encode(username, forKey: .username) }
      if bio.hasValue { try container.encode(bio, forKey: .bio) }
      if pictureUrl.hasValue { try container.encode(pictureUrl, forKey: .pictureUrl) }
    }

    enum CodingKeys: String, CodingKey {
      case userId
      case username
      case bio
      case pictureUrl
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
  struct PageInfoInput: Encodable, Hashable {
    var title: OptionalArgument<String> = .absent()

    var author: OptionalArgument<String> = .absent()

    var description: OptionalArgument<String> = .absent()

    var previewImage: OptionalArgument<String> = .absent()

    var canonicalUrl: OptionalArgument<String> = .absent()

    var publishedAt: OptionalArgument<DateTime> = .absent()

    var contentType: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if title.hasValue { try container.encode(title, forKey: .title) }
      if author.hasValue { try container.encode(author, forKey: .author) }
      if description.hasValue { try container.encode(description, forKey: .description) }
      if previewImage.hasValue { try container.encode(previewImage, forKey: .previewImage) }
      if canonicalUrl.hasValue { try container.encode(canonicalUrl, forKey: .canonicalUrl) }
      if publishedAt.hasValue { try container.encode(publishedAt, forKey: .publishedAt) }
      if contentType.hasValue { try container.encode(contentType, forKey: .contentType) }
    }

    enum CodingKeys: String, CodingKey {
      case title
      case author
      case description
      case previewImage
      case canonicalUrl
      case publishedAt
      case contentType
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
  struct UploadFileRequestInput: Encodable, Hashable {
    var url: String

    var contentType: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(url, forKey: .url)
      try container.encode(contentType, forKey: .contentType)
    }

    enum CodingKeys: String, CodingKey {
      case url
      case contentType
    }
  }
}

extension InputObjects {
  struct CreateArticleInput: Encodable, Hashable {
    var url: String

    var preparedDocument: OptionalArgument<InputObjects.PreparedDocumentInput> = .absent()

    var articleSavingRequestId: OptionalArgument<String> = .absent()

    var uploadFileId: OptionalArgument<String> = .absent()

    var skipParsing: OptionalArgument<Bool> = .absent()

    var source: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(url, forKey: .url)
      if preparedDocument.hasValue { try container.encode(preparedDocument, forKey: .preparedDocument) }
      if articleSavingRequestId.hasValue { try container.encode(articleSavingRequestId, forKey: .articleSavingRequestId) }
      if uploadFileId.hasValue { try container.encode(uploadFileId, forKey: .uploadFileId) }
      if skipParsing.hasValue { try container.encode(skipParsing, forKey: .skipParsing) }
      if source.hasValue { try container.encode(source, forKey: .source) }
    }

    enum CodingKeys: String, CodingKey {
      case url
      case preparedDocument
      case articleSavingRequestId
      case uploadFileId
      case skipParsing
      case source
    }
  }
}

extension InputObjects {
  struct SaveFileInput: Encodable, Hashable {
    var url: String

    var source: String

    var clientRequestId: String

    var uploadFileId: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(url, forKey: .url)
      try container.encode(source, forKey: .source)
      try container.encode(clientRequestId, forKey: .clientRequestId)
      try container.encode(uploadFileId, forKey: .uploadFileId)
    }

    enum CodingKeys: String, CodingKey {
      case url
      case source
      case clientRequestId
      case uploadFileId
    }
  }
}

extension InputObjects {
  struct SavePageInput: Encodable, Hashable {
    var url: String

    var source: String

    var clientRequestId: String

    var title: OptionalArgument<String> = .absent()

    var originalContent: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(url, forKey: .url)
      try container.encode(source, forKey: .source)
      try container.encode(clientRequestId, forKey: .clientRequestId)
      if title.hasValue { try container.encode(title, forKey: .title) }
      try container.encode(originalContent, forKey: .originalContent)
    }

    enum CodingKeys: String, CodingKey {
      case url
      case source
      case clientRequestId
      case title
      case originalContent
    }
  }
}

extension InputObjects {
  struct SaveUrlInput: Encodable, Hashable {
    var url: String

    var source: String

    var clientRequestId: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(url, forKey: .url)
      try container.encode(source, forKey: .source)
      try container.encode(clientRequestId, forKey: .clientRequestId)
    }

    enum CodingKeys: String, CodingKey {
      case url
      case source
      case clientRequestId
    }
  }
}

extension InputObjects {
  struct SetFollowInput: Encodable, Hashable {
    var userId: String

    var follow: Bool

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(userId, forKey: .userId)
      try container.encode(follow, forKey: .follow)
    }

    enum CodingKeys: String, CodingKey {
      case userId
      case follow
    }
  }
}

extension InputObjects {
  struct SaveArticleReadingProgressInput: Encodable, Hashable {
    var id: String

    var readingProgressPercent: Double

    var readingProgressAnchorIndex: Int

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(id, forKey: .id)
      try container.encode(readingProgressPercent, forKey: .readingProgressPercent)
      try container.encode(readingProgressAnchorIndex, forKey: .readingProgressAnchorIndex)
    }

    enum CodingKeys: String, CodingKey {
      case id
      case readingProgressPercent
      case readingProgressAnchorIndex
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
  struct CreateHighlightInput: Encodable, Hashable {
    var id: String

    var shortId: String

    var articleId: String

    var patch: String

    var quote: String

    var prefix: OptionalArgument<String> = .absent()

    var suffix: OptionalArgument<String> = .absent()

    var annotation: OptionalArgument<String> = .absent()

    var sharedAt: OptionalArgument<DateTime> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(id, forKey: .id)
      try container.encode(shortId, forKey: .shortId)
      try container.encode(articleId, forKey: .articleId)
      try container.encode(patch, forKey: .patch)
      try container.encode(quote, forKey: .quote)
      if prefix.hasValue { try container.encode(prefix, forKey: .prefix) }
      if suffix.hasValue { try container.encode(suffix, forKey: .suffix) }
      if annotation.hasValue { try container.encode(annotation, forKey: .annotation) }
      if sharedAt.hasValue { try container.encode(sharedAt, forKey: .sharedAt) }
    }

    enum CodingKeys: String, CodingKey {
      case id
      case shortId
      case articleId
      case patch
      case quote
      case prefix
      case suffix
      case annotation
      case sharedAt
    }
  }
}

extension InputObjects {
  struct MergeHighlightInput: Encodable, Hashable {
    var id: String

    var shortId: String

    var articleId: String

    var patch: String

    var quote: String

    var prefix: OptionalArgument<String> = .absent()

    var suffix: OptionalArgument<String> = .absent()

    var annotation: OptionalArgument<String> = .absent()

    var overlapHighlightIdList: [String]

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(id, forKey: .id)
      try container.encode(shortId, forKey: .shortId)
      try container.encode(articleId, forKey: .articleId)
      try container.encode(patch, forKey: .patch)
      try container.encode(quote, forKey: .quote)
      if prefix.hasValue { try container.encode(prefix, forKey: .prefix) }
      if suffix.hasValue { try container.encode(suffix, forKey: .suffix) }
      if annotation.hasValue { try container.encode(annotation, forKey: .annotation) }
      try container.encode(overlapHighlightIdList, forKey: .overlapHighlightIdList)
    }

    enum CodingKeys: String, CodingKey {
      case id
      case shortId
      case articleId
      case patch
      case quote
      case prefix
      case suffix
      case annotation
      case overlapHighlightIdList
    }
  }
}

extension InputObjects {
  struct UpdateHighlightInput: Encodable, Hashable {
    var highlightId: String

    var annotation: OptionalArgument<String> = .absent()

    var sharedAt: OptionalArgument<DateTime> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(highlightId, forKey: .highlightId)
      if annotation.hasValue { try container.encode(annotation, forKey: .annotation) }
      if sharedAt.hasValue { try container.encode(sharedAt, forKey: .sharedAt) }
    }

    enum CodingKeys: String, CodingKey {
      case highlightId
      case annotation
      case sharedAt
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
  struct CreateReactionInput: Encodable, Hashable {
    var highlightId: OptionalArgument<String> = .absent()

    var userArticleId: OptionalArgument<String> = .absent()

    var code: Enums.ReactionType

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if highlightId.hasValue { try container.encode(highlightId, forKey: .highlightId) }
      if userArticleId.hasValue { try container.encode(userArticleId, forKey: .userArticleId) }
      try container.encode(code, forKey: .code)
    }

    enum CodingKeys: String, CodingKey {
      case highlightId
      case userArticleId
      case code
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
  struct SetUserPersonalizationInput: Encodable, Hashable {
    var theme: OptionalArgument<String> = .absent()

    var fontSize: OptionalArgument<Int> = .absent()

    var fontFamily: OptionalArgument<String> = .absent()

    var margin: OptionalArgument<Int> = .absent()

    var libraryLayoutType: OptionalArgument<String> = .absent()

    var librarySortOrder: OptionalArgument<Enums.SortOrder> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if theme.hasValue { try container.encode(theme, forKey: .theme) }
      if fontSize.hasValue { try container.encode(fontSize, forKey: .fontSize) }
      if fontFamily.hasValue { try container.encode(fontFamily, forKey: .fontFamily) }
      if margin.hasValue { try container.encode(margin, forKey: .margin) }
      if libraryLayoutType.hasValue { try container.encode(libraryLayoutType, forKey: .libraryLayoutType) }
      if librarySortOrder.hasValue { try container.encode(librarySortOrder, forKey: .librarySortOrder) }
    }

    enum CodingKeys: String, CodingKey {
      case theme
      case fontSize
      case fontFamily
      case margin
      case libraryLayoutType
      case librarySortOrder
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
  struct ReportItemInput: Encodable, Hashable {
    var pageId: String

    var itemUrl: String

    var sharedBy: OptionalArgument<String> = .absent()

    var reportTypes: [Enums.ReportType]

    var reportComment: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(pageId, forKey: .pageId)
      try container.encode(itemUrl, forKey: .itemUrl)
      if sharedBy.hasValue { try container.encode(sharedBy, forKey: .sharedBy) }
      try container.encode(reportTypes, forKey: .reportTypes)
      try container.encode(reportComment, forKey: .reportComment)
    }

    enum CodingKeys: String, CodingKey {
      case pageId
      case itemUrl
      case sharedBy
      case reportTypes
      case reportComment
    }
  }
}

extension InputObjects {
  struct UpdateLinkShareInfoInput: Encodable, Hashable {
    var linkId: String

    var title: String

    var description: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(linkId, forKey: .linkId)
      try container.encode(title, forKey: .title)
      try container.encode(description, forKey: .description)
    }

    enum CodingKeys: String, CodingKey {
      case linkId
      case title
      case description
    }
  }
}

extension InputObjects {
  struct ArchiveLinkInput: Encodable, Hashable {
    var linkId: String

    var archived: Bool

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(linkId, forKey: .linkId)
      try container.encode(archived, forKey: .archived)
    }

    enum CodingKeys: String, CodingKey {
      case linkId
      case archived
    }
  }
}

extension InputObjects {
  struct CreateReminderInput: Encodable, Hashable {
    var linkId: OptionalArgument<String> = .absent()

    var clientRequestId: OptionalArgument<String> = .absent()

    var archiveUntil: Bool

    var sendNotification: Bool

    var remindAt: DateTime

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      if linkId.hasValue { try container.encode(linkId, forKey: .linkId) }
      if clientRequestId.hasValue { try container.encode(clientRequestId, forKey: .clientRequestId) }
      try container.encode(archiveUntil, forKey: .archiveUntil)
      try container.encode(sendNotification, forKey: .sendNotification)
      try container.encode(remindAt, forKey: .remindAt)
    }

    enum CodingKeys: String, CodingKey {
      case linkId
      case clientRequestId
      case archiveUntil
      case sendNotification
      case remindAt
    }
  }
}

extension InputObjects {
  struct UpdateReminderInput: Encodable, Hashable {
    var id: String

    var archiveUntil: Bool

    var sendNotification: Bool

    var remindAt: DateTime

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(id, forKey: .id)
      try container.encode(archiveUntil, forKey: .archiveUntil)
      try container.encode(sendNotification, forKey: .sendNotification)
      try container.encode(remindAt, forKey: .remindAt)
    }

    enum CodingKeys: String, CodingKey {
      case id
      case archiveUntil
      case sendNotification
      case remindAt
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
  struct CreateLabelInput: Encodable, Hashable {
    var linkId: String

    var name: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(linkId, forKey: .linkId)
      try container.encode(name, forKey: .name)
    }

    enum CodingKeys: String, CodingKey {
      case linkId
      case name
    }
  }
}

extension InputObjects {
  struct LoginInput: Encodable, Hashable {
    var password: String

    var email: String

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(password, forKey: .password)
      try container.encode(email, forKey: .email)
    }

    enum CodingKeys: String, CodingKey {
      case password
      case email
    }
  }
}

extension InputObjects {
  struct SignupInput: Encodable, Hashable {
    var email: String

    var password: String

    var username: String

    var name: String

    var pictureUrl: OptionalArgument<String> = .absent()

    var bio: OptionalArgument<String> = .absent()

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(email, forKey: .email)
      try container.encode(password, forKey: .password)
      try container.encode(username, forKey: .username)
      try container.encode(name, forKey: .name)
      if pictureUrl.hasValue { try container.encode(pictureUrl, forKey: .pictureUrl) }
      if bio.hasValue { try container.encode(bio, forKey: .bio) }
    }

    enum CodingKeys: String, CodingKey {
      case email
      case password
      case username
      case name
      case pictureUrl
      case bio
    }
  }
}
