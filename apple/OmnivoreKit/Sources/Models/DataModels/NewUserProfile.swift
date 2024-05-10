import Foundation
import Utils

public struct NewUserProfile: Codable {
  public let username: String
  public let name: String
  public let bio: String?

  public init(
    username: String,
    name: String,
    bio: String? = nil
  ) {
    self.username = username
    self.name = name
    self.bio = bio
  }
}

public extension NewUserProfile {
  static func make(
    username: String,
    name: String
  ) -> Either<NewUserProfile, String> {
    let userProfile = NewUserProfile(
      username: username,
      name: name,
      bio: nil
    )

    if let errorMessage = userProfile.validationErrorMessage {
      return .right(errorMessage)
    } else {
      return .left(userProfile)
    }
  }

  private var validationErrorMessage: String? {
    if name.isEmpty {
      return "The name field is missing."
    }

    return nil
  }
}

public extension Viewer {
  var unwrappedUsername: String { username ?? "" }
  var unwrappedName: String { name ?? "" }
  var unwrappedUserID: String { userID ?? "" }
}
