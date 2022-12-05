//
//  InternalRecommendationGroup.swift
//
//
//  Created by Jackson Harper on 12/5/22.
//

import CoreData
import Foundation
import Models

public struct InternalRecommendationGroup: Encodable, Identifiable {
  public let id: String
  public let name: String
  public let inviteUrl: String

  func asManagedObject(inContext context: NSManagedObjectContext) -> RecommendationGroup {
    let fetchRequest: NSFetchRequest<Models.RecommendationGroup> = RecommendationGroup.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", id
    )
    let existing = (try? context.fetch(fetchRequest))?.first
    let recommendationGroup = existing ?? RecommendationGroup(entity: RecommendationGroup.entity(), insertInto: context)

    recommendationGroup.id = id
    recommendationGroup.name = name
    recommendationGroup.inviteUrl = inviteUrl

    return recommendationGroup
  }

  static func make(from recommendationGroup: RecommendationGroup) -> InternalRecommendationGroup? {
    if let id = recommendationGroup.id,
       let name = recommendationGroup.name,
       let inviteUrl = recommendationGroup.inviteUrl
    {
      return InternalRecommendationGroup(
        id: id,
        name: name,
        inviteUrl: inviteUrl
      )
    }
    return nil
  }
}

extension Sequence where Element == InternalRecommendationGroup {
  func persist(context: NSManagedObjectContext) -> [NSManagedObjectID]? {
    var result: [NSManagedObjectID]?

    context.performAndWait {
      let recommendationGroups = map { $0.asManagedObject(inContext: context) }
      do {
        try context.save()
        logger.debug("InternalRecommendationGroup saved succesfully")
        result = recommendationGroups.map(\.objectID)
      } catch {
        context.rollback()
        logger.debug("Failed to save InternalRecommendationGroups: \(error.localizedDescription)")
      }
    }

    return result
  }
}
