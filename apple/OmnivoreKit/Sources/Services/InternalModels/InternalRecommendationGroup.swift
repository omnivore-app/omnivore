//
//  InternalRecommendationGroup.swift
//
//
//  Created by Jackson Harper on 12/5/22.
//

import CoreData
import Foundation
import Models

public struct InternalRecommendationGroup: Identifiable {
  public let id: String
  public let name: String
  public let inviteUrl: String
  public let canPost: Bool
  public let canSeeMembers: Bool
  public let admins: [InternalUserProfile]
  public let members: [InternalUserProfile]

  func asManagedObject(inContext context: NSManagedObjectContext) -> RecommendationGroup {
    let fetchRequest: NSFetchRequest<Models.RecommendationGroup> = RecommendationGroup.fetchRequest()
    fetchRequest.predicate = NSPredicate(
      format: "id == %@", id
    )
    let existing = (try? context.fetch(fetchRequest))?.first
    let recommendationGroup = existing ?? RecommendationGroup(entity: RecommendationGroup.entity(), insertInto: context)

    recommendationGroup.id = id
    recommendationGroup.name = name
    recommendationGroup.canPost = canPost
    recommendationGroup.canSeeMembers = canSeeMembers
    recommendationGroup.inviteUrl = inviteUrl

    return recommendationGroup
  }

  public static func make(from recommendationGroup: RecommendationGroup) -> InternalRecommendationGroup? {
    if
      let id = recommendationGroup.id,
      let name = recommendationGroup.name,
      let inviteUrl = recommendationGroup.inviteUrl
    {
      return InternalRecommendationGroup(
        id: id,
        name: name,
        inviteUrl: inviteUrl,
        canPost: recommendationGroup.canPost,
        canSeeMembers: recommendationGroup.canSeeMembers,
        admins: InternalUserProfile.make(recommendationGroup.admins),
        members: InternalUserProfile.make(recommendationGroup.members)
      )
    }
    return nil
  }

  public static func readable(list: [InternalRecommendationGroup]) -> String {
    list.reduce("") { str, group in
      if str.isEmpty {
        return group.name
      } else {
        return str + ", " + group.name
      }
    }
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
