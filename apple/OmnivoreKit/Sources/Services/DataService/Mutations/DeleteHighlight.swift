import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func deleteHighlight(highlightID: String) {
    if let highlight = Highlight.lookup(byID: highlightID, inContext: backgroundContext) {
      deleteHighlight(objectID: highlight.objectID)
    }
  }

  private func deleteHighlight(objectID: NSManagedObjectID) {
    // Update CoreData
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let highlight = self.backgroundContext.object(with: objectID) as? Highlight else { return }
      highlight.remove(inContext: self.backgroundContext)

      // Send update to server
      self.syncHighlightDeletion(highlightID: highlight.unwrappedID, objectID: objectID)
    }
  }

  internal func syncHighlightDeletion(highlightID: String, objectID: NSManagedObjectID) {
    enum MutationResult {
      case saved(id: String)
      case error(errorCode: Enums.DeleteHighlightErrorCode)
    }

    let selection = Selection<MutationResult, Unions.DeleteHighlightResult> {
      try $0.on(
        deleteHighlightSuccess: .init {
          .saved(id: try $0.highlight(selection: Selection.Highlight { try $0.id() }))
        },
        deleteHighlightError: .init { .error(errorCode: try $0.errorCodes().first ?? .unauthorized) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.deleteHighlight(
        highlightId: highlightID,
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
        guard let highlight = context.object(with: objectID) as? Highlight else { return }

        if isSyncSuccess {
          highlight.remove(inContext: context)
        } else {
          highlight.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)
        }

        do {
          try context.save()
          logger.debug("Highlight deleted succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to delete Highlight: \(error.localizedDescription)")
        }
      }
    }
  }
}
