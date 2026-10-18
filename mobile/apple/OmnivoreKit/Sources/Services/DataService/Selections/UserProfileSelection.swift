import Models
import SwiftGraphQL

let profileSelection = Selection.Profile {
  (
    username: try $0.username(),
    profileImageURL: try $0.pictureUrl()
  )
}

let userProfileSelection = Selection.User {
  InternalUserProfile(
    userID: try $0.id(),
    name: try $0.name(),
    username: try $0.profile(selection: profileSelection).username,
    profileImageURL: try $0.profile(selection: profileSelection).profileImageURL
  )
}
