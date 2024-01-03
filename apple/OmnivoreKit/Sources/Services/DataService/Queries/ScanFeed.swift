import CoreData
import Foundation
import Models
import SwiftGraphQL

public struct Feed {
  public var title: String
  public var url: String
  public var description: String?
  public var image: String?
  public var author: String?
}

let feedSelection = Selection.Feed {
  Feed(
    title: try $0.title(),
    url: try $0.url(),
    description: try $0.description(),
    image: try $0.image(),
    author: try $0.author()
  )
}

public extension DataService {
  func scanFeed(feedURL: URL) async throws -> [Feed] {
    enum QueryResult {
      case success(result: [Feed])
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.ScanFeedsResult> {
      try $0.on(
        scanFeedsError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        scanFeedsSuccess: .init {
          QueryResult.success(result: try $0.feeds(selection: feedSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.scanFeeds(
        input: InputObjects.ScanFeedsInput(url: OptionalArgument(feedURL.absoluteString)),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        print("QUERY RESULT: ", queryResult)
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network request failed"))
          return
        }

        switch payload.data {
        case let .success(result: feeds):
          continuation.resume(returning: feeds)
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "scanFeed fetch error"))
        }
      }
    }
  }
}
