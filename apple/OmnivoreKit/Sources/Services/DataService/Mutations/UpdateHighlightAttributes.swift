import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func updateHighlightAttributes(
    highlightID: String,
    annotation: String
  ) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let highlight = Highlight.lookup(byID: highlightID, inContext: self.backgroundContext) else { return }

      highlight.update(inContext: self.backgroundContext, newAnnotation: annotation)

      // Send update to server
      self.syncHighlightAttributes(
        highlightID: highlightID,
        objectID: highlight.objectID,
        annotation: annotation
      )
    }
  }

  func syncHighlightAttributes(highlightID: String, objectID: NSManagedObjectID, annotation: String) {
    enum MutationResult {
      case saved(highlight: InternalHighlight)
      case error(errorCode: Enums.UpdateHighlightErrorCode)
    }

    let selection = Selection<MutationResult, Unions.UpdateHighlightResult> {
      try $0.on(
        updateHighlightError: .init { .error(errorCode: try $0.errorCodes().first ?? .badData) },
        updateHighlightSuccess: .init {
          .saved(highlight: try $0.highlight(selection: highlightSelection))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.updateHighlight(
        input: InputObjects.UpdateHighlightInput(
          annotation: OptionalArgument(annotation),
          highlightId: highlightID,
          sharedAt: OptionalArgument(nil)
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { result in
      let data = try? result.get()
      let syncStatus: ServerSyncStatus = data == nil ? .needsUpdate : .isNSync

      context.perform {
        guard let highlight = context.object(with: objectID) as? Highlight else { return }
        highlight.serverSyncStatus = Int64(syncStatus.rawValue)

        do {
          try context.save()
          logger.debug("Highlight updated succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to update Highlight: \(error.localizedDescription)")
        }
      }
    }
  }
}
