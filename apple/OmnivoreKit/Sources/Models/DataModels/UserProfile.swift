import Foundation
import Utils

public struct UserProfile: Codable {
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

public extension UserProfile {
  static func make(
    username: String,
    name: String,
    bio: String?
  ) -> Either<UserProfile, String> {
    let userProfile = UserProfile(
      username: username,
      name: name,
      bio: bio
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
