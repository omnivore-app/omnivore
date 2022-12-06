import CoreData
import Foundation
import Models

public struct InternalRecommendation {
  let id: String
  let name: String
  let user: InternalUserProfile?
  let recommendedAt: Date

  func asManagedObject(inContext context: NSManagedObjectContext) -> Recommendation {
    let existing = Recommendation.lookup(byID: id, inContext: context)
    let recommendation = existing ?? Recommendation(entity: Recommendation.entity(), insertInto: context)
    recommendation.id = id
    recommendation.name = name
    recommendation.recommendedAt = recommendedAt
    recommendation.user = user?.asManagedObject(inContext: context)
    return recommendation
  }

  public static func make(_ recommendations: NSSet?) -> [InternalRecommendation] {
    recommendations?
      .compactMap { recommendation in
        if let recommendation = recommendation as? Recommendation,
           let id = recommendation.id,
           let name = recommendation.name,
           let recommendedAt = recommendation.recommendedAt
        {
          return InternalRecommendation(
            id: id,
            name: name,
            user: InternalUserProfile.makeSingle(recommendation.user),
            recommendedAt: recommendedAt
          )
        }
        return nil
      } ?? []
  }
}
