import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func createHighlight(
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    articleId: String,
    annotation: String? = nil
  ) -> [String: Any]? {
    let internalHighlight = InternalHighlight(
      id: highlightID,
      shortId: shortId,
      quote: quote,
      prefix: nil, suffix: nil,
      patch: patch,
      annotation: annotation,
      createdAt: nil,
      updatedAt: nil,
      createdByMe: true
    )

    internalHighlight.persist(context: backgroundContext, associatedItemID: articleId)

    // Send update to server
    syncHighlightCreation(
      shortId: shortId,
      highlightID: highlightID,
      quote: quote,
      patch: patch,
      articleId: articleId,
      annotation: annotation
    )

    return internalHighlight.encoded()
  }

  func syncHighlightCreation(
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    articleId: String,
    annotation: String?
  ) {
    enum MutationResult {
      case saved(highlight: InternalHighlight)
      case error(errorCode: Enums.CreateHighlightErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateHighlightResult> {
      try $0.on(
        createHighlightSuccess: .init {
          .saved(highlight: try $0.highlight(selection: highlightSelection))
        },
        createHighlightError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createHighlight(
        input: InputObjects.CreateHighlightInput(
          id: highlightID,
          shortId: shortId,
          articleId: articleId,
          patch: patch,
          quote: quote,
          annotation: OptionalArgument(annotation)
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
        fetchRequest.predicate = NSPredicate(
          format: "id == %@", highlightID
        )

        guard let highlight = (try? context.fetch(fetchRequest))?.first else { return }
        highlight.serverSyncStatus = Int64(syncStatus.rawValue)

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
