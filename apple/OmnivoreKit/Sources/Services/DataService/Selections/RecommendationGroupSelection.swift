import Models
import SwiftGraphQL

let recommendationGroupSelection = Selection.RecommendationGroup {
  InternalRecommendationGroup(
    id: try $0.id(),
    name: try $0.name(),
    inviteUrl: try $0.inviteUrl()
  )
}
