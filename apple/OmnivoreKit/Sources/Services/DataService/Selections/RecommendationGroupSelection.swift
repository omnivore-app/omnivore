import Models
import SwiftGraphQL

let recommendationGroupSelection = Selection.RecommendationGroup {
  InternalRecommendationGroup(
    id: try $0.id(),
    name: try $0.name(),
    inviteUrl: try $0.inviteUrl(),
    admins: try $0.admins(selection: userProfileSelection.list),
    members: try $0.members(selection: userProfileSelection.list)
  )
}
