import CoreData
import Foundation
import Models

public struct InternalUserProfile: Identifiable, Encodable {
  let userID: String
  public let name: String
  public let username: String
  public let profileImageURL: String?

  public var id: String {
    userID
  }

  func persist(context: NSManagedObjectContext) -> NSManagedObjectID? {
    var objectID: NSManagedObjectID?

    context.performAndWait {
      let user = asManagedObject(inContext: context)

      do {
        try context.save()
        logger.debug("User saved succesfully")
        objectID = user.objectID
      } catch {
        context.rollback()
        logger.debug("Failed to save User: \(error.localizedDescription)")
      }
    }

    return objectID
  }

  func asManagedObject(inContext context: NSManagedObjectContext) -> UserProfile {
    let existing = UserProfile.lookup(byID: userID, inContext: context)
    let userProfile = existing ?? UserProfile(entity: UserProfile.entity(), insertInto: context)

    userProfile.userID = userID
    userProfile.name = name
    userProfile.username = username
    userProfile.profileImageURL = profileImageURL
    return userProfile
  }

  public static func makeSingle(_ user: UserProfile?) -> InternalUserProfile? {
    guard
      let user = user,
      let userID = user.userID,
      let name = user.name,
      let username = user.username
    else {
      return nil
    }
    return InternalUserProfile(
      userID: userID,
      name: name,
      username: username,
      profileImageURL: user.profileImageURL
    )
  }

  public static func make(_ users: NSSet?) -> [InternalUserProfile] {
    users?
      .compactMap { user in
        guard
          let user = user as? UserProfile,
          let userID = user.userID,
          let name = user.name,
          let username = user.username
        else {
          return nil
        }
        return InternalUserProfile(
          userID: userID,
          name: name,
          username: username,
          profileImageURL: user.profileImageURL
        )
      } ?? []
  }
}
