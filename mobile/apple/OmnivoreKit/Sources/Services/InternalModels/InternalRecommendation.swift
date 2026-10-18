import CoreData
import Foundation
import Models

public struct InternalRecommendation {
  let groupID: String
  let name: String
  let note: String?
  let user: InternalUserProfile?
  let recommendedAt: Date

  func asManagedObject(inContext context: NSManagedObjectContext) -> Recommendation {
    let recommendation = Recommendation(entity: Recommendation.entity(), insertInto: context)
    recommendation.groupID = groupID
    recommendation.name = name
    recommendation.note = note
    recommendation.recommendedAt = recommendedAt
    recommendation.user = user?.asManagedObject(inContext: context)
    return recommendation
  }

  public static func make(_ recommendations: NSSet?) -> [InternalRecommendation] {
    recommendations?
      .compactMap { recommendation in
        if
          let recommendation = recommendation as? Recommendation,
          let groupID = recommendation.groupID,
          let name = recommendation.name,
          let recommendedAt = recommendation.recommendedAt
        {
          return InternalRecommendation(
            groupID: groupID,
            name: name,
            note: recommendation.note,
            user: InternalUserProfile.makeSingle(recommendation.user),
            recommendedAt: recommendedAt
          )
        }
        return nil
      } ?? []
  }
}
