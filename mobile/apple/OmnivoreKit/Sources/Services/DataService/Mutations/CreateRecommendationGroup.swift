import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  // swiftlint:disable:next line_length
  func createRecommendationGroup(name: String, onlyAdminCanPost: Bool, onlyAdminCanSeeMembers: Bool) async throws -> InternalRecommendationGroup {
    enum MutationResult {
      case saved(recommendationGroup: InternalRecommendationGroup)
      case error(errorCode: Enums.CreateGroupErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateGroupResult> {
      try $0.on(
        createGroupError: .init {
          .error(errorCode: try $0.errorCodes().first ?? .badRequest)
        },
        createGroupSuccess: .init {
          .saved(recommendationGroup: try $0.group(selection: recommendationGroupSelection))
        }
      )
    }

    let input = InputObjects.CreateGroupInput(expiresInDays: OptionalArgument(14),
                                              name: name,
                                              onlyAdminCanPost: OptionalArgument(onlyAdminCanPost),
                                              onlyAdminCanSeeMembers: OptionalArgument(onlyAdminCanSeeMembers))

    let mutation = Selection.Mutation {
      try $0.createGroup(input: input, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { [weak self] queryResult in
        guard let payload = try? queryResult.get(), let self = self else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case let .saved(recommendationGroup: recommendationGroup):
          if [recommendationGroup].persist(context: self.backgroundContext) != nil {
            continuation.resume(returning: recommendationGroup)
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "CoreData error"))
          }
        case let .error(errorCode: errorCode):
          continuation.resume(throwing: BasicError.message(messageText: errorCode.rawValue))
        }
      }
    }
  }
}
