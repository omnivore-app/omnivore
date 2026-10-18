import Foundation
import Models
import SwiftGraphQL

public struct Feature {
  public let name: String
  public let token: String
  public let granted: Bool
}

public enum IneligibleError: Error {
  case message(messageText: String)
}

public extension DataService {
  func optInFeature(name: String) async throws -> Feature? {
    enum MutationResult {
      case success(feature: Feature)
      case error(errorCode: Enums.OptInFeatureErrorCode)
    }

    let featureSelection = Selection.Feature {
      Feature(name: try $0.name(), token: try $0.token(), granted: try $0.grantedAt() != nil)
    }
    let selection = Selection<MutationResult, Unions.OptInFeatureResult> {
      try $0.on(
        optInFeatureError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        optInFeatureSuccess: .init { .success(feature: try $0.feature(selection: featureSelection)) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.optInFeature(input: InputObjects.OptInFeatureInput(name: name),
                          selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case let .success(feature: feature):
          continuation.resume(returning: feature)
        case let .error(errorCode: errorCode):
          if errorCode == .ineligible {
            continuation.resume(throwing: IneligibleError.message(messageText: "You are not eligible for this feature."))
            return
          }
          continuation.resume(throwing: BasicError.message(messageText: errorCode.rawValue))
        }
      }
    }
  }
}
