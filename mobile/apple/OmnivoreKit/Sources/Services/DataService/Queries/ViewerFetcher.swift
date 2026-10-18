import CoreData
import Foundation
import Models
import SwiftGraphQL
import Utils

public extension DataService {
  @MainActor
  func fetchViewer() async throws -> ViewerInternal? {
    let selection = Selection<ViewerInternal, Objects.User> {
      ViewerInternal(
        userID: try $0.id(),
        username: try $0.profile(
          selection: .init { try $0.username() }
        ),
        name: try $0.name(),
        profileImageURL: try $0.profile(
          selection: .init { try $0.pictureUrl() }
        ),
        intercomHash: try $0.intercomHash(),
        enabledFeatures: try $0.featureList(selection: featureSelection.list.nullable)?.filter { $0.enabled }.map { $0.name }
      )
    }

    let query = Selection.Query {
      try $0.me(selection: selection.nonNullOrFail)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { [weak self] result in
        switch result {
        case let .success(payload: payload):
          if UserDefaults.standard.string(forKey: Keys.userIdKey) == nil {
            UserDefaults.standard.setValue(payload.data.userID, forKey: Keys.userIdKey)
            DataService.registerIntercomUser?(payload.data.userID)
          }

          do {
            if let intercomUserHash = payload.data.intercomHash {
              DataService.setIntercomUserHash?(intercomUserHash)
            }

            if let self = self {
              try payload.data.persist(context: self.backgroundContext)
              continuation.resume(returning: payload.data)
            } else {
              continuation.resume(throwing: BasicError.message(messageText: "no self found"))
            }
          } catch {
            continuation.resume(throwing: BasicError.message(messageText: "coredata error"))
          }
        case .failure:
          continuation.resume(throwing: BasicError.message(messageText: "http error"))
        }
      }
    }
  }
}

public struct ViewerInternal {
  public let userID: String
  public let username: String
  public let name: String
  public let profileImageURL: String?
  public let intercomHash: String?
  public let enabledFeatures: [String]? // We don't persist these as they can be dynamic

  public func hasFeatureGranted(_ name: String) -> Bool {
    return enabledFeatures?.contains(name) ?? false
  }

  func persist(context: NSManagedObjectContext) throws {
    try context.performAndWait {
      let viewer = Viewer(context: context)
      viewer.userID = userID
      viewer.username = username
      viewer.name = name
      viewer.profileImageURL = profileImageURL

      do {
        try context.save()
        logger.debug("Viewer saved succesfully")
      } catch {
        context.rollback()
        logger.debug("Failed to save Viewer: \(error.localizedDescription)")
        throw error
      }
    }
    DispatchQueue.main.async {
      EventTracker.registerUser(userID: userID)
    }
  }
}
