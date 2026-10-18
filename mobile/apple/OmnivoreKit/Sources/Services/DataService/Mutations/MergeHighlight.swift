import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  // swiftlint:disable:next function_parameter_count
  public func mergeHighlights(
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    articleId: String,
    positionPercent: Double?,
    positionAnchorIndex: Int?,
    overlapHighlightIdList: [String]
  ) -> [String: Any]? {
    let internalHighlight = InternalHighlight(
      id: highlightID,
      type: "HIGHLIGHT",
      shortId: shortId,
      quote: quote,
      prefix: nil,
      suffix: nil,
      patch: patch,
      annotation: nil,
      createdAt: nil,
      updatedAt: nil,
      createdByMe: true,
      createdBy: nil,
      positionPercent: positionPercent,
      positionAnchorIndex: positionAnchorIndex,
      color: nil,
      labels: []
    )

    internalHighlight.persist(
      context: backgroundContext,
      associatedItemID: articleId,
      oldHighlightsIds: overlapHighlightIdList
    )

    // Send update to server
    syncHighlightMerge(highlight: internalHighlight, articleId: articleId, overlapHighlightIdList: overlapHighlightIdList)

    return internalHighlight.encoded()
  }

  // swiftlint:disable:next function_body_length
  func syncHighlightMerge(highlight: InternalHighlight, articleId: String, overlapHighlightIdList: [String]) {
    enum MutationResult {
      case saved(highlight: InternalHighlight)
      case error(errorCode: Enums.MergeHighlightErrorCode)
    }

    let selection = Selection<MutationResult, Unions.MergeHighlightResult> {
      try $0.on(
        mergeHighlightError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) },
        mergeHighlightSuccess: .init {
          .saved(highlight: try $0.highlight(selection: highlightSelection))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.mergeHighlight(
        input: InputObjects.MergeHighlightInput(
          annotation: .absent(),
          articleId: articleId,
          id: highlight.id,
          overlapHighlightIdList: overlapHighlightIdList,
          patch: highlight.patch,
          prefix: .absent(),
          quote: highlight.quote,
          shortId: highlight.shortId,
          suffix: .absent()
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { result in
      let data = try? result.get()
      let isSyncSuccess = data != nil

      context.perform {
        let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", highlight.id)

        guard let highlightObject = (try? context.fetch(fetchRequest))?.first else { return }
        let newHighlightSyncStatus: ServerSyncStatus = data == nil ? .needsCreation : .isNSync
        highlightObject.serverSyncStatus = Int64(newHighlightSyncStatus.rawValue)

        for overlapHighlightID in overlapHighlightIdList {
          let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
          fetchRequest.predicate = NSPredicate(format: "id == %@", overlapHighlightID)

          if let highlightObject = (try? context.fetch(fetchRequest))?.first {
            if isSyncSuccess {
              highlightObject.remove(inContext: context)
              return
            } else {
              highlightObject.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)
            }
          }
        }

        do {
          try context.save()
          logger.debug("Highlight merged succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to create Highlight: \(error.localizedDescription)")
        }
      }
    }
  }
}
