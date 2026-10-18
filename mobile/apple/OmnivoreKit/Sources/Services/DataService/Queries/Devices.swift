import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func devices() async throws -> [InternalDeviceToken] {
    enum QueryResult {
      case success(result: [InternalDeviceToken])
      case error(error: String)
    }

    let deviceTokensSelection = Selection.DeviceToken {
      InternalDeviceToken(
        id: try $0.id(),
        createdAt: try $0.createdAt().value
      )
    }

    let selection = Selection<QueryResult, Unions.DeviceTokensResult> {
      try $0.on(
        deviceTokensError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        deviceTokensSuccess: .init {
          QueryResult.success(result: try $0.deviceTokens(selection: deviceTokensSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.deviceTokens(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network request failed"))
          return
        }

        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "DeviceToken Email fetch error"))
        }
      }
    }
  }
}
