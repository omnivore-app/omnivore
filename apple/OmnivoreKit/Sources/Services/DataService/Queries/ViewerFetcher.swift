import CoreData
import Foundation
import Models
import SwiftGraphQL
import Utils

public extension DataService {
  func fetchViewer() async throws -> NSManagedObjectID {
    let selection = Selection<ViewerInternal, Objects.User> {
      ViewerInternal(
        userID: try $0.id(),
        username: try $0.profile(
          selection: .init { try $0.username() }
        ),
        name: try $0.name(),
        profileImageURL: try $0.profile(
          selection: .init { try $0.pictureUrl() }
        )
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
        case let .success(payload):
          if UserDefaults.standard.string(forKey: Keys.userIdKey) == nil {
            UserDefaults.standard.setValue(payload.data.userID, forKey: Keys.userIdKey)
            DataService.registerIntercomUser?(payload.data.userID)
          }

          if let self = self, let viewerID = payload.data.persist(context: self.backgroundContext) {
            continuation.resume(returning: viewerID)
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "coredata error"))
          }
        case .failure:
          continuation.resume(throwing: BasicError.message(messageText: "http error"))
        }
      }
    }
  }
}

private struct ViewerInternal {
  let userID: String
  let username: String
  let name: String
  let profileImageURL: String?

  func persist(context: NSManagedObjectContext) -> NSManagedObjectID? {
    var objectID: NSManagedObjectID?

    context.performAndWait {
      let viewer = Viewer(context: context)
      viewer.userID = userID
      viewer.username = username
      viewer.name = name
      viewer.profileImageURL = profileImageURL

      do {
        try context.save()
        logger.debug("Viewer saved succesfully")
        objectID = viewer.objectID
        EventTracker.registerUser(userID: viewer.unwrappedUserID)
      } catch {
        context.rollback()
        logger.debug("Failed to save Viewer: \(error.localizedDescription)")
      }
    }

    return objectID
  }
}
