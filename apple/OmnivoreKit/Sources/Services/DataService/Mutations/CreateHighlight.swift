import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  // swiftlint:disable:next function_parameter_count
  func createHighlight(
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    articleId: String,
    positionPercent: Double?,
    positionAnchorIndex: Int?,
    annotation: String? = nil,
    color: String? = nil
  ) -> [String: Any]? {
    let internalHighlight = InternalHighlight(
      id: highlightID,
      type: "HIGHLIGHT",
      shortId: shortId,
      quote: quote,
      prefix: nil, suffix: nil,
      patch: patch,
      annotation: annotation,
      createdAt: nil,
      updatedAt: nil,
      createdByMe: true,
      createdBy: nil,
      positionPercent: positionPercent,
      positionAnchorIndex: positionAnchorIndex,
      color: color,
      labels: []
    )

    internalHighlight.persist(context: backgroundContext, associatedItemID: articleId)

    // Send update to server
    syncHighlightCreation(highlight: internalHighlight, articleId: articleId)

    return internalHighlight.encoded()
  }

  func createNote(
    shortId: String,
    highlightID: String,
    articleId: String,
    annotation: String
  ) -> [String: Any]? {
    let internalHighlight = InternalHighlight(
      id: highlightID,
      type: "NOTE",
      shortId: shortId,
      quote: "",
      prefix: nil, suffix: nil,
      patch: "",
      annotation: annotation,
      createdAt: nil,
      updatedAt: nil,
      createdByMe: true,
      createdBy: nil,
      positionPercent: nil,
      positionAnchorIndex: nil,
      color: nil,
      labels: []
    )

    internalHighlight.persist(context: backgroundContext, associatedItemID: articleId)
    syncHighlightCreation(highlight: internalHighlight, articleId: articleId)

    return internalHighlight.encoded()
  }

  internal func syncHighlightCreation(highlight: InternalHighlight, articleId: String) {
    enum MutationResult {
      case saved(highlight: InternalHighlight)
      case error(errorCode: Enums.CreateHighlightErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateHighlightResult> {
      try $0.on(
        createHighlightError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) },
        createHighlightSuccess: .init {
          .saved(highlight: try $0.highlight(selection: highlightSelection))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createHighlight(
        input: InputObjects.CreateHighlightInput(
          annotation: OptionalArgument(highlight.annotation),
          articleId: articleId,
          highlightPositionAnchorIndex: OptionalArgument(highlight.positionAnchorIndex),
          highlightPositionPercent: OptionalArgument(highlight.positionPercent), id: highlight.id,
          patch: OptionalArgument(highlight.patch.isEmpty ? nil : highlight.patch),
          quote: OptionalArgument(highlight.quote.isEmpty ? nil : highlight.quote),
          shortId: highlight.shortId,
          type: OptionalArgument(highlight.type == "NOTE" ? Enums.HighlightType.note : Enums.HighlightType.highlight)
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { result in
      let data = try? result.get()
      let syncStatus: ServerSyncStatus = data == nil ? .needsCreation : .isNSync

      context.perform {
        let fetchRequest: NSFetchRequest<Models.Highlight> = Highlight.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", highlight.id)

        guard let highlightObject = (try? context.fetch(fetchRequest))?.first else { return }
        highlightObject.serverSyncStatus = Int64(syncStatus.rawValue)

        do {
          try context.save()
          logger.debug("Highlight created succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to create Highlight: \(error.localizedDescription)")
        }
      }
    }
  }
}
